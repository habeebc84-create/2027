import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Copy, Download, Phone, ShoppingCart, MapPin, Clock, Truck, CreditCard, Package, Loader2, ExternalLink } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { bustedImageSrc } from '../lib/images';
import { telHref, waHref } from '../lib/phone';
import { orderTrackingUrl } from '../lib/deepLink';
import { ORDER_STATUSES } from '../types';
import { PDF_COLORS, type PdfRgb } from '../lib/pdfColors';
import type { Order } from '../types';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);

type SiteSettingsInfo = { businessName: string; address: string; gstNumber: string; phone: string };

// Print counterparts of the production CSS tokens (jsPDF requires RGB tuples).
const { obsidian: OBSIDIAN, graphite: DARK, champagne: ORANGE, champagneInk: BRAND_INK,
  muted: GRAY, porcelain: LIGHT, ivory: WHITE, success: SUCCESS, gunmetal: GUNMETAL,
  rule: RULE } = PDF_COLORS;

// GST HSN codes by product category (building materials).
const HSN_BY_CATEGORY: Record<string, string> = {
  Cement: '2523', 'TMT Steel': '7214', Steel: '7214', Bricks: '6904', Blocks: '6810',
  Sand: '2505', Aggregates: '2517', Jelly: '2517', Paints: '3209', Tiles: '6907',
  Plumbing: '3917', Electrical: '8544', Hardware: '7318', Plywood: '4412',
};

// GST rates (%) by category — current slabs after the GST 2.0 revision
// (effective 22 Sep 2025): cement (HSN 2523) is 18%, down from 28%; TMT
// steel (7214) stays 18%; paints are 18%; sand/aggregates 5%; bricks and
// blocks 12% (with ITC). Store prices are GST-inclusive (see Payment
// Policy), so the invoice shows the tax contained in the prices.
const GST_RATE_BY_CATEGORY: Record<string, number> = {
  Cement: 18, 'TMT Steel': 18, Steel: 18, Bricks: 12, Blocks: 12,
  Sand: 5, Aggregates: 5, Jelly: 5, Paints: 18, Tiles: 18,
  Plumbing: 18, Electrical: 18, Hardware: 18, Plywood: 18,
};

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const twoDigit = (n: number): string => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ' ' + ONES[n % 10] : ''}`);
const threeDigit = (n: number): string => (n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' + twoDigit(n % 100) : ''}` : twoDigit(n));

/** Indian-system amount in words, e.g. "Rupees Twelve Thousand Three Hundred Forty Five Only". */
function amountInWords(amount: number): string {
  let n = Math.round(Math.abs(amount));
  if (n === 0) return 'Rupees Zero Only';
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) parts.push(`${threeDigit(crore)} Crore`);
  if (lakh) parts.push(`${twoDigit(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigit(thousand)} Thousand`);
  if (n) parts.push(threeDigit(n));
  return `Rupees ${parts.join(' ')} Only`;
}

/**
 * Generates a real PDF invoice with the HSN logo on BOTH sides of the header
 * and a scannable QR that deep-links to the order tracking page.
 */
