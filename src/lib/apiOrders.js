/**
 * Create an order through the server.
 * Null = backend not live (404/503/network); the caller falls back.
 * { rejected: true, error } = the server refused the order (400/429); the
 * caller must NOT fall back, or the server checks could be skipped.
 */
export async function createOrderViaApi(payload) {
    let data = null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: ctrl.signal,
        });
        if (res.status === 400 || res.status === 429) {
            const body = await res.json().catch(() => null);
            const error = body && typeof body.error === 'string' ? body.error.slice(0, 200) : '';
            return { rejected: true, error };
        }
        data = res.ok ? await res.json().catch(() => null) : null;
    }
    catch {
        data = null;
    }
    finally {
        clearTimeout(timer);
    }
    if (!data || typeof data !== 'object')
        return null;
    const d = data;
    if (typeof d.orderId !== 'string' || typeof d.total !== 'number')
        return null;
    if (!Array.isArray(d.items))
        return null;
    const items = [];
    for (const raw of d.items) {
        if (raw &&
            typeof raw.productId === 'string' &&
            typeof raw.quantity === 'number' &&
            typeof raw.unitPrice === 'number') {
            items.push({
                productId: raw.productId,
                size: typeof raw.size === 'string' ? raw.size : undefined,
                quantity: raw.quantity,
                unitPrice: raw.unitPrice,
            });
        }
    }
    return { orderId: d.orderId, total: d.total, items };
}
/** Track one order through the server. 'unavailable' = backend not live. */
export async function trackOrderViaApi(orderId, mobile) {
    const params = new URLSearchParams({ orderId });
    if (mobile)
        params.set('mobile', mobile);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
        const res = await fetch(`/api/track?${params.toString()}`, {
            signal: ctrl.signal,
        });
        if (res.status === 404)
            return { kind: 'not_found' };
        if (res.status === 403)
            return { kind: 'mismatch' };
        if (!res.ok)
            return { kind: 'unavailable' };
        const data = (await res.json());
        const order = data.order;
        if (!order || typeof order.orderId !== 'string' || !Array.isArray(order.items)) {
            return { kind: 'unavailable' };
        }
        return { kind: 'ok', order: order };
    }
    catch {
        return { kind: 'unavailable' };
    }
    finally {
        clearTimeout(timer);
    }
}
