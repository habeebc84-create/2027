/** Create a server-priced order. Checkout keys make retries atomic in Postgres. */
import { createHash, randomUUID } from 'node:crypto';
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

function orderResponse(order) {
  return {
    order,
    orderId: order.orderId,
    total: order.total,
    items: order.items.map(item => ({
      productId: item.product.id,
      size: item.selectedSize,
      quantity: item.quantity,
      unitPrice: item.selectedSize
        ? item.product.sizes?.find(s => s.size === item.selectedSize)?.price
        : item.product.price,
    })),
  };
}

export default async function handler(req, res) {
  try {
    return await createOrder(req, res);
  } catch {
    return json(res, 503, { error: 'Could not confirm your order. Please retry with the same details.' });
  }
}

async function createOrder(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed.' });
  }
  if (rateLimited(req, 'orders', 10, 60_000)) {
    return json(res, 429, { error: 'Too many orders. Please try again in a minute.' });
  }
  const body = readJsonBody(req);
  // Older clients may omit the key. New clients retain it until success.
  const checkoutKey = body.checkoutKey || randomUUID();
  if (typeof checkoutKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(checkoutKey)) {
    return json(res, 400, { error: 'Invalid checkout key.' });
  }
  const requestData = {
    items: body.items, customer: body.customer, paymentMode: body.paymentMode,
    deliveryMethod: body.deliveryMethod, deliveryLocation: body.deliveryLocation,
    deliveryNote: body.deliveryNote,
  };
  const checkoutHash = createHash('sha256').update(JSON.stringify(requestData)).digest('hex');
  const client = getServiceClient();
  if (!client) return json(res, 503, { error: 'Checkout is temporarily unavailable. Please try again later.' });
  const existing = await client.from('hsn_orders').select('data,checkout_hash').eq('checkout_key', checkoutKey).maybeSingle();
  if (existing.error) return json(res, 503, { error: 'Checkout is temporarily unavailable. Please try again later.' });
  if (existing.data) {
    if (existing.data.checkout_hash !== checkoutHash) {
      return json(res, 409, { error: 'This checkout was already submitted with different details.' });
    }
    return json(res, 200, orderResponse(existing.data.data));
  }
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
  if (!catalog) {
    return json(res, 503, { error: 'server_not_configured' });
  }
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


  const now = new Date().toISOString();
  const orderId = await newOrderId(client);
  const order = {
    id: `order-${randomUUID()}`,
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
    checkout_key: checkoutKey,
    checkout_hash: checkoutHash,
    id: order.id,
    order_id: order.orderId,
    status: order.status,
    total: order.total,
    placed_at: order.date,
    data: order,
    updated_at: now,
  });
  if (error) {
    // Concurrent retries race on the unique key. Read the winning insert.
    if (error.code === '23505') {
      const saved = await client.from('hsn_orders').select('data,checkout_hash').eq('checkout_key', checkoutKey).maybeSingle();
      if (!saved.error && saved.data?.checkout_hash === checkoutHash) {
        return json(res, 200, orderResponse(saved.data.data));
      }
      if (saved.data) return json(res, 409, { error: 'This checkout was already submitted with different details.' });
    }
    return json(res, 503, { error: 'Could not confirm your order. Please retry with the same details.' });
  }
  return json(res, 201, orderResponse(order));
}