async function downloadInvoice(order: Order, siteSettings: SiteSettingsInfo, logoSrc: string, qrDataUrl: string | null) {
  const items = order.items.map(item => {
    let price = item.product.price;
    if (item.selectedSize && item.product.sizes) { const s = item.product.sizes.find(sz => sz.size === item.selectedSize); if (s) price = s.price; }
    const hsn = HSN_BY_CATEGORY[item.product.category] || '-';
    return { name: item.product.name, brand: item.product.brand, size: item.selectedSize || '-', qty: item.quantity, unit: item.product.unit || '', hsn, gstRate: GST_RATE_BY_CATEGORY[item.product.category] ?? 18, price, total: price * item.quantity };
  });
  const subtotal = items.reduce((a, i) => a + i.total, 0);
  const delivery = order.finalDeliveryCharge ?? order.deliveryCharge;
  const handling = order.handlingCharge;
  const adjustment = Math.round((order.total - subtotal - delivery - handling) * 100) / 100;
  const inr = (n: number) => `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const dateStr = new Date(order.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  const trackingUrl = orderTrackingUrl(order.orderId);
  // GST breakup of the GST-inclusive goods prices. Rule 46 of the CGST
  // Rules requires the tax rate and tax amount on a tax invoice; supplier
  // and customers are both in Andhra Pradesh, so each group's tax splits
  // equally into CGST + SGST. (Delivery/handling are pass-through charges
  // as billed in the summary.)
  const taxGroups = new Map<number, { taxable: number; tax: number }>();
  items.forEach(i => {
    const taxable = i.total / (1 + i.gstRate / 100);
    const g = taxGroups.get(i.gstRate) || { taxable: 0, tax: 0 };
    g.taxable += taxable;
    g.tax += i.total - taxable;
    taxGroups.set(i.gstRate, g);
  });
  const totalGst = [...taxGroups.values()].reduce((a, g) => a + g.tax, 0);

  const doc = new (await import('jspdf')).jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;

  // Load logo (fall back to text-only header on failure)
  let logo: HTMLImageElement | null = null;
  try {
    logo = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = logoSrc;
    });
  } catch { logo = null; }

  // ===== Header band with logo on BOTH sides =====
  doc.setFillColor(...OBSIDIAN);
  doc.rect(0, 0, W, 36, 'F');
  doc.setFillColor(...ORANGE);
  doc.rect(0, 36, W, 1.2, 'F');

  const drawLogo = (x: number) => {
    doc.setFillColor(...PDF_COLORS.white);
    doc.roundedRect(x, 6, 22, 24, 2, 2, 'F');
    if (logo) doc.addImage(logo, 'PNG', x + 3, 8, 16, 20);
  };
  drawLogo(8);
  drawLogo(W - 30);

  // Letterhead: business name, tagline and contact info all left-aligned at
  // the same x position, stacked as one block beside the left logo.
  const lx = 36;
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(siteSettings.businessName.toUpperCase(), lx, 13.5, { align: 'left' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND_INK);
  doc.text('P R E M I U M   B U I L D I N G   M A T E R I A L S', lx, 18.5, { align: 'left' });
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  const headerLines = doc.splitTextToSize(`${siteSettings.address}  |  GSTIN: ${siteSettings.gstNumber}  |  Ph: ${siteSettings.phone}`, 136) as string[];
  let hy = 23.5;
  headerLines.slice(0, 2).forEach(l => { doc.text(l, lx, hy, { align: 'left' }); hy += 4.2; });

  // ===== Title =====
  let y = 46;
  doc.setTextColor(...BRAND_INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAX INVOICE', W / 2, y, { align: 'center' });
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.5);
  doc.line(80, y + 2, 130, y + 2);
  // Order status badge on the right of the title
  const statusLabel = (ORDER_STATUSES.find(s => s.key === order.status)?.label || order.status).toUpperCase();
  const badgeFill: PdfRgb = order.status === 'delivered' ? SUCCESS : order.status === 'cancelled' ? GUNMETAL : ORANGE;
  const badgeInk: PdfRgb = order.status === 'delivered' || order.status === 'cancelled' ? WHITE : OBSIDIAN;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  const badgeW = doc.getTextWidth(statusLabel) + 7;
  const badgeX = 198 - badgeW;
  doc.setFillColor(...badgeFill);
  doc.roundedRect(badgeX, y - 5.8, badgeW, 6, 3, 3, 'F');
  doc.setTextColor(...badgeInk);
  doc.text(statusLabel, badgeX + badgeW / 2, y - 1.9, { align: 'center' });
  // Statutory copy-type marking under the title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text('ORIGINAL FOR RECIPIENT', W / 2, y + 5.5, { align: 'center' });
  y += 11;

  // ===== Meta boxes =====
  const metaTop = y;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(12, metaTop, 88, 32, 2, 2, 'F');
  doc.roundedRect(104, metaTop, 94, 32, 2, 2, 'F');
  doc.setFillColor(...ORANGE);
  doc.roundedRect(12, metaTop, 2, 32, 1, 1, 'F');

  const metaLine = (label: string, value: string, ly: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(label, 16, ly);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(value, 40, ly);
  };
  metaLine('Invoice No', order.orderId, metaTop + 6);
  metaLine('Date', dateStr, metaTop + 11.5);
  metaLine('Payment', order.paymentMode, metaTop + 17);
  metaLine('Deliver To', order.deliveryLocation || 'Site Delivery', metaTop + 22.5);
  metaLine('Place of Supply', 'Andhra Pradesh (37)', metaTop + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('BILL TO', 108, metaTop + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(order.customer.name, 108, metaTop + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const custAddr = `${order.customer.address}${order.customer.landmark ? ', ' + order.customer.landmark : ''}${order.customer.village ? ', ' + order.customer.village : ''}${order.customer.mandal ? ', ' + order.customer.mandal : ''}${order.customer.pincode ? ' - ' + order.customer.pincode : ''}`;
  const custLines = doc.splitTextToSize(custAddr, 86) as string[];
  let cy = metaTop + 16;
  custLines.slice(0, 2).forEach(l => { doc.text(l, 108, cy); cy += 4; });
  doc.text(`Mobile: ${order.customer.mobile}${order.customer.email ? '  |  ' + order.customer.email : ''}`, 108, cy);
  y = metaTop + 38;

  // ===== Items table =====
  const cols = { no: 13, hsn: 24, product: 30, brand: 88, variant: 113, qty: 134, rate: 148, amount: 196 };
  const drawTableHeader = (ty: number) => {
    doc.setFillColor(...ORANGE);
    doc.rect(12, ty, 186, 8, 'F');
    doc.setTextColor(...OBSIDIAN);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('#', cols.no, ty + 5.5);
    doc.text('HSN', cols.hsn, ty + 5.5);
    doc.text('PRODUCT', cols.product, ty + 5.5);
    doc.text('BRAND', cols.brand, ty + 5.5);
    doc.text('VARIANT', cols.variant, ty + 5.5);
    doc.text('QTY', cols.qty, ty + 5.5);
    doc.text('RATE', cols.rate, ty + 5.5);
    doc.text('AMOUNT', cols.amount, ty + 5.5, { align: 'right' });
  };
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text('ITEMS', 12, y - 2.5);
  drawTableHeader(y);
  y += 8;

  items.forEach((item, idx) => {
    const nameLines = doc.splitTextToSize(item.name, 56) as string[];
    const rowH = Math.max(8, nameLines.length * 4.5 + 3.5);
    if (y + rowH > 245) { doc.addPage(); y = 16; drawTableHeader(y); y += 8; }
    if (idx % 2 === 1) { doc.setFillColor(...LIGHT); doc.rect(12, y, 186, rowH, 'F'); }
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(String(idx + 1), cols.no, y + 5.5);
    doc.text(item.hsn, cols.hsn, y + 5.5);
    doc.setFont('helvetica', 'bold');
    nameLines.forEach((l, li) => doc.text(l, cols.product, y + 5.5 + li * 4.5));
    doc.setFont('helvetica', 'normal');
    doc.text(item.brand, cols.brand, y + 5.5);
    doc.text(item.size, cols.variant, y + 5.5);
    doc.text(item.unit ? `${item.qty} ${item.unit}` : String(item.qty), cols.qty, y + 5.5);
    doc.text(inr(item.price), cols.rate, y + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(inr(item.total), cols.amount, y + 5.5, { align: 'right' });
    y += rowH;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    doc.line(12, y, 198, y);
  });

  // ===== Amount in words + Summary card =====
  y += 8;
  const totalRowsCount = 2 + (handling > 0 ? 1 : 0) + (Math.abs(adjustment) > 0.5 ? 1 : 0);
  const sumCardH = 9 + totalRowsCount * 6.5 + 10.5;
  const sumTop = Math.max(y, 0);
  doc.setFillColor(...LIGHT);
  doc.roundedRect(108, sumTop, 90, sumCardH, 2, 2, 'F');
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.25);
  doc.roundedRect(108, sumTop, 90, sumCardH, 2, 2, 'S');
  doc.setFillColor(...ORANGE);
  doc.roundedRect(108, sumTop, 1.2, sumCardH, 0.6, 0.6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text('SUMMARY', 112, sumTop + 6);
  const ty0 = sumTop + 14;
  const totalRow = (label: string, value: string, rowY: number, bold = false, fill = false) => {
    if (fill) { doc.setFillColor(...DARK); doc.roundedRect(111, rowY - 4.2, 84, 8, 1.5, 1.5, 'F'); }
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10.5 : 8.5);
    const labelColor: PdfRgb = fill ? WHITE : bold ? DARK : GRAY;
    doc.setTextColor(...labelColor);
    doc.text(label, 115, rowY);
    const valueColor: PdfRgb = fill ? WHITE : DARK;
    doc.setTextColor(...valueColor);
    doc.text(value, 192, rowY, { align: 'right' });
  };
  let ry = ty0;
  totalRow('Subtotal', inr(subtotal), ry); ry += 6.5;
  totalRow('Delivery', delivery === 0 ? 'FREE' : inr(delivery), ry); ry += 6.5;
  if (handling > 0) { totalRow('Handling', inr(handling), ry); ry += 6.5; }
  if (Math.abs(adjustment) > 0.5) { totalRow('Store Adjustment', inr(adjustment), ry); ry += 6.5; }
  totalRow('GRAND TOTAL', inr(order.total), ry + 1.5, true, true);

  // Amount in words (statutory on Indian tax invoices) — full width strip
  const wordsY = sumTop + sumCardH + 5;
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, wordsY, 186, 9, 1.5, 1.5, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...BRAND_INK);
  doc.text('Amount in Words:', 15, wordsY + 5.8);
  const wordsX = 15 + doc.getTextWidth('Amount in Words:') + 1.5;
  doc.setFont('helvetica', 'bolditalic');
  doc.setTextColor(...DARK);
  doc.text(amountInWords(order.total), wordsX, wordsY + 5.8);
  y = wordsY + 9;

  // ===== GST breakup strip (Rule 46: tax rate + amount, CGST/SGST split) =====
  const gstGroups = [...taxGroups.entries()].sort((a, b) => a[0] - b[0]);
  const gstStripH = 14 + gstGroups.length * 5;
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, y + 4, 186, gstStripH, 1.5, 1.5, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...BRAND_INK);
  doc.text('GST BREAKUP (PRICES INCLUDE GST):', 15, y + 9.5);
  let gy = y + 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK);
  gstGroups.forEach(([rate, g]) => {
    doc.text(`GST @${rate}%  |  Taxable Value: ${inr(g.taxable)}  |  CGST @${rate / 2}%: ${inr(g.tax / 2)}  |  SGST @${rate / 2}%: ${inr(g.tax / 2)}`, 15, gy);
    gy += 5;
  });
  doc.setFont('helvetica', 'bold');
  doc.text(`Total GST included: ${inr(totalGst)}        Reverse Charge: Not Applicable`, 15, gy + 0.5);
  y = y + 4 + gstStripH;

  // ===== QR tracking block + terms + signature =====
  const blockTop = Math.max(y + 6, 185);
  // Left: bank-style detail rows (purpose + terms) above the signature.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text('TERMS & CONDITIONS', 12, blockTop + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...GRAY);
  [
    '1. Goods once sold will not be returned unless defective.',
    '2. Payment due as per agreed credit terms.',
    '3. Subject to Kalikiri, Andhra Pradesh jurisdiction.',
    '4. Verify quantity, brand and grade at delivery.',
  ].forEach((t, i) => doc.text(t, 12, blockTop + 6.5 + i * 3.6));
  const signY = blockTop + 24;
  if (qrDataUrl) {
    const qx = 158;
    const qy = blockTop;
    doc.setDrawColor(...DARK);
    doc.setLineWidth(0.3);
    doc.roundedRect(qx, qy, 40, 47, 2, 2, 'S');
    doc.addImage(qrDataUrl, 'PNG', qx + 6, qy + 4, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...BRAND_INK);
    doc.text('SCAN TO TRACK ORDER', qx + 20, qy + 37, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(`#${order.orderId}`, qx + 20, qy + 43, { align: 'center' });
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(`For ${siteSettings.businessName}`, 12, signY);
  doc.setDrawColor(...GUNMETAL);
  doc.setLineWidth(0.3);
  doc.line(12, signY + 16, 70, signY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('Authorised Signatory', 12, signY + 21);

  // ===== Footer =====
  const footerY = 285;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(`Track online: ${trackingUrl}`, W / 2, footerY - 4, { align: 'center' });
  doc.setFillColor(...OBSIDIAN);
  doc.rect(0, footerY, W, 12, 'F');
  doc.setFillColor(...ORANGE);
  doc.rect(0, footerY - 0.8, W, 0.8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Goods once sold will not be returned unless defective. Payment due as per agreed terms. Subject to Kalikiri, AP jurisdiction.', W / 2, footerY + 5, { align: 'center' });
  doc.text(`Thank you for your business! - ${siteSettings.businessName}`, W / 2, footerY + 9, { align: 'center' });

  // ===== Page numbers =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`Page ${i} of ${pageCount}`, 198, 293, { align: 'right' });
  }

  doc.save(`HSN-Invoice-${order.orderId}.pdf`);
}

export default function OrderSuccess({ orderId }: { orderId: string }) {
  const { getOrderById, setPage, siteContent, siteSettings, transportZones, refreshFromCloud } = useApp();
  const [copied, setCopied] = useState(false);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [cloudFetching, setCloudFetching] = useState(false);
  const [animPhase, setAnimPhase] = useState(0);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const order = getOrderById(orderId);

  // QR scans open this page on other devices too: if the order is not in this
  // browser yet, keep pulling the cloud copy until it appears (same as the
  // tracking page retry loop).
  useEffect(() => {
    if (!orderId || getOrderById(orderId)) return;
    let alive = true;
    setCloudFetching(true);
    const attempt = async (tries = 0) => {
      if (getOrderById(orderId)) { if (alive) setCloudFetching(false); return; }
      await refreshFromCloud();
      if (getOrderById(orderId)) { if (alive) setCloudFetching(false); return; }
      if (tries < 7 && alive) { setTimeout(() => attempt(tries + 1), 1200); }
      else if (alive) setCloudFetching(false);
    };
    void attempt();
    return () => { alive = false; };
  }, [orderId, getOrderById, refreshFromCloud]);

  useEffect(() => {
    const timers = [setTimeout(() => setAnimPhase(1), 200), setTimeout(() => setAnimPhase(2), 500), setTimeout(() => setAnimPhase(3), 800), setTimeout(() => setAnimPhase(4), 1000), setTimeout(() => setAnimPhase(5), 1200), setTimeout(() => setAnimPhase(6), 1400), setTimeout(() => setAnimPhase(7), 1600), setTimeout(() => setAnimPhase(8), 1800)];
    return () => timers.forEach(clearTimeout);
  }, []);

  const copyOrderId = useCallback(() => { navigator.clipboard.writeText(orderId); setCopied(true); setTimeout(() => setCopied(false), 2000); }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0C0E] text-ivory">
        <div className="text-center space-y-4">
          {cloudFetching ? (
            <>
              <Loader2 className="w-12 h-12 text-brand-400 mx-auto animate-spin" />
              <h2 className="text-xl font-bold">Fetching order #{orderId}…</h2>
              <p className="text-sm text-silver">Loading live order details from the store.</p>
            </>
          ) : (
            <>
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <h2 className="text-xl font-bold">Order not found</h2>
              <p className="text-sm text-silver">Order ID: {orderId}</p>
            </>
          )}
          <button onClick={() => setPage('home')} className="btn-brand font-bold px-6 py-3 rounded-xl text-sm">Go to Home</button>
        </div>
      </div>
    );
  }

  const zone = transportZones.find(z => z.name === order.deliveryLocation);
  const currentStatusIdx = ORDER_STATUSES.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  const orderItems = order.items.map(item => {
    let price = item.product.price;
    if (item.selectedSize && item.product.sizes) { const s = item.product.sizes.find(sz => sz.size === item.selectedSize); if (s) price = s.price; }
    return { ...item, unitPrice: price, lineTotal: price * item.quantity };
  });

  const subtotal = orderItems.reduce((a, i) => a + i.lineTotal, 0);

  const trackingUrl = orderTrackingUrl(order.orderId);

  const handleDownloadInvoice = async () => {
    if (invoiceBusy) return;
    setInvoiceBusy(true);
    try {
      const qrDataUrl = qrCanvasRef.current?.toDataURL('image/png') ?? null;
      await downloadInvoice(order, siteSettings, bustedImageSrc('/windows-h-logo.png'), qrDataUrl);
    } finally {
      setInvoiceBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] relative overflow-hidden">
      {/* Hidden high-res QR canvas used by the PDF invoice (must stay rendered, not display:none) */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
        <QRCodeCanvas ref={qrCanvasRef} value={trackingUrl} size={512} level="M" marginSize={4} />
      </div>

      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-success/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-success/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-6 relative transition-all duration-700 ${animPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            {/* Glowing ring */}
            <div className="absolute inset-0 rounded-full border-4 border-success/50 animate-[spin_3s_linear_infinite]" style={{ borderTopColor: '#166534', borderRightColor: '#166534', borderBottomColor: '#166534' }} />
            <div className="absolute inset-1 rounded-full bg-success/15 backdrop-blur-sm" />
            {/* Checkmark */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${animPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
              <div className="w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-[0_0_30px_rgba(22,101,52,0.4)]">
                <Check className="w-8 h-8 text-ivory" strokeWidth={3} />
              </div>
            </div>
            {/* Particles */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-700 ${animPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: '#166534', top: '50%', left: '50%', transform: `translate(${Math.cos(i * 60 * Math.PI / 180) * 45}px, ${Math.sin(i * 60 * Math.PI / 180) * 45}px)` }} />
            ))}
          </div>

          <h1 className={`text-2xl sm:text-3xl font-black text-ivory font-industrial tracking-tight transition-all duration-700 delay-200 ${animPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {order.status === 'placed' ? 'ORDER PLACED SUCCESSFULLY!' : 'ORDER DETAILS'}
          </h1>
          <p className={`text-silver text-sm mt-2 transition-all duration-500 delay-300 ${animPhase >= 4 ? 'opacity-100' : 'opacity-0'}`}>
            {order.status === 'placed'
              ? `Thank you for ordering with ${siteSettings.businessName}. Your order has been successfully registered.`
              : `Live status and invoice for order #${order.orderId} at ${siteSettings.businessName}.`}
          </p>
        </div>

        {/* Order Reference ID */}
        <div className={`bg-charcoal border border-success/30 rounded-2xl p-5 text-center mb-6 transition-all duration-500 ${animPhase >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-[10px] font-bold text-silver uppercase tracking-wider mb-1">Order Reference ID</div>
          <div className="text-xl sm:text-2xl font-black text-ivory font-industrial">#{order.orderId}</div>
          <button onClick={copyOrderId} className="mt-3 inline-flex items-center space-x-1.5 bg-white/10 border border-gunmetal px-4 py-2 rounded-full text-xs font-bold text-silver hover:text-ivory hover:bg-white/15 transition">
            {copied ? <><Check className="w-3.5 h-3.5 text-brand-400" /><span className="text-success-foreground">Order ID copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copy Order ID</span></>}
          </button>
        </div>

        {/* Action Buttons */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 transition-all duration-500 ${animPhase >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={handleDownloadInvoice} disabled={invoiceBusy} className="flex flex-col items-center space-y-2 bg-charcoal border border-gunmetal rounded-2xl p-4 hover:bg-white/10 hover:border-brand-500/30 disabled:opacity-60 transition group">
            {invoiceBusy ? <Loader2 className="w-5 h-5 text-brand-400 animate-spin" /> : <Download className="w-5 h-5 text-brand-400 group-hover:scale-110 transition" />}
            <span className="text-[10px] font-bold text-silver">{invoiceBusy ? 'Preparing PDF…' : 'Download Invoice'}</span>
          </button>
          <a href={waHref(siteContent.whatsapp, `Hello HSN Cement & Steel, I have placed an order. Order ID: #${order.orderId}. Please confirm my order and delivery details.`)}
            target="_blank" rel="noreferrer" className="flex flex-col items-center space-y-2 bg-charcoal border border-gunmetal rounded-2xl p-4 hover:bg-white/10 hover:border-champagne/30 transition group">
            <WhatsAppIcon className="w-5 h-5 text-champagne group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-silver">WhatsApp Store</span>
          </a>
          <a href={telHref(siteContent.phone)} className="flex flex-col items-center space-y-2 bg-charcoal border border-gunmetal rounded-2xl p-4 hover:bg-white/10 hover:border-brand-500/30 transition group">
            <Phone className="w-5 h-5 text-brand-400 group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-silver">Call Store</span>
          </a>
          <button onClick={() => setPage('products')} className="flex flex-col items-center space-y-2 bg-charcoal border border-gunmetal rounded-2xl p-4 hover:bg-white/10 hover:border-brand-500/30 transition group">
            <ShoppingCart className="w-5 h-5 text-brand-400 group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-silver">Continue Shopping</span>
          </button>
        </div>

        {/* Track Order Button */}
        <button onClick={() => setPage('order-tracking', order.orderId)}
          className={`w-full btn-brand font-black py-4 rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-lg hover:from-brand-400 hover:via-brand-500 hover:to-brand-500 transition mb-8 ${animPhase >= 6 ? 'opacity-100' : 'opacity-0'}`}>
          <MapPin className="w-5 h-5" /><span>TRACK MY ORDER</span>
        </button>

        <div className={`grid lg:grid-cols-12 gap-6 transition-all duration-500 ${animPhase >= 7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Left column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-charcoal border border-gunmetal rounded-2xl p-6">
              <h3 className="text-sm font-black text-ivory font-industrial mb-5">ORDER STATUS</h3>
              <div className="space-y-0">
                {ORDER_STATUSES.filter(s => !['returned', 'cancelled'].includes(s.key)).map((status, idx) => {
                  const isCompleted = idx <= currentStatusIdx && !isCancelled;
                  const isCurrent = order.status === status.key;
                  const description = ['Order Placed', 'Store will confirm your order', 'Products are being prepared', 'Order is ready for delivery', 'Driver is on the way', 'Order successfully delivered'][idx] || '';
                  return (
                    <div key={status.key} className="flex items-start space-x-4 relative">
                      {idx < 5 && <div className={`absolute left-4 top-8 w-0.5 h-8 transition-all duration-500 ${isCompleted ? 'bg-gradient-to-b from-brand-500 to-brand-500' : 'bg-white/10'}`} />}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${isCompleted ? 'bg-success border border-success shadow-[0_0_15px_rgba(22,101,52,0.25)]' : 'bg-charcoal border border-gunmetal'}`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5 text-ivory" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                      </div>
                      <div className="pb-6">
                        <div className={`text-xs font-bold ${isCompleted ? 'text-success-foreground' : 'text-slate-600'}`}>{status.label}</div>
                        <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-brand-400' : isCompleted ? 'text-silver' : 'text-slate-700'}`}>{description}</div>
                        {isCurrent && <div className="text-[9px] text-success-foreground font-bold mt-0.5 uppercase tracking-wider">Current</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {isCancelled && (
                <div className="mt-4 bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 text-center">
                  <div className="text-sm font-bold text-brand-400">ORDER CANCELLED</div>
                  <div className="text-[10px] text-silver mt-1">This order has been cancelled.</div>
                </div>
              )}
            </div>

            {/* Ordered Products */}
            <div className="bg-charcoal border border-gunmetal rounded-2xl p-6">
              <h3 className="text-sm font-black text-ivory font-industrial mb-4">YOUR ORDER</h3>
              <div className="space-y-3">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 bg-white/[0.03] rounded-xl p-3 border border-gunmetal">
                    <img src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-ivory line-clamp-1">{item.product.name}</div>
                      <div className="text-[10px] text-silver">{item.product.brand}{item.selectedSize ? ` | ${item.selectedSize}` : ''}</div>
                      <div className="text-[10px] text-silver mt-0.5">Qty: {item.quantity} x Rs.{item.unitPrice}</div>
                    </div>
                    <div className="text-sm font-black text-ivory">Rs.{item.lineTotal.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              {/* Price Breakdown */}
              <div className="mt-4 pt-4 border-t border-gunmetal space-y-2 text-xs">
                <div className="flex justify-between text-silver"><span>Subtotal</span><span className="font-bold text-silver">Rs.{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-silver"><span>Transport / Delivery</span><span className={`font-bold ${order.deliveryCharge === 0 ? 'text-success-foreground' : 'text-silver'}`}>{order.deliveryCharge === 0 ? 'FREE' : `Rs.${order.deliveryCharge.toLocaleString('en-IN')}`}</span></div>
                {order.finalDeliveryCharge !== undefined && order.finalDeliveryCharge !== order.deliveryCharge && (
                  <div className="flex justify-between text-silver bg-brand-500/5 rounded-lg px-2 py-1.5"><span>Final Delivery (confirmed by store)</span><span className="font-bold text-brand-300">Rs.{order.finalDeliveryCharge.toLocaleString('en-IN')}</span></div>
                )}
                {order.handlingCharge > 0 && <div className="flex justify-between text-silver"><span>Handling</span><span className="font-bold text-silver">Rs.{order.handlingCharge.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between items-end pt-3 border-t border-gunmetal">
                  <span className="font-bold text-silver">Grand Total</span>
                  <span className="text-xl font-black text-ivory">Rs.{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Ticket */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-gunmetal rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-500 to-brand-500" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] text-silver font-bold uppercase tracking-wider">HSN CEMENT &amp; STEEL</div>
                  <div className="text-[9px] text-silver">Premium Building Materials</div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${ORDER_STATUSES.find(s => s.key === order.status)?.color || 'text-silver bg-charcoal border-gunmetal'}`}>
                  {ORDER_STATUSES.find(s => s.key === order.status)?.label || order.status}
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between"><span className="text-silver">Order</span><span className="text-ivory font-bold">#{order.orderId}</span></div>
                <div className="flex justify-between"><span className="text-silver">Customer</span><span className="text-ivory font-bold">{order.customer.name}</span></div>
                <div className="flex justify-between"><span className="text-silver">Mobile</span><span className="text-ivory font-bold">{order.customer.mobile}</span></div>
                <div className="flex justify-between items-start"><span className="text-silver shrink-0">Delivery</span><span className="text-ivory font-bold text-right ml-2">{order.customer.address}, {order.customer.landmark}</span></div>
                {order.customer.village && <div className="flex justify-between"><span className="text-silver">Village</span><span className="text-ivory font-bold">{order.customer.village}</span></div>}
                {order.customer.mandal && <div className="flex justify-between"><span className="text-silver">Mandal</span><span className="text-ivory font-bold">{order.customer.mandal}</span></div>}
                {order.customer.pincode && <div className="flex justify-between"><span className="text-silver">Pincode</span><span className="text-ivory font-bold">{order.customer.pincode}</span></div>}
                <div className="flex justify-between"><span className="text-silver">Total</span><span className="text-ivory font-black text-sm">Rs.{order.total.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-silver">Payment</span><span className="text-ivory font-bold">{order.paymentMode}</span></div>
                <div className="flex justify-between"><span className="text-silver">Date</span><span className="text-ivory font-bold">{new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-charcoal border border-gunmetal rounded-2xl p-5">
              <h4 className="text-xs font-black text-ivory flex items-center space-x-2 mb-3"><Truck className="w-4 h-4 text-brand-400" /><span>SITE DELIVERY</span></h4>
              <div className="text-xs text-silver space-y-1.5">
                <p>{order.deliveryLocation || 'Kalikiri Site Delivery'}</p>
                <p>Estimated: <span className="text-ivory font-bold">{zone?.estimatedTime || 'Same-day or next morning'}</span></p>
                <p className="text-[10px] text-silver">For nearby areas: 1-2 business days</p>
              </div>
            </div>

            {/* Payment Card */}
            <div className={`rounded-2xl p-5 border ${order.paymentMode.includes('Cash') ? 'bg-brand-500/5 border-brand-500/20' : 'bg-brand-500/5 border-brand-500/20'}`}>
              <h4 className="text-xs font-black text-ivory flex items-center space-x-2 mb-2">
                {order.paymentMode.includes('Cash') ? <><CreditCard className="w-4 h-4 text-brand-400" /><span>CASH ON DELIVERY</span></> : <><Check className="w-4 h-4 text-success-foreground" /><span>PAYMENT RECEIVED</span></>}
              </h4>
              <p className="text-xs text-silver">{order.paymentMode.includes('Cash') ? 'Please keep the payable amount ready at the time of delivery.' : 'Online payment has been completed.'}</p>
              <div className="mt-2 text-sm font-black text-ivory">Amount: Rs.{order.total.toLocaleString('en-IN')}</div>
            </div>

            {/* QR Code + Track */}
            <div className="bg-charcoal border border-gunmetal rounded-2xl p-5 text-center">
              <div className="w-32 h-32 mx-auto mb-3 rounded-xl bg-white p-2 flex items-center justify-center">
                <QRCodeSVG value={trackingUrl} size={112} level="M" marginSize={2} />
              </div>
              <div className="text-[10px] font-bold text-silver uppercase tracking-wider">Scan to Track Order #{order.orderId}</div>
              <a href={trackingUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center space-x-1 text-[10px] font-bold text-brand-400 hover:text-brand-300 hover:underline transition">Track this order online <ExternalLink className="w-3 h-3" /></a>
            </div>

            {/* Customer Support */}
            <div className="bg-charcoal border border-gunmetal rounded-2xl p-5">
              <h4 className="text-xs font-black text-ivory mb-3">NEED HELP WITH YOUR ORDER?</h4>
              <p className="text-[10px] text-silver mb-3">Our store team is available to assist you.</p>
              <div className="grid grid-cols-2 gap-2">
                <a href={waHref(siteContent.whatsapp, `Hello, I need help with order #${order.orderId}`)}
                  target="_blank" rel="noreferrer" className="flex items-center justify-center space-x-1.5 bg-champagne/10 border border-champagne/30 text-champagne font-bold py-2.5 rounded-xl text-[10px] hover:bg-champagne/20 transition">
                  <WhatsAppIcon className="w-3.5 h-3.5" /><span>WhatsApp Store</span>
                </a>
                <a href={telHref(siteContent.phone)} className="flex items-center justify-center space-x-1.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 font-bold py-2.5 rounded-xl text-[10px] hover:bg-brand-500/20 transition">
                  <Phone className="w-3.5 h-3.5" /><span>Call Store</span>
                </a>
              </div>
              <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-silver"><Clock className="w-3 h-3" /><span>{siteContent.businessHours || 'Open 12 Hours Daily'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        <a href={waHref(siteContent.whatsapp)} target="_blank" rel="noreferrer" className="w-12 h-12 bg-brand rounded-full text-obsidian flex items-center justify-center shadow-lg hover:scale-110 transition"><WhatsAppIcon className="w-6 h-6" /></a>
        <a href={telHref(siteContent.phone)} className="w-12 h-12 btn-secondary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"><Phone className="w-5 h-5 text-ivory" /></a>
      </div>
    </div>
  );
}
