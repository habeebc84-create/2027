import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';

process.env.SUPABASE_URL = 'https://test.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
const { default: ordersHandler } = await import('../api/orders.js');
const { default: trackHandler } = await import('../api/track.js');
const { default: inquiryHandler } = await import('../api/inquiries.js');
const product = { id: 'cement', name: 'Cement', price: 400, stock: 100, type: 'cement' };
const payload = {
  items: [{ productId: product.id, quantity: 2 }],
  customer: { name: 'Customer', mobile: '9876543210', address: 'Private address', landmark: 'Private landmark' },
  paymentMode: 'Cash on Delivery', deliveryMethod: 'delivery', deliveryLocation: 'Town', deliveryNote: 'Private note',
};
const records = new Map();
let rejectWrites = false;
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
function databaseFetch(input, init = {}) {
  const url = new URL(typeof input === 'string' ? input : input.url);
  if (url.pathname.includes('/storage/')) return Promise.resolve(reply({ products: [product], transportZones: [{ name: 'Town', charge: 100 }] }));
  if (init.method === 'HEAD') return Promise.resolve(new Response(null, { headers: { 'content-range': '0-0/0' } }));
  if (init.method === 'POST') {
    if (rejectWrites) return Promise.resolve(reply({ code: 'XX000' }, 500));
    const row = JSON.parse(init.body);
    const key = row.checkout_key || row.id;
    if (records.has(key)) return Promise.resolve(reply({ code: '23505' }, 409));
    records.set(key, row);
    return Promise.resolve(new Response(null, { status: 201 }));
  }
  if (url.searchParams.has('checkout_key')) {
    const row = records.get(url.searchParams.get('checkout_key').slice(3));
    // Supabase maybeSingle requests an array and unwraps it.
    return Promise.resolve(reply(row ? [row] : []));
  }
  const id = url.searchParams.get('order_id')?.slice(3);
  return Promise.resolve(reply([...records.values()].filter(row => row.order_id === id)));
}
async function invoke(handler, body, query = {}, method = 'POST') {
  const response = { headers: {}, status(code) { this.code = code; return this; }, json(value) { this.body = value; }, setHeader(key, value) { this.headers[key] = value; } };
  await handler({ method, body, query, headers: { 'x-forwarded-for': randomUUID() } }, response);
  return response;
}

test('server persists verified totals once across retries and concurrent submissions', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = databaseFetch;
  try {
    const body = { ...payload, total: 1, checkoutKey: randomUUID() };
    const results = await Promise.all([invoke(ordersHandler, body), invoke(ordersHandler, body)]);
    assert.deepEqual(results.map(r => r.code).sort(), [200, 201]);
    assert.equal(results[0].body.orderId, results[1].body.orderId);
    assert.equal(records.size, 1);
    assert.equal(results[0].body.total, 910);
    assert.equal(results[0].body.order.deliveryCharge, 100);
    const retry = await invoke(ordersHandler, body);
    assert.equal(retry.body.orderId, results[0].body.orderId);
    assert.equal((await invoke(ordersHandler, { ...body, deliveryNote: 'Changed' })).code, 409);
    assert.equal((await invoke(ordersHandler, { ...payload, checkoutKey: randomUUID(), items: [] })).code, 400);
    assert.equal((await invoke(ordersHandler, 'null')).code, 400);
    rejectWrites = true;
    assert.equal((await invoke(ordersHandler, { ...payload, checkoutKey: randomUUID() })).code, 503);
    rejectWrites = false;
    const id = results[0].body.orderId;
    const publicResult = await invoke(trackHandler, null, { orderId: id.toLowerCase() }, 'GET');
    assert.equal(publicResult.code, 200);
    assert.equal(publicResult.body.order.customer.mobile, '');
    assert.equal(publicResult.body.order.deliveryNote, '');
    assert.equal(publicResult.headers['Cache-Control'], 'no-store');
    const privateResult = await invoke(trackHandler, null, { orderId: id, mobile: payload.customer.mobile }, 'GET');
    assert.equal(privateResult.body.order.customer.address, payload.customer.address);
    assert.equal(privateResult.headers['Cache-Control'], 'no-store');
    assert.equal((await invoke(trackHandler, null, { orderId: id, mobile: '9999999999' }, 'GET')).code, 403);
    assert.equal((await invoke(trackHandler, null, { orderId: '%' }, 'GET')).code, 400);
    const inquiry = await invoke(inquiryHandler, { id: randomUUID(), name: 'Customer', mobile: '9876543210', materialNeeded: 'Cement', message: 'Call me' });
    assert.equal(inquiry.code, 201);
    rejectWrites = true;
    assert.equal((await invoke(inquiryHandler, { id: randomUUID(), name: 'Customer', mobile: '9876543210', materialNeeded: 'Cement', message: '' })).code, 503);
  } finally {
    rejectWrites = false;
    globalThis.fetch = originalFetch;
  }
});

test('browser rejects errors, preserves retry keys across reloads, and clears only after success', async () => {
  const originalFetch = globalThis.fetch;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const { createOrderViaApi, completeCheckout } = await import('../src/lib/apiOrders.js');
  const keys = [];
  try {
    for (const status of [400, 429, 503]) {
      globalThis.fetch = async (_, init) => { keys.push(JSON.parse(init.body).checkoutKey); return reply({ error: `Failure ${status}` }, status); };
      await assert.rejects(createOrderViaApi(payload), new RegExp(`Failure ${status}`));
    }
    globalThis.fetch = async (_, init) => { keys.push(JSON.parse(init.body).checkoutKey); throw new Error('connection dropped'); };
    await assert.rejects(createOrderViaApi(payload), /Could not confirm/);
    const reloaded = await import('../src/lib/apiOrders.js?reload');
    await assert.rejects(reloaded.createOrderViaApi(payload), /Could not confirm/);
    assert.equal(new Set(keys).size, 1);
    globalThis.fetch = async (_, init) => {
      keys.push(JSON.parse(init.body).checkoutKey);
      return reply({ order: { orderId: 'HSN-TEST', total: 910, items: [], customer: payload.customer } }, 201);
    };
    await createOrderViaApi(payload);
    assert.equal(new Set(keys).size, 1);
    completeCheckout();
    await createOrderViaApi(payload);
    assert.notEqual(keys.at(-1), keys[0]);
    completeCheckout();
  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.localStorage;
  }
});
