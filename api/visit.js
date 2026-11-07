/**
 * POST /api/visit — record one anonymous page view (Visitor Intelligence).
 *
 * The browser sends a random visitor id (stored in its own localStorage),
 * the page it is on, the referrer and any UTM campaign. The server adds
 * what the browser cannot know honestly: the visitor's city / region /
 * country from Vercel's geo headers, device / browser / OS from the
 * user-agent, whether this visitor has been seen before, and whether the
 * caller looks like a bot. No IP address is ever stored, and no name,
 * phone or email is ever asked for — a visitor is never identified as a
 * person, only counted.
 *
 * Responses:
 *   201 { ok: true, returning: bool } — visit saved in Postgres.
 *   400 { error } — missing / invalid visitor id or page.
 *   405 — not POST.  429 — too many visits from this address.
 *   503 { error: 'server_not_configured' } — service key missing or the
 *       hsn_visits table does not exist yet (run supabase/hsn_visits.sql
 *       and add SUPABASE_SERVICE_ROLE_KEY in Vercel). The tracker on the
 *       site silently skips on any failure, so nothing breaks.
 */
import {
  getServiceClient,
  json,
  rateLimited,
  readJsonBody,
} from './_lib/server.js';

const VISITS_TABLE = 'hsn_visits';

function geoHeader(req, name) {
  const raw = req.headers[name];
  const value = Array.isArray(raw) ? raw[0] : raw || '';
  try {
    const decoded = decodeURIComponent(value);
    return decoded && decoded !== 'Unknown' ? decoded : 'Unknown';
  } catch {
    return value || 'Unknown';
  }
}

function parseUserAgent(ua) {
  const lower = ua.toLowerCase();
  const isBot =
    /bot|crawler|spider|crawl|slurp|mediapartners|googlebot|bingbot|facebookexternal|headless|puppeteer|playwright|ahrefs|semrush/i.test(
      ua
    );
  let device = 'Desktop';
  if (/ipad|tablet|playbook|silk/i.test(ua)) device = 'Tablet';
  else if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua))
    device = 'Mobile';
  let browser = 'Other';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/chrome\/|crios\//i.test(ua)) browser = 'Chrome';
  else if (/firefox\/|fxios\//i.test(ua)) browser = 'Firefox';
  else if (/safari\//i.test(ua)) browser = 'Safari';
  let os = 'Other';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  return { device, browser, os, isBot, _uaLower: lower };
}

function cleanStr(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed.' });
  }
  if (rateLimited(req, 'visit', 60, 60_000)) {
    return json(res, 429, { error: 'Too many requests. Please try again shortly.' });
  }
  const body = readJsonBody(req);
  const visitorId = cleanStr(body.visitorId, 64);
  const page = cleanStr(body.page, 64);
  if (!visitorId || visitorId.length < 8) {
    return json(res, 400, { error: 'Missing visitor id.' });
  }
  if (!page) {
    return json(res, 400, { error: 'Missing page.' });
  }
  const client = getServiceClient();
  if (!client) return json(res, 503, { error: 'server_not_configured' });

  const ua = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '';
  const parsed = parseUserAgent(ua);
  const referrer = cleanStr(body.referrer, 500);
  const utmSource = cleanStr(body.utm_source, 100);
  const utmMedium = cleanStr(body.utm_medium, 100);
  const utmCampaign = cleanStr(body.utm_campaign, 100);

  let returning = false;
  try {
    const { data } = await client
      .from(VISITS_TABLE)
      .select('visitor_id')
      .eq('visitor_id', visitorId)
      .limit(1);
    returning = Array.isArray(data) && data.length > 0;
  } catch {
    returning = false;
  }

  const { error } = await client.from(VISITS_TABLE).insert({
    visitor_id: visitorId,
    page,
    city: geoHeader(req, 'x-vercel-ip-city'),
    region: geoHeader(req, 'x-vercel-ip-country-region'),
    country: geoHeader(req, 'x-vercel-ip-country'),
    device: parsed.device,
    browser: parsed.browser,
    os: parsed.os,
    referrer,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    is_returning: returning,
    is_bot: parsed.isBot,
  });
  if (error) return json(res, 503, { error: 'server_not_configured' });
  return json(res, 201, { ok: true, returning });
}
