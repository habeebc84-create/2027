/**
 * GET /api/track?orderId=HSN-...&mobile=10digits — track one order.
 *
 * Status, timeline and total are public with just the order ID (so a QR
 * scan still shows live status). Delivery address and phone are personal
 * data: they are only included when the mobile number matches the order —
 * the same rule the site already applies on the tracking page (BUILD 80),
 * now enforced on the server instead of in the browser.
 *
 * Responses:
 *   200 { order } — full order when the mobile matches, otherwise the
 *       same order with the customer fields blanked.
 *   403 { error: 'mobile_mismatch' } — a mobile was given and it does
 *       not match this order.
 *   404 { error: 'not_found' } — no such order in Postgres.
 *   503 { error: 'server_not_configured' } — service key missing or the
 *       hsn_orders table does not exist yet; the site falls back to its
 *       current on-device tracking.
 */
import { getServiceClient, json, rateLimited } from './_lib/server.js';

const BLANK_CUSTOMER = {
  name: '',
  mobile: '',
  email: '',
  address: '',
  village: '',
  mandal: '',
  pincode: '',
  landmark: '',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed.' });
  }
  if (rateLimited(req, 'track', 30, 60_000)) {
    return json(res, 429, { error: 'Too many requests. Please try again in a minute.' });
  }
  const query = req.query || {};
  const rawId = query.orderId;
  const orderId = (Array.isArray(rawId) ? rawId[0] : rawId || '').trim();
  if (!orderId) return json(res, 400, { error: 'Order ID is required.' });
  const rawMobile = query.mobile;
  const mobile = (Array.isArray(rawMobile) ? rawMobile[0] : rawMobile || '').trim();

  const client = getServiceClient();
  if (!client) {
    return json(res, 503, { error: 'server_not_configured' });
  }
  const { data, error } = await client
    .from('hsn_orders')
    .select('*')
    .ilike('order_id', orderId)
    .limit(1);
  if (error) {
    return json(res, 503, { error: 'server_not_configured' });
  }
  const row = (data || [])[0];
  if (!row || !row.data || typeof row.data !== 'object') {
    return json(res, 404, { error: 'not_found' });
  }
  const order = row.data;
  const customer = order.customer || {};
  const orderMobile = typeof customer.mobile === 'string' ? customer.mobile : '';
  if (mobile && mobile !== orderMobile) {
    return json(res, 403, { error: 'mobile_mismatch' });
  }
  const unlocked = Boolean(mobile) && mobile === orderMobile;
  return json(res, 200, {
    order: {
      ...order,
      orderId: row.order_id || order.orderId,
      status: row.status || order.status,
      total: typeof row.total === 'number' ? row.total : order.total,
      customer: unlocked ? customer : BLANK_CUSTOMER,
    },
  });
}
