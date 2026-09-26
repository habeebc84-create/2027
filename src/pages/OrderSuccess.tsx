import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Copy, Download, Phone, ShoppingCart, MapPin, Clock, Truck, CreditCard, Package } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { bustedImageSrc } from '../lib/images';
import { telHref, waHref } from '../lib/phone';
import { ORDER_STATUSES } from '../types';
import type { Order } from '../types';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);

type SiteSettingsInfo = { businessName: string; address: string; gstNumber: string; phone: string };

const NAVY: [number, number, number] = [26, 26, 46];
const PURPLE: [number, number, number] = [124, 58, 237];
const GRAY: [number, number, number] = [90, 90, 105];
const LIGHT: [number, number, number] = [235, 236, 242];

/**
 * Generates a real PDF invoice with the HSN logo on BOTH sides of the header
 * and a scannable QR that deep-links to the order tracking page.
 */
async function downloadInvoice(order: Order, siteSettings: SiteSettingsInfo, logoSrc: string, qrDataUrl: string | null) {
  const items = order.items.map(item => {
    let price = item.product.price;
    if (item.selectedSize && item.product.sizes) { const s = item.product.sizes.find(sz => sz.size === item.selectedSize); if (s) price = s.price; }
    return { name: item.product.name, brand: item.product.brand, size: item.selectedSize || '-', qty: item.quantity, price, total: price * item.quantity };
  });
  const subtotal = items.reduce((a, i) => a + i.total, 0);
  const delivery = order.finalDeliveryCharge ?? order.deliveryCharge;
  const handling = order.handlingCharge;
  const adjustment = Math.round((order.total - subtotal - delivery - handling) * 100) / 100;
  const inr = (n: number) => `Rs.${n.toLocaleString('en-IN')}`;
  const dateStr = new Date(order.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const trackingUrl = `${window.location.origin}/track-order/${order.orderId}`;

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
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 36, 'F');
  doc.setFillColor(...PURPLE);
  doc.rect(0, 36, W, 1.2, 'F');

  const drawLogo = (x: number) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, 6, 22, 24, 2, 2, 'F');
    if (logo) doc.addImage(logo, 'PNG', x + 3, 8, 16, 20);
  };
  drawLogo(8);
  drawLogo(W - 30);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(siteSettings.businessName.toUpperCase(), W / 2, 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('PREMIUM BUILDING MATERIALS', W / 2, 18, { align: 'center' });
  const headerLines = doc.splitTextToSize(`${siteSettings.address}  |  GSTIN: ${siteSettings.gstNumber}  |  Ph: ${siteSettings.phone}`, 118) as string[];
  let hy = 23;
  headerLines.slice(0, 3).forEach(l => { doc.text(l, W / 2, hy); hy += 4; });

  // ===== Title =====
  let y = 46;
  doc.setTextColor(...PURPLE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAX INVOICE', W / 2, y, { align: 'center' });
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.5);
  doc.line(80, y + 2, 130, y + 2);
  y += 9;

  // ===== Meta boxes =====
  const metaTop = y;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(12, metaTop, 88, 26, 2, 2, 'F');
  doc.roundedRect(104, metaTop, 94, 26, 2, 2, 'F');

  const metaLine = (label: string, value: string, ly: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(label, 16, ly);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text(value, 40, ly);
  };
  metaLine('Invoice No', `INV-${order.orderId}`, metaTop + 6);
  metaLine('Date', dateStr, metaTop + 11.5);
  metaLine('Payment', order.paymentMode, metaTop + 17);
  metaLine('Deliver To', order.deliveryLocation || 'Site Delivery', metaTop + 22.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('BILL TO', 108, metaTop + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(order.customer.name, 108, metaTop + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const custAddr = `${order.customer.address}${order.customer.landmark ? ', ' + order.customer.landmark : ''}${order.customer.village ? ', ' + order.customer.village : ''}${order.customer.mandal ? ', ' + order.customer.mandal : ''}${order.customer.pincode ? ' - ' + order.customer.pincode : ''}`;
  const custLines = doc.splitTextToSize(custAddr, 86) as string[];
  let cy = metaTop + 16;
  custLines.slice(0, 2).forEach(l => { doc.text(l, 108, cy); cy += 4; });
  doc.text(`Mobile: ${order.customer.mobile}${order.customer.email ? '  |  ' + order.customer.email : ''}`, 108, cy);
  y = metaTop + 32;

  // ===== Items table =====
  const cols = { no: 13, product: 20, brand: 88, variant: 114, qty: 134, rate: 148, amount: 196 };
  const drawTableHeader = (ty: number) => {
    doc.setFillColor(...NAVY);
    doc.rect(12, ty, 186, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('#', cols.no, ty + 5.5);
    doc.text('PRODUCT', cols.product, ty + 5.5);
    doc.text('BRAND', cols.brand, ty + 5.5);
    doc.text('VARIANT', cols.variant, ty + 5.5);
    doc.text('QTY', cols.qty, ty + 5.5);
    doc.text('RATE', cols.rate, ty + 5.5);
    doc.text('AMOUNT', cols.amount, ty + 5.5, { align: 'right' });
  };
  drawTableHeader(y);
  y += 8;

  items.forEach((item, idx) => {
    const nameLines = doc.splitTextToSize(item.name, 66) as string[];
    const rowH = Math.max(8, nameLines.length * 4.5 + 3.5);
    if (y + rowH > 245) { doc.addPage(); y = 16; drawTableHeader(y); y += 8; }
    if (idx % 2 === 1) { doc.setFillColor(246, 247, 250); doc.rect(12, y, 186, rowH, 'F'); }
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(String(idx + 1), cols.no, y + 5.5);
    doc.setFont('helvetica', 'bold');
    nameLines.forEach((l, li) => doc.text(l, cols.product, y + 5.5 + li * 4.5));
    doc.setFont('helvetica', 'normal');
    doc.text(item.brand, cols.brand, y + 5.5);
    doc.text(item.size, cols.variant, y + 5.5);
    doc.text(String(item.qty), cols.qty, y + 5.5);
    doc.text(inr(item.price), cols.rate, y + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(inr(item.total), cols.amount, y + 5.5, { align: 'right' });
    y += rowH;
    doc.setDrawColor(225, 226, 232);
    doc.setLineWidth(0.2);
    doc.line(12, y, 198, y);
  });

  // ===== Totals =====
  y += 6;
  const totalsX = 118;
  const totalRow = (label: string, value: string, bold = false, fill = false) => {
    if (fill) { doc.setFillColor(...LIGHT); doc.rect(totalsX, y - 4.5, 80, 8, 'F'); }
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 11 : 9);
    doc.setTextColor(...(bold ? NAVY : GRAY));
    doc.text(label, totalsX + 4, y);
    doc.setTextColor(...NAVY);
    doc.text(value, 198, y, { align: 'right' });
    y += bold ? 9 : 6.5;
  };
  totalRow('Subtotal', inr(subtotal));
  totalRow('Delivery', delivery === 0 ? 'FREE' : inr(delivery));
  if (handling > 0) totalRow('Handling', inr(handling));
  if (Math.abs(adjustment) > 0.5) totalRow('Store Adjustment', inr(adjustment));
  totalRow('GRAND TOTAL', inr(order.total), true, true);

  // ===== QR tracking block + signature =====
  const blockTop = Math.max(y + 6, 190);
  if (qrDataUrl) {
    const qx = 158;
    const qy = blockTop;
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.3);
    doc.roundedRect(qx, qy, 40, 47, 2, 2, 'S');
    doc.addImage(qrDataUrl, 'PNG', qx + 6, qy + 4, 28, 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text('SCAN TO TRACK ORDER', qx + 20, qy + 37, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text(`#${order.orderId}`, qx + 20, qy + 43, { align: 'center' });
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(`For ${siteSettings.businessName}`, 12, blockTop + 6);
  doc.setDrawColor(180, 182, 192);
  doc.setLineWidth(0.3);
  doc.line(12, blockTop + 22, 70, blockTop + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('Authorised Signatory', 12, blockTop + 27);

  // ===== Footer =====
  const footerY = 285;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(`Track online: ${trackingUrl}`, W / 2, footerY - 4, { align: 'center' });
  doc.setFillColor(...NAVY);
  doc.rect(0, footerY, W, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Goods once sold will not be returned unless defective. Payment due as per agreed terms. Subject to Kalikiri, AP jurisdiction.', W / 2, footerY + 5, { align: 'center' });
  doc.text(`Thank you for your business! — ${siteSettings.businessName}`, W / 2, footerY + 9, { align: 'center' });

  doc.save(`HSN-Invoice-${order.orderId}.pdf`);
}

export default function OrderSuccess({ orderId }: { orderId: string }) {
  const { getOrderById, setPage, siteContent, siteSettings, transportZones } = useApp();
  const [copied, setCopied] = useState(false);
  const [animPhase, setAnimPhase] = useState(0);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const order = getOrderById(orderId);

  useEffect(() => {
    const timers = [setTimeout(() => setAnimPhase(1), 200), setTimeout(() => setAnimPhase(2), 500), setTimeout(() => setAnimPhase(3), 800), setTimeout(() => setAnimPhase(4), 1000), setTimeout(() => setAnimPhase(5), 1200), setTimeout(() => setAnimPhase(6), 1400), setTimeout(() => setAnimPhase(7), 1600), setTimeout(() => setAnimPhase(8), 1800)];
    return () => timers.forEach(clearTimeout);
  }, []);

  const copyOrderId = useCallback(() => { navigator.clipboard.writeText(orderId); setCopied(true); setTimeout(() => setCopied(false), 2000); }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
        <div className="text-center space-y-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold">Order not found</h2>
          <p className="text-sm text-slate-400">Order ID: {orderId}</p>
          <button onClick={() => setPage('home')} className="bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm">Go to Home</button>
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

  const trackingUrl = `${window.location.origin}/track-order/${order.orderId}`;

  const handleDownloadInvoice = () => {
    const qrDataUrl = qrCanvasRef.current?.toDataURL('image/png') ?? null;
    void downloadInvoice(order, siteSettings, bustedImageSrc('/windows-h-logo.png'), qrDataUrl);
  };

  return (
    <div className="min-h-screen bg-[#050816] relative overflow-hidden">
      {/* Hidden high-res QR canvas used by the PDF invoice (must stay rendered, not display:none) */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
        <QRCodeCanvas ref={qrCanvasRef} value={trackingUrl} size={512} level="M" marginSize={4} />
      </div>

      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-6 relative transition-all duration-700 ${animPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            {/* Glowing ring */}
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/50 animate-[spin_3s_linear_infinite]" style={{ borderTopColor: '#a855f7', borderRightColor: '#ec4899', borderBottomColor: '#3b82f6' }} />
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm" />
            {/* Checkmark */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${animPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
            </div>
            {/* Particles */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-700 ${animPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: ['#a855f7', '#ec4899', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'][i], top: '50%', left: '50%', transform: `translate(${Math.cos(i * 60 * Math.PI / 180) * 45}px, ${Math.sin(i * 60 * Math.PI / 180) * 45}px)` }} />
            ))}
          </div>

          <h1 className={`text-2xl sm:text-3xl font-black text-white font-industrial tracking-tight transition-all duration-700 delay-200 ${animPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            ORDER PLACED SUCCESSFULLY!
          </h1>
          <p className={`text-slate-400 text-sm mt-2 transition-all duration-500 delay-300 ${animPhase >= 4 ? 'opacity-100' : 'opacity-0'}`}>
            Thank you for ordering with {siteSettings.businessName}. Your order has been successfully registered.
          </p>
        </div>

        {/* Order Reference ID */}
        <div className={`bg-white/5 border border-purple-500/20 rounded-2xl p-5 text-center mb-6 transition-all duration-500 ${animPhase >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Reference ID</div>
          <div className="text-xl sm:text-2xl font-black text-white font-industrial">#{order.orderId}</div>
          <button onClick={copyOrderId} className="mt-3 inline-flex items-center space-x-1.5 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/15 transition">
            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Order ID copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copy Order ID</span></>}
          </button>
        </div>

        {/* Action Buttons */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 transition-all duration-500 ${animPhase >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={handleDownloadInvoice} className="flex flex-col items-center space-y-2 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-blue-500/30 transition group">
            <Download className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-slate-300">Download Invoice</span>
          </button>
          <a href={waHref(siteContent.whatsapp, `Hello HSN Cement & Steel, I have placed an order. Order ID: #${order.orderId}. Please confirm my order and delivery details.`)}
            target="_blank" rel="noreferrer" className="flex flex-col items-center space-y-2 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-[#25D366]/30 transition group">
            <WhatsAppIcon className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-slate-300">WhatsApp Store</span>
          </a>
          <a href={telHref(siteContent.phone)} className="flex flex-col items-center space-y-2 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-blue-500/30 transition group">
            <Phone className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-slate-300">Call Store</span>
          </a>
          <button onClick={() => setPage('products')} className="flex flex-col items-center space-y-2 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-purple-500/30 transition group">
            <ShoppingCart className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-slate-300">Continue Shopping</span>
          </button>
        </div>

        {/* Track Order Button */}
        <button onClick={() => setPage('order-tracking', order.orderId)}
          className={`w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white font-black py-4 rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-lg hover:from-blue-400 hover:via-indigo-500 hover:to-purple-500 transition mb-8 ${animPhase >= 6 ? 'opacity-100' : 'opacity-0'}`}>
          <MapPin className="w-5 h-5" /><span>TRACK MY ORDER</span>
        </button>

        <div className={`grid lg:grid-cols-12 gap-6 transition-all duration-500 ${animPhase >= 7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Left column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white font-industrial mb-5">ORDER STATUS</h3>
              <div className="space-y-0">
                {ORDER_STATUSES.filter(s => !['returned', 'cancelled'].includes(s.key)).map((status, idx) => {
                  const isCompleted = idx <= currentStatusIdx && !isCancelled;
                  const isCurrent = order.status === status.key;
                  const description = ['Order Placed', 'Store will confirm your order', 'Products are being prepared', 'Order is ready for delivery', 'Driver is on the way', 'Order successfully delivered'][idx] || '';
                  return (
                    <div key={status.key} className="flex items-start space-x-4 relative">
                      {idx < 5 && <div className={`absolute left-4 top-8 w-0.5 h-8 transition-all duration-500 ${isCompleted ? 'bg-gradient-to-b from-purple-500 to-blue-500' : 'bg-white/10'}`} />}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${isCurrent ? 'bg-gradient-to-br from-purple-500 to-blue-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : isCompleted ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-white/5 border border-white/10'}`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5 text-white" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                      </div>
                      <div className="pb-6">
                        <div className={`text-xs font-bold ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>{status.label}</div>
                        <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-purple-400' : isCompleted ? 'text-slate-500' : 'text-slate-700'}`}>{description}</div>
                        {isCurrent && <div className="text-[9px] text-purple-400 font-bold mt-0.5 uppercase tracking-wider">Current</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {isCancelled && (
                <div className="mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center">
                  <div className="text-sm font-bold text-rose-400">ORDER CANCELLED</div>
                  <div className="text-[10px] text-slate-400 mt-1">This order has been cancelled.</div>
                </div>
              )}
            </div>

            {/* Ordered Products */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white font-industrial mb-4">YOUR ORDER</h3>
              <div className="space-y-3">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 bg-white/[0.03] rounded-xl p-3 border border-white/5">
                    <img src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-200 line-clamp-1">{item.product.name}</div>
                      <div className="text-[10px] text-slate-400">{item.product.brand}{item.selectedSize ? ` | ${item.selectedSize}` : ''}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Qty: {item.quantity} x Rs.{item.unitPrice}</div>
                    </div>
                    <div className="text-sm font-black text-white">Rs.{item.lineTotal.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              {/* Price Breakdown */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="font-bold text-slate-300">Rs.{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-slate-400"><span>Transport / Delivery</span><span className={`font-bold ${order.deliveryCharge === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>{order.deliveryCharge === 0 ? 'FREE' : `Rs.${order.deliveryCharge.toLocaleString('en-IN')}`}</span></div>
                {order.finalDeliveryCharge !== undefined && order.finalDeliveryCharge !== order.deliveryCharge && (
                  <div className="flex justify-between text-slate-300 bg-blue-500/5 rounded-lg px-2 py-1.5"><span>Final Delivery (confirmed by store)</span><span className="font-bold text-blue-300">Rs.{order.finalDeliveryCharge.toLocaleString('en-IN')}</span></div>
                )}
                {order.handlingCharge > 0 && <div className="flex justify-between text-slate-400"><span>Handling</span><span className="font-bold text-slate-300">Rs.{order.handlingCharge.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between items-end pt-3 border-t border-white/10">
                  <span className="font-bold text-slate-300">Grand Total</span>
                  <span className="text-xl font-black text-white">Rs.{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Ticket */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HSN CEMENT & STEEL</div>
                  <div className="text-[9px] text-slate-500">Premium Building Materials</div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${ORDER_STATUSES.find(s => s.key === order.status)?.color || 'text-slate-400 bg-white/5 border-white/10'}`}>
                  {ORDER_STATUSES.find(s => s.key === order.status)?.label || order.status}
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Order</span><span className="text-white font-bold">#{order.orderId}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="text-white font-bold">{order.customer.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mobile</span><span className="text-white font-bold">{order.customer.mobile}</span></div>
                <div className="flex justify-between items-start"><span className="text-slate-500 shrink-0">Delivery</span><span className="text-white font-bold text-right ml-2">{order.customer.address}, {order.customer.landmark}</span></div>
                {order.customer.village && <div className="flex justify-between"><span className="text-slate-500">Village</span><span className="text-white font-bold">{order.customer.village}</span></div>}
                {order.customer.mandal && <div className="flex justify-between"><span className="text-slate-500">Mandal</span><span className="text-white font-bold">{order.customer.mandal}</span></div>}
                {order.customer.pincode && <div className="flex justify-between"><span className="text-slate-500">Pincode</span><span className="text-white font-bold">{order.customer.pincode}</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="text-white font-black text-sm">Rs.{order.total.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="text-white font-bold">{order.paymentMode}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="text-white font-bold">{new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h4 className="text-xs font-black text-white flex items-center space-x-2 mb-3"><Truck className="w-4 h-4 text-blue-400" /><span>SITE DELIVERY</span></h4>
              <div className="text-xs text-slate-400 space-y-1.5">
                <p>{order.deliveryLocation || 'Kalikiri Site Delivery'}</p>
                <p>Estimated: <span className="text-white font-bold">{zone?.estimatedTime || 'Same-day or next morning'}</span></p>
                <p className="text-[10px] text-slate-500">For nearby areas: 1-2 business days</p>
              </div>
            </div>

            {/* Payment Card */}
            <div className={`rounded-2xl p-5 border ${order.paymentMode.includes('Cash') ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
              <h4 className="text-xs font-black text-white flex items-center space-x-2 mb-2">
                {order.paymentMode.includes('Cash') ? <><CreditCard className="w-4 h-4 text-amber-400" /><span>CASH ON DELIVERY</span></> : <><Check className="w-4 h-4 text-emerald-400" /><span>PAYMENT RECEIVED</span></>}
              </h4>
              <p className="text-xs text-slate-400">{order.paymentMode.includes('Cash') ? 'Please keep the payable amount ready at the time of delivery.' : 'Online payment has been completed.'}</p>
              <div className="mt-2 text-sm font-black text-white">Amount: Rs.{order.total.toLocaleString('en-IN')}</div>
            </div>

            {/* QR Code + Track */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <div className="w-32 h-32 mx-auto mb-3 rounded-xl bg-white p-2 flex items-center justify-center">
                <QRCodeSVG value={trackingUrl} size={112} level="M" marginSize={2} />
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scan to Track Order #{order.orderId}</div>
            </div>

            {/* Customer Support */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h4 className="text-xs font-black text-white mb-3">NEED HELP WITH YOUR ORDER?</h4>
              <p className="text-[10px] text-slate-400 mb-3">Our store team is available to assist you.</p>
              <div className="grid grid-cols-2 gap-2">
                <a href={waHref(siteContent.whatsapp, `Hello, I need help with order #${order.orderId}`)}
                  target="_blank" rel="noreferrer" className="flex items-center justify-center space-x-1.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-bold py-2.5 rounded-xl text-[10px] hover:bg-[#25D366]/20 transition">
                  <WhatsAppIcon className="w-3.5 h-3.5" /><span>WhatsApp Store</span>
                </a>
                <a href={telHref(siteContent.phone)} className="flex items-center justify-center space-x-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold py-2.5 rounded-xl text-[10px] hover:bg-blue-500/20 transition">
                  <Phone className="w-3.5 h-3.5" /><span>Call Store</span>
                </a>
              </div>
              <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-slate-500"><Clock className="w-3 h-3" /><span>{siteContent.businessHours || 'Open 12 Hours Daily'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        <a href={waHref(siteContent.whatsapp)} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"><WhatsAppIcon className="w-6 h-6 text-white" /></a>
        <a href={telHref(siteContent.phone)} className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"><Phone className="w-5 h-5 text-white" /></a>
      </div>
    </div>
  );
}
