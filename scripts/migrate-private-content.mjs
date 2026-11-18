// Run after applying supabase/hsn_orders_auth.sql and deploying this release.
import { createClient } from '@supabase/supabase-js';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.');
}
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const bucket = client.storage.from('site-content');
async function download() {
  const { data, error } = await bucket.download('site-content.json');
  if (error) throw error;
  return data.text();
}
const original = await download();
const content = JSON.parse(original);
const backupDirectory = await mkdtemp(join(tmpdir(), 'hsn-private-content-'));
await writeFile(join(backupDirectory, 'site-content.json'), original, { mode: 0o600 });
console.log(`Private backup saved in ${backupDirectory}`);
const deleted = new Set(content.deletedOrders || []);
const orders = (content.orders || []).filter(order => !deleted.has(order.orderId));
for (const order of orders) {
  const { error } = await client.from('hsn_orders').upsert({
    id: order.id, order_id: order.orderId, status: order.status,
    total: order.total, placed_at: order.date, data: order,
  }, { onConflict: 'order_id', ignoreDuplicates: true });
  if (error) throw error;
}
const privateNotifications = (content.notifications || []).filter(n => n.type === 'order' || n.type === 'inquiry');
for (const notification of privateNotifications) {
  const { error } = await client.from('hsn_private_notifications').upsert(
    { id: notification.id, data: notification }, { onConflict: 'id', ignoreDuplicates: true },
  );
  if (error) throw error;
}
// Do not overwrite a concurrently edited public snapshot.
if (await download() !== original) {
  throw new Error('Site content changed during migration. Run again after the current admin edit finishes.');
}
delete content.orders;
delete content.deletedOrders;
delete content.customers;
content.deletedNotifications = (content.deletedNotifications || []).filter(id => !id.startsWith('order-') && !id.startsWith('inquiry-'));
content.notifications = (content.notifications || []).filter(n => n.type !== 'order' && n.type !== 'inquiry');
const { error } = await bucket.upload('site-content.json', JSON.stringify(content), {
  upsert: true, contentType: 'application/json', cacheControl: '0',
});
if (error) throw error;
const version = await bucket.upload('version.txt', String(Date.now()), { upsert: true, contentType: 'text/plain', cacheControl: '0' });
if (version.error) throw version.error;
console.log(`Migrated ${orders.length} orders and ${privateNotifications.length} private notifications. Public snapshot cleaned.`);
