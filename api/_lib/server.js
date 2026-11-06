/**
 * Shared helpers for the HSN Node backend (Vercel serverless API, same repo).
 *
 * BUILD 85 note: these files are plain JavaScript on purpose. The first
 * version was TypeScript, and Vercel's file tracer (@vercel/nft) cannot
 * parse `interface` declarations or `import type` statements — it silently
 * dropped every import from those files, so the deployed functions crashed
 * on load with FUNCTION_INVOCATION_FAILED. Plain JS traces cleanly.
 *
 * The browser used to talk straight to Supabase with the public anon key,
 * so anyone could send any price and any order. These endpoints sit in the
 * middle: they re-price every order from the server's own product list and
 * write to Postgres with the service-role key, which the browser never sees.
 *
 * Two dashboard steps activate the backend (until then every endpoint
 * answers 503 `server_not_configured` and the site keeps working exactly
 * as today, through the browser-direct path):
 *   1. Run supabase/hsn_orders_auth.sql in Supabase -> SQL Editor so the
 *      hsn_orders table exists.
 *   2. Add SUPABASE_SERVICE_ROLE_KEY in Vercel -> Project Settings ->
 *      Environment Variables (Supabase dashboard -> Settings -> API ->
 *      service_role key). Never put it in code, chat, or git.
 */
import { createClient } from '@supabase/supabase-js';
import { products as bundledProducts, defaultTransportZones } from '../../src/data';

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://jteynbnnxxtulphkxtlc.supabase.co';
const SITE_CONTENT_URL = `${SUPABASE_URL}/storage/v1/object/public/site-content/site-content.json?cache-max-age=0`;

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function json(res, status, body) {
  res.status(status).json(body);
}

/** Service-role client (bypasses RLS). Null until the key is configured. */
export function getServiceClient() {
  if (!SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let catalogCache = null;

/**
 * Current products + transport zones. Prefers the live shared copy in
 * Supabase Storage (the same file the site itself reads, so admin price
 * edits apply here too); falls back to the bundled defaults if that fetch
 * fails, so a Storage blip never blocks checkout.
 */
export async function getCatalog() {
  const now = Date.now();
  if (catalogCache && now - catalogCache.at < 60_000) return catalogCache.catalog;
  const fallback = {
    products: bundledProducts,
    zones: defaultTransportZones,
  };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(SITE_CONTENT_URL, {
      cache: 'no-store',
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return fallback;
    const data = await res.json();
    const products = Array.isArray(data.products) ? data.products : bundledProducts;
    const zones = Array.isArray(data.transportZones) ? data.transportZones : fallback.zones;
    const catalog = { products, zones };
    catalogCache = { at: now, catalog };
    return catalog;
  } catch {
    return fallback;
  }
}

/**
 * Re-price a cart from the server's product list. Client-sent prices are
 * never trusted. Stock is checked only when the stored stock is positive:
 * a zero stock value in the catalogue must not block an order the site
 * itself would have accepted (the drawer only caps when stock > 0).
 * Returns { ok, items, itemsTotal } or { ok: false, error }.
 */
export function priceItems(rawItems, products) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, error: 'Cart is empty.' };
  }
  if (rawItems.length > 50) {
    return { ok: false, error: 'Too many items in one order.' };
  }
  const byId = new Map(products.map((p) => [p.id, p]));
  const priced = [];
  let itemsTotal = 0;
  for (const raw of rawItems) {
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'Invalid item.' };
    }
    const productId = typeof raw.productId === 'string' ? raw.productId : '';
    const size = typeof raw.size === 'string' ? raw.size : undefined;
    const quantity = raw.quantity;
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return { ok: false, error: 'Invalid item quantity.' };
    }
    const product = byId.get(productId);
    if (!product || product.enabled === false) {
      return { ok: false, error: `Product not available: ${productId}` };
    }
    let unitPrice = product.price;
    let stock = product.stock;
    if (size && product.sizes) {
      const s = product.sizes.find((z) => z.size === size);
      if (!s) return { ok: false, error: `Size not available: ${size}` };
      unitPrice = s.price;
      stock = s.stock;
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return { ok: false, error: `Invalid price for ${product.name}.` };
    }
    if (stock > 0 && quantity > stock) {
      return { ok: false, error: `Only ${stock} left of ${product.name}.` };
    }
    priced.push({
      productId,
      name: product.name,
      size,
      quantity,
      unitPrice,
      type: product.type,
      product,
    });
    itemsTotal += unitPrice * quantity;
  }
  return { ok: true, items: priced, itemsTotal };
}

/**
 * Delivery + handling, recomputed server-side from the same rules the
 * checkout page uses: zone charge by delivery location (0 for pickup),
 * handling Rs.5 per cement unit and Rs.20 per steel/wire unit.
 * Returns { ok, charges } or { ok: false, error }.
 */
export function computeCharges(priced, deliveryLocation, deliveryMethod, zones) {
  let deliveryCharge = 0;
  if (deliveryMethod !== 'pickup') {
    const zone = zones.find((z) => z.name === deliveryLocation);
    if (!zone || zone.enabled === false) {
      return { ok: false, error: 'Delivery location not available.' };
    }
    if (!Number.isFinite(zone.charge) || zone.charge < 0) {
      return { ok: false, error: 'Invalid delivery charge.' };
    }
    deliveryCharge = zone.charge;
  }
  let handlingCharge = 0;
  for (const item of priced) {
    if (item.type === 'cement') handlingCharge += item.quantity * 5;
    else if (item.type === 'steel' || item.type === 'wire') {
      handlingCharge += item.quantity * 20;
    }
  }
  return { ok: true, charges: { deliveryCharge, handlingCharge } };
}

/** Readable order id, same format as the site's own generator. */
export async function newOrderId(client) {
  const year = new Date().getFullYear();
  let count = 0;
  try {
    const { count: c } = await client
      .from('hsn_orders')
      .select('id', { count: 'exact', head: true });
    if (typeof c === 'number') count = c;
  } catch {
    count = 0;
  }
  const suffix = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 5)}`.toUpperCase();
  return `HSN-${year}-${String(count + 1).padStart(5, '0')}-${suffix}`;
}

/** Parse a JSON body (Vercel usually parses it already). */
export function readJsonBody(req) {
  const body = req.body;
  if (body && typeof body === 'object') return body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return {};
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : (fwd || '').split(',')[0];
  return (first || 'unknown').trim();
}

const rateBuckets = new Map();

/**
 * Best-effort per-IP throttle (per serverless instance, not global).
 * The public anon insert already exists today, so this does not make
 * spam any easier than it already is — it only adds friction.
 */
export function rateLimited(req, key, limit, windowMs) {
  const bucketKey = `${key}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = rateBuckets.get(bucketKey);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}
