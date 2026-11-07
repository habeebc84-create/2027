import { getSupabaseClient } from './remoteContent';
export const ORDERS_TABLE = 'hsn_orders';
function rowToOrder(row) {
    const data = row.data;
    if (!data || typeof data !== 'object')
        return null;
    const order = data;
    if (!order.orderId || !Array.isArray(order.items))
        return null;
    return {
        ...order,
        id: row.id || order.id,
        orderId: row.order_id || order.orderId,
        status: row.status || order.status,
        total: typeof row.total === 'number' ? row.total : order.total,
        date: order.date || row.placed_at,
        timeline: Array.isArray(order.timeline) ? order.timeline : [],
    };
}
function orderToRow(order) {
    return {
        id: order.id,
        order_id: order.orderId,
        status: order.status,
        total: order.total,
        placed_at: order.date || new Date().toISOString(),
        data: order,
        updated_at: new Date().toISOString(),
    };
}
/** All orders in Postgres, newest first. Null = table missing / blocked / offline. */
export async function fetchOrdersDb() {
    const client = getSupabaseClient();
    if (!client)
        return null;
    try {
        const { data, error } = await client
            .from(ORDERS_TABLE)
            .select('*')
            .order('placed_at', { ascending: false });
        if (error)
            return null;
        const orders = [];
        for (const row of (data || [])) {
            const order = rowToOrder(row);
            if (order)
                orders.push(order);
        }
        return orders;
    }
    catch {
        return null;
    }
}
/** Insert a new order (upsert on order_id, so a retry cannot duplicate it). */
export async function insertOrderDb(order) {
    const client = getSupabaseClient();
    if (!client)
        return false;
    try {
        const { error } = await client
            .from(ORDERS_TABLE)
            .upsert(orderToRow(order), { onConflict: 'order_id' });
        return !error;
    }
    catch {
        return false;
    }
}
/** Upsert a changed order (status, final charge, ...). Upsert, not update, so a
 *  pre-migration order that is not in Postgres yet lands there on its first edit. */
export async function updateOrderDb(order) {
    return insertOrderDb(order);
}
export async function deleteOrderDb(orderId) {
    const client = getSupabaseClient();
    if (!client)
        return false;
    try {
        const { error } = await client.from(ORDERS_TABLE).delete().eq('order_id', orderId);
        return !error;
    }
    catch {
        return false;
    }
}
/**
 * Merge Postgres orders into the local list, using the same rule as the JSON
 * cloud merge: a Postgres copy with a longer/newer timeline overwrites the
 * local copy; Postgres orders missing locally are added; tombstoned
 * (admin-deleted) orders are dropped. Never deletes a local order just
 * because Postgres does not have it yet — that is how pre-migration orders
 * survive until they are upserted.
 */
export function mergeDbOrders(prev, dbOrders, deletedIds) {
    const dbById = new Map();
    const dbByOrderId = new Map();
    for (const o of dbOrders) {
        dbById.set(o.id, o);
        dbByOrderId.set(o.orderId, o);
    }
    const survivors = prev.filter(o => !deletedIds.has(o.orderId));
    let changed = survivors.length !== prev.length;
    const updated = survivors.map(local => {
        const db = dbById.get(local.id) || dbByOrderId.get(local.orderId);
        if (!db || deletedIds.has(db.orderId))
            return local;
        const localLast = local.timeline?.[local.timeline.length - 1]?.date || '';
        const dbLast = db.timeline?.[db.timeline.length - 1]?.date || '';
        const dbIsNewer = (db.timeline?.length || 0) > (local.timeline?.length || 0) ||
            (dbLast && localLast && dbLast > localLast);
        if (dbIsNewer) {
            changed = true;
            return db;
        }
        return local;
    });
    const ids = new Set(updated.map(o => o.id));
    const orderIds = new Set(updated.map(o => o.orderId));
    const missing = dbOrders.filter(o => !ids.has(o.id) && !orderIds.has(o.orderId) && !deletedIds.has(o.orderId));
    if (missing.length > 0)
        changed = true;
    if (!changed)
        return prev;
    return [...updated, ...missing].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
