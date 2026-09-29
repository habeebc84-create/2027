import React, { useEffect, useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, MapPin, Phone, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { telHref, nationalDigits } from '../lib/phone';
import { orderTrackingUrl } from '../lib/deepLink';
import { bustedImageSrc } from '../lib/images';
import { QRCodeSVG } from 'qrcode.react';
import { ORDER_STATUSES } from '../types';

const statusIcons: Record<string, React.ElementType> = {
  placed: Package, confirmed: CheckCircle, processing: Clock, ready_dispatch: Package, out_delivery: Truck, delivered: CheckCircle, cancelled: Package, returned: Package,
};

export default function OrderTracking({ initialOrderId }: { initialOrderId?: string }) {
  const { getOrderById, setPage, siteContent, refreshFromCloud } = useApp();
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [mobile, setMobile] = useState('');
  const [found, setFound] = useState(false);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [autoOpening, setAutoOpening] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleSearch = () => {
    setError(''); setFound(false);
    if (!orderId.trim()) { setError('Please enter your Order ID'); return; }
    const order = getOrderById(orderId.trim());
    if (!order) { setError('Order not found. Please check your Order ID.'); return; }
    if (mobile && order.customer.mobile !== mobile.trim()) { setError('Mobile number does not match this order.'); return; }
    setFound(true);
  };

  // Opened from an order's QR code: fetch that exact order automatically.
  // If it isn't on this device yet, actively re-pull the cloud copy between
  // retries so the order's details load directly from the scan.
  useEffect(() => {
    if (!initialOrderId) return;
    let alive = true;
    setSearching(true);
    setAutoOpening(true);
    const attempt = async (tries = 0) => {
      if (getOrderById(initialOrderId)) {
        if (alive) { setFound(true); setSearching(false); setAutoOpening(false); }
        return;
      }
      await refreshFromCloud();
      if (getOrderById(initialOrderId)) {
        if (alive) { setFound(true); setSearching(false); setAutoOpening(false); }
        return;
      }
      if (tries < 7 && alive) { setTimeout(() => attempt(tries + 1), 1200); }
      else if (alive) { setSearching(false); setAutoOpening(false); setError('Order not found on this device yet. Please try again in a moment.'); }
    };
    void attempt();
    return () => { alive = false; };
  }, [initialOrderId, getOrderById, refreshFromCloud]);

  const order = found ? getOrderById(orderId.trim()) : null;
  const trackUrl = order ? orderTrackingUrl(order.orderId) : '';

  const copyTrackingLink = () => {
    if (!trackUrl) return;
    navigator.clipboard.writeText(trackUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="py-6 sm:py-12 min-h-screen bg-transparent relative z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => setPage('home')} className="inline-flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition mb-6">
          <ArrowLeft className="w-4 h-4" /><span>Back to Home</span>
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white font-industrial">Track Your <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Order</span></h1>
          <p className="text-slate-400 text-sm mt-2">Enter your order details to check delivery status</p>
        </div>

        {/* Search Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-xl mb-8">
          <div className="space-y-4">
            {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-xs font-bold text-center">{error}</div>}
            {autoOpening && !found && (
              <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Opening live tracking for order #{initialOrderId}…</span>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Order ID</label>
              <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g., HSN-2026-00001"
                className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Mobile Number (optional)</label>
              <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10-digit mobile number"
                className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition" />
            </div>
            <button onClick={handleSearch} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center space-x-2 hover:from-blue-400 hover:to-indigo-500 transition shadow-lg">
              <Search className="w-4 h-4" /><span>{searching ? 'Searching…' : 'Track Order'}</span>
            </button>
          </div>
        </div>

        {/* Order Result */}
        {order && (
          <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <div className="text-lg font-black text-white">{order.orderId}</div>
                <div className="text-xs text-slate-400">Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div className="sm:text-right">
                <div className="text-lg font-black text-white">Rs.{order.total.toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-400">{order.items.length} item(s)</div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-0">
              {ORDER_STATUSES.filter(s => !['returned'].includes(s.key)).map((status, idx) => {
                const timelineEntry = order.timeline.find(t => t.status === status.key);
                const isCompleted = timelineEntry !== undefined;
                const isCurrent = order.status === status.key;
                const Icon = statusIcons[status.key] || Package;

                return (
                  <div key={status.key} className="flex items-start space-x-4 relative">
                    {/* Line */}
                    {idx < ORDER_STATUSES.filter(s => s.key !== 'returned').length - 1 && (
                      <div className={`absolute left-4 top-8 w-0.5 h-8 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    )}
                    {/* Dot */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${isCurrent ? 'bg-blue-500/30 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : isCompleted ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-800 border border-slate-700'}`}>
                      <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </div>
                    {/* Label */}
                    <div className={`pb-8 ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div className={`text-sm font-bold ${isCurrent ? 'text-white' : ''}`}>{status.label}</div>
                      {timelineEntry && <div className="text-[10px] text-slate-500">{new Date(timelineEntry.date).toLocaleString()}</div>}
                      {isCurrent && <div className="text-[10px] text-blue-400 font-bold mt-0.5">Current Status</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Share / re-open this tracking page (same QR as the invoice) */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="w-20 h-20 shrink-0 rounded-lg bg-white p-1.5">
                <QRCodeSVG value={trackUrl} size={68} level="M" marginSize={0} />
              </div>
              <div className="min-w-0 flex flex-col items-center sm:items-start">
                <img src={bustedImageSrc('/windows-h-logo.png')} alt="HSN logo" className="h-8 mb-1 rounded object-contain" />
                <div className="text-xs font-bold text-white">HSN Cement &amp; Steel</div>
                <div className="text-[10px] text-slate-400">Scan to re-open live status of this order</div>
                <button onClick={copyTrackingLink} className="mt-2 inline-flex items-center space-x-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/15 transition">
                  {linkCopied ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Link copied!</span></> : <><Copy className="w-3 h-3" /><span>Copy tracking link</span></>}
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 text-blue-400" /><span className="text-slate-300">{order.customer.address} {order.customer.landmark ? `- ${order.customer.landmark}` : ''}</span></div>
              <div className="flex items-center space-x-2"><Truck className="w-3.5 h-3.5 text-emerald-400" /><span className="text-slate-300">{order.deliveryLocation} (Rs.{order.finalDeliveryCharge ?? order.deliveryCharge}{order.finalDeliveryCharge !== undefined && order.finalDeliveryCharge !== order.deliveryCharge ? ' final' : ''})</span></div>
              <div className="flex items-center space-x-2"><Phone className="w-3.5 h-3.5 text-purple-400" /><span className="text-slate-300">{order.customer.mobile}</span></div>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="text-center mt-8 text-xs text-slate-500">
          Need help? <a href={telHref(siteContent.phone)} className="text-blue-400 font-bold hover:underline">Call {nationalDigits(siteContent.phone)}</a>
        </div>
      </div>
    </div>
  );
}
