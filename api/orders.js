/**
 * POST /api/orders — create an order through the Node backend.
 *
 * The browser sends items (product id + size + quantity only), customer
 * details, payment mode, delivery location and method. Prices, delivery
 * and handling charges are ALL recomputed here from the server's product
 * list — client-sent totals are ignored, so a tampered total can never
 * reach the database.
 *
 * Responses:
 *   201 { orderId, total, items } — order saved in Postgres.
 *   400 { error } — invalid items / customer / delivery details.
 *   405 — not POST.  429 — too many orders from this address.
 *   503 { error: 'server_not_configured' } — service key missing or the
 *       hsn_orders table does not exist yet. The site then falls back to
 *       its current browser-direct checkout, so nothing breaks.
 */
import {
  computeCharges,
  getCatalog,
  getServiceClient,
  json,
  newOrderId,
  priceItems,
  rateLimited,
  readJsonBody,
} from './_lib/server.js';

const PAYMENT_MODES = ['Cash on Delivery', 'UPI on Delivery'];

function validCustomer(c) {
  const name = typeof c.name === 'string' ? c.name.trim() : '';
  const mobile = typeof c.mobile === 'string' ? c.mobile.trim() : '';
  const address = typeof c.address === 'string' ? c.address.trim() : '';
  const landmark = typeof c.landmark === 'string' ? c.landmark.trim() : '';
  const pincode = typeof c.pincode === 'string' ? c.pincode.trim() : '';
  if (!name || name.length > 100) return 'Please enter your name.';
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  if (!address) return 'Please enter your delivery address.';
  if (!landmark) return 'Please enter a landmark.';
  if (pincode && !/^\d{6}$/.test(pincode)) return 'Pincode must be 6 digits.';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed.' });
  }
  if (rateLimited(req, 'orders', 10, 60_000)) {
    return json(res, 429, { error: 'Too many orders. Please try again in a minute.' });
  }
  const body = readJsonBody(req);
  const customer = body.customer || {};
  const customerError = validCustomer(customer);
  if (customerError) return json(res, 400, { error: customerError });

  const paymentMode = typeof body.paymentMode === 'string' ? body.paymentMode : '';
  if (!PAYMENT_MODES.includes(paymentMode)) {
    return json(res, 400, { error: 'Invalid payment mode.' });
  }
  const deliveryMethod =
    typeof body.deliveryMethod === 'string' ? body.deliveryMethod : '';
  if (deliveryMethod !== 'delivery' && deliveryMethod !== 'pickup') {
    return json(res, 400, { error: 'Invalid delivery method.' });
  }
  const deliveryLocation =
    typeof body.deliveryLocation === 'string' ? body.deliveryLocation : '';
  const deliveryNote =
    typeof body.deliveryNote === 'string' ? body.deliveryNote.slice(0, 500) : '';

  const catalog = await getCatalog();
  const priced = priceItems(body.items, catalog.products);
  if (!priced.ok || !priced.items || priced.itemsTotal === undefined) {
    return json(res, 400, { error: priced.error || 'Invalid items.' });
  }
  const charges = computeCharges(
    priced.items,
    deliveryLocation,
    deliveryMethod,
    catalog.zones,
  );
  if (!charges.ok || !charges.charges) {
    return json(res, 400, { error: charges.error || 'Invalid delivery.' });
  }
  const total = priced.itemsTotal + charges.charges.deliveryCharge + charges.charges.handlingCharge;

  const client = getServiceClient();
  if (!client) {
    return json(res, 503, { error: 'server_not_configured' });
  }

  const now = new Date().toISOString();
  const orderId = await newOrderId(client);
  const order = {
    id: `order-${Date.now()}`,
    orderId,
    // Store full catalogue products with the server-verified price applied,
    // so the saved order renders exactly like a browser-placed one.
    items: priced.items.map((i) => {
      const product = { ...i.product };
      if (i.size && product.sizes) {
        product.sizes = product.sizes.map((s) =>
          s.size === i.size ? { ...s, price: i.unitPrice } : s,
        );
      } else {
        product.price = i.unitPrice;
      }
      return {
        product,
        quantity: i.quantity,
        ...(i.size ? { selectedSize: i.size } : {}),
      };
    }),
    total,
    customer: {
      name: customer.name.trim(),
      mobile: customer.mobile.trim(),
      email: typeof customer.email === 'string' ? customer.email.trim() : '',
      address: customer.address.trim(),
      village: typeof customer.village === 'string' ? customer.village.trim() : '',
      mandal: typeof customer.mandal === 'string' ? customer.mandal.trim() : '',
      pincode: typeof customer.pincode === 'string' ? customer.pincode.trim() : '',
      landmark: customer.landmark.trim(),
    },
    paymentMode,
    deliveryNote,
    deliveryLocation,
    deliveryMethod,
    deliveryCharge: charges.charges.deliveryCharge,
    handlingCharge: charges.charges.handlingCharge,
    date: now,
    status: 'placed',
    timeline: [{ status: 'placed', date: now }],
  };

  const { error } = await client.from('hsn_orders').insert({
    id: order.id,
    order_id: order.orderId,
    status: order.status,
    total: order.total,
    placed_at: order.date,
    data: order,
    updated_at: now,
  });
  if (error) {
    // Table missing (PGRST205) or RLS blocking: backend not live yet.
    return json(res, 503, { error: 'server_not_configured' });
  }
  return json(res, 201, {
    orderId: order.orderId,
    total: order.total,
    items: priced.items,
  });
}
