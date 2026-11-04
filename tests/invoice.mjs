import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { createInvoicePdf } = await server.ssrLoadModule('/src/lib/invoice.ts');
  const product = { name: 'Premium cement', brand: 'Example', price: 400, unit: 'bag', sizes: [{ size: '50 kg', price: 425 }] };
  const order = {
    orderId: 'TEST-123', date: '2026-11-04T10:00:00Z',
    customer: { name: 'Test Customer', address: '123 Main Road', landmark: 'Near Market', mobile: '9876543210' },
    items: [{ product, selectedSize: '50 kg', quantity: 2 }],
    paymentMode: 'Cash on Delivery', deliveryMethod: 'delivery', deliveryLocation: 'Kalikiri',
    deliveryCharge: 100, finalDeliveryCharge: 150, handlingCharge: 10, total: 960,
  };
  const settings = { businessName: 'Example Company', address: 'Kalikiri, Andhra Pradesh', gstNumber: 'GST123', phone: '9876543210' };
  const doc = await createInvoicePdf(order, settings);
  const pdf = doc.output();
  assert.equal(doc.getNumberOfPages(), 1);
  for (const value of ['INVOICE', 'TEST-123', 'Test Customer', 'Premium cement', '50 kg', 'Rs. 425.00', 'Rs. 850.00', 'Rs. 960.00', 'Rs. 150.00', 'original order total']) {
    assert.ok(pdf.includes(value), `Missing ${value}`);
  }
  assert.ok(!pdf.includes('Store Adjustment'), 'A revised delivery charge should not create a fake adjustment');
  const many = await createInvoicePdf({ ...order, items: Array.from({ length: 75 }, (_, i) => ({ product: { ...product, name: `Product number ${i + 1}` }, quantity: 1 })) }, settings);
  const manyPdf = many.output();
  assert.ok(many.getNumberOfPages() > 1);
  assert.ok(manyPdf.includes('Product number 75'));
  assert.ok(manyPdf.includes(`Page ${many.getNumberOfPages()} of ${many.getNumberOfPages()}`));
  console.log('Invoice PDF checks passed.');
} finally {
  await server.close();
}
