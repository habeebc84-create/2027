import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('service worker purges old app caches and never caches API responses', async () => {
  const events = {};
  const deleted = [];
  const requests = [];
  vm.runInNewContext(await readFile(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    URL,
    self: { location: { origin: 'https://test.invalid' }, addEventListener: (name, callback) => { events[name] = callback; }, clients: { claim() {} } },
    caches: { keys: async () => ['hsn-pwa-v60', 'hsn-pwa-v61', 'other-app'], delete: async key => deleted.push(key), match() { throw new Error('API must bypass cache'); } },
    fetch: async (request, init) => { requests.push({ request, init }); return { ok: true }; },
  });
  let work;
  events.activate({ waitUntil(promise) { work = promise; } });
  await work;
  assert.deepEqual(deleted, ['hsn-pwa-v60']);
  for (const mode of ['cors', 'navigate']) {
    events.fetch({ request: { method: 'GET', mode, url: 'https://test.invalid/api/track?orderId=HSN-TEST&mobile=9876543210' }, respondWith(promise) { work = promise; } });
    await work;
  }
  assert.equal(requests.length, 2);
  assert.equal(requests[0].init.cache, 'no-store');
});
