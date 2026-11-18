const CHECKOUT_STORAGE_KEY = 'hsn_pending_checkout';
let pendingCheckout = null;

/** Persist the key before sending, including across a reload after a timeout. */
function checkoutKeyFor(payload) {
    const fingerprint = JSON.stringify(payload);
    try {
        pendingCheckout = JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || pendingCheckout;
    } catch { /* Use the in-memory key when storage is unavailable. */ }
    if (pendingCheckout?.fingerprint !== fingerprint) {
        pendingCheckout = { fingerprint, key: crypto.randomUUID() };
    }
    try {
        localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(pendingCheckout));
    } catch { /* Retain the key for retries in this page. */ }
    return pendingCheckout.key;
}

export function completeCheckout() {
    pendingCheckout = null;
    try { localStorage.removeItem(CHECKOUT_STORAGE_KEY); } catch { /* Storage unavailable. */ }
}

/** Reject failed or ambiguous responses so the caller retains the cart. */
export async function createOrderViaApi(payload) {
    const checkoutKey = checkoutKeyFor(payload);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    let response;
    let data;
    try {
        response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, checkoutKey }),
            signal: ctrl.signal,
            cache: 'no-store',
        });
        data = await response.json();
    } catch {
        throw new Error('Could not confirm your order. Please retry with the same details.');
    } finally {
        clearTimeout(timer);
    }
    if (!response.ok) {
        const message = typeof data?.error === 'string' && data.error !== 'server_not_configured'
            ? data.error : 'Checkout is temporarily unavailable. Please try again later.';
        throw new Error(message);
    }
    const order = data?.order;
    if (!order || typeof order.orderId !== 'string' || !Number.isFinite(order.total) ||
        !Array.isArray(order.items) || !order.customer) {
        throw new Error('Could not confirm your order. Please retry with the same details.');
    }
    return data;
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
            cache: 'no-store',
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
