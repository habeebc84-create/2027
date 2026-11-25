// BUILD 96 security regression checks (no network, no Supabase needed).
import assert from 'node:assert/strict';
import track from '../api/track.js';
import orders from '../api/orders.js';

function mockRes() {
  return { code: 0, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, setHeader() {} };
}
const req = (o) => ({ headers: { 'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 250)}` }, ...o });

// 1) Wildcard / malformed order ids must never reach the ILIKE query.
for (const id of ['%', 'HSN-%', '_', 'HSN-2026-_____-%', 'x'.repeat(80), "HSN-1' or 1=1"]) {
  const res = mockRes();
  await track(req({ method: 'GET', query: { orderId: id } }), res);
  assert.equal(res.code, 404, `track should refuse ${id}`);
}
// 2) Non-numeric mobile is refused before any lookup.
{
  const res = mockRes();
  await track(req({ method: 'GET', query: { orderId: 'HSN-2026-00001-ABC', mobile: '9x' } }), res);
  assert.equal(res.code, 400);
}
// 3) Oversized / malformed customer fields are refused before pricing.
const good = { name: 'A', mobile: '9876543210', address: 'Street', landmark: 'Temple' };
for (const bad of [
  { ...good, address: 'a'.repeat(501) },
  { ...good, landmark: 'l'.repeat(201) },
  { ...good, village: 'v'.repeat(121) },
  { ...good, email: 'not-an-email' },
  { ...good, mobile: '12345' },
]) {
  const res = mockRes();
  await orders(req({ method: 'POST', body: { customer: bad, paymentMode: 'Cash on Delivery', deliveryMethod: 'pickup', items: [] } }), res);
  assert.equal(res.code, 400, `orders should refuse ${JSON.stringify(bad).slice(0, 60)}`);
}
// 4) Wrong method.
{ const res = mockRes(); await orders(req({ method: 'GET' }), res); assert.equal(res.code, 405); }
console.log('Security checks passed.');
