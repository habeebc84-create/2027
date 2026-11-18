import { getServiceClient, json, rateLimited, readJsonBody } from './_lib/server.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (rateLimited(req, 'inquiries', 10, 60_000)) return json(res, 429, { error: 'Please try again in a minute.' });
  const { id, name, mobile, materialNeeded, message } = readJsonBody(req);
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id) ||
      typeof name !== 'string' || !name.trim() || name.length > 100 ||
      typeof mobile !== 'string' || !/^[6-9]\d{9}$/.test(mobile) ||
      typeof materialNeeded !== 'string' || materialNeeded.length > 100 ||
      typeof message !== 'string' || message.length > 2000) {
    return json(res, 400, { error: 'Please check your inquiry details.' });
  }
  const notification = {
    id: `inquiry-${id}`, title: `Inquiry: ${name.trim()}`,
    content: `${materialNeeded} — ${message || 'No notes'} — Mobile: ${mobile}`,
    type: 'inquiry', active: true, read: false, createdAt: new Date().toISOString(),
  };
  try {
    const client = getServiceClient();
    if (!client) throw new Error('unavailable');
    const { error } = await client.from('hsn_private_notifications').upsert(
      { id: notification.id, data: notification }, { onConflict: 'id', ignoreDuplicates: true },
    );
    if (error) throw error;
    return json(res, 201, { ok: true });
  } catch {
    return json(res, 503, { error: 'Could not send your inquiry. Please try again.' });
  }
}
