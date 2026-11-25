// BUILD 95: order-rule checks (server pricing limits + client handling of a
// refused order). Run with `npm test`.
import assert from 'node:assert/strict';
import { priceItems } from '../api/_lib/server.js';
import { createOrderViaApi } from '../src/lib/apiOrders.js';

const products = [
  { id: 'steel', name: 'TMT', price: 60, stock: 1100, type: 'steel', enabled: true,
    sizes: [{ size: '8 mm', price: 61, stock: 350 }] },
  { id: 'cement', name: 'Cement', price: 375, stock: 500, type: 'cement', enabled: true },
];

// A normal bulk order (300 kg of 8 mm steel) must be accepted — the old cap of 100 refused it.
let r = priceItems([{ productId: 'steel', size: '8 mm', quantity: 300 }], products);
assert.equal(r.ok, true, r.error);
assert.equal(r.itemsTotal, 300 * 61);
// Prices always come from the server list, never the browser.
r = priceItems([{ productId: 'cement', quantity: 2, price: 1 }], products);
assert.equal(r.itemsTotal, 750);
// Over stock, zero, negative, fractional and absurd quantities are refused.
for (const quantity of [351, 0, -5, 1.5, 10001, '3']) {
  r = priceItems([{ productId: 'steel', size: '8 mm', quantity }], products);
  assert.equal(r.ok, false, `quantity ${quantity} should be refused`);
}
// Unknown size refused.
assert.equal(priceItems([{ productId: 'steel', size: '99 mm', quantity: 1 }], products).ok, false);

// Client: a 400 from the server is a refusal (no silent fallback), 503 / network = fallback.
const realFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'Only 350 left of TMT.' }), { status: 400 });
  assert.deepEqual(await createOrderViaApi({}), { rejected: true, error: 'Only 350 left of TMT.' });
  globalThis.fetch = async () => new Response('{}', { status: 429 });
  assert.equal((await createOrderViaApi({})).rejected, true);
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'server_not_configured' }), { status: 503 });
  assert.equal(await createOrderViaApi({}), null);
  globalThis.fetch = async () => { throw new Error('offline'); };
  assert.equal(await createOrderViaApi({}), null);
  globalThis.fetch = async () => new Response(JSON.stringify({ orderId: 'HSN-1', total: 10, items: [{ productId: 'cement', quantity: 1, unitPrice: 10 }] }), { status: 201 });
  const ok = await createOrderViaApi({});
  assert.equal(ok.orderId, 'HSN-1');
} finally {
  globalThis.fetch = realFetch;
}
console.log('Order rule checks passed.');
