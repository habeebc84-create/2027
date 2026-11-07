import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, MapPin, Phone, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { telHref, nationalDigits } from '../lib/phone';
import { orderTrackingUrl } from '../lib/deepLink';
import { trackOrderViaApi } from '../lib/apiOrders';
import { bustedImageSrc } from '../lib/images';
import { QRCodeSVG } from 'qrcode.react';
import { ORDER_STATUSES } from '../types';
const statusIcons = {
    placed: Package, confirmed: CheckCircle, processing: Clock, ready_dispatch: Package, out_delivery: Truck, delivered: CheckCircle, cancelled: Package, returned: Package,
};
export default function OrderTracking({ initialOrderId }) {
    const { getOrderById, setPage, siteContent, refreshFromCloud } = useApp();
    const [orderId, setOrderId] = useState(initialOrderId || '');
    const [mobile, setMobile] = useState('');
    const [found, setFound] = useState(false);
    const [error, setError] = useState('');
    const [searching, setSearching] = useState(false);
    const [autoOpening, setAutoOpening] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    // BUILD 80 security fix: delivery address + phone are personal data.
    // Status, timeline and total are visible with just the order ID
    // (so a QR scan still shows live status), but address/phone stay
    // hidden until the order's mobile number is entered and matches.
    // Before this, a blank mobile field showed the full delivery info
    // to anyone who knew (or guessed) an order ID.
    const [piiUnlocked, setPiiUnlocked] = useState(false);
    const [piiMobile, setPiiMobile] = useState('');
    const [piiError, setPiiError] = useState('');
    // BUILD 84: an order fetched from the Node backend (not on this device
    // yet). Kept separate from the local list so a status-only copy (mobile
    // not matched, customer blanked) never overwrites the real order later.
    const [remoteOrder, setRemoteOrder] = useState(null);
    const handleSearch = async () => {
        setError('');
        setFound(false);
        setPiiUnlocked(false);
        setPiiError('');
        setRemoteOrder(null);
        if (!orderId.trim()) {
            setError('Please enter your Order ID');
            return;
        }
        const order = getOrderById(orderId.trim());
        if (order) {
            if (mobile && order.customer.mobile !== mobile.trim()) {
                setError('Mobile number does not match this order.');
                return;
            }
            // Mobile matches (or was left blank for status-only view).
            setPiiUnlocked(Boolean(mobile) && order.customer.mobile === mobile.trim());
            setFound(true);
            return;
        }
        // Not on this device yet — ask the Node backend, which reads Postgres.
        setSearching(true);
        const res = await trackOrderViaApi(orderId.trim(), mobile.trim() || undefined);
        setSearching(false);
        if (res.kind === 'mismatch') {
            setError('Mobile number does not match this order.');
            return;
        }
        if (res.kind !== 'ok') {
            setError('Order not found. Please check your Order ID.');
            return;
        }
        setRemoteOrder(res.order);
        setPiiUnlocked(Boolean(mobile) && res.order.customer.mobile === mobile.trim());
        setFound(true);
    };
    const unlockPii = async () => {
        setPiiError('');
        const order = getOrderById(orderId.trim());
        if (order) {
            if (order.customer.mobile === piiMobile.trim())
                setPiiUnlocked(true);
            else
                setPiiError('Mobile number does not match this order.');
            return;
        }
        // Status-only copy from the backend: re-ask with the mobile to unlock.
        if (!remoteOrder) {
            setPiiError('Order not found.');
            return;
        }
        const res = await trackOrderViaApi(orderId.trim(), piiMobile.trim());
        if (res.kind === 'ok') {
            setRemoteOrder(res.order);
            setPiiUnlocked(true);
        }
        else if (res.kind === 'mismatch')
            setPiiError('Mobile number does not match this order.');
        else
            setPiiError('Order not found.');
    };
    // Opened from an order's QR code: fetch that exact order automatically.
    // If it isn't on this device yet, actively re-pull the cloud copy between
    // retries so the order's details load directly from the scan.
    useEffect(() => {
        if (!initialOrderId)
            return;
        let alive = true;
        setSearching(true);
        setAutoOpening(true);
        const attempt = async (tries = 0) => {
            if (getOrderById(initialOrderId)) {
                if (alive) {
                    setFound(true);
                    setSearching(false);
                    setAutoOpening(false);
                }
                return;
            }
            await refreshFromCloud();
            if (getOrderById(initialOrderId)) {
                if (alive) {
                    setFound(true);
                    setSearching(false);
                    setAutoOpening(false);
                }
                return;
            }
            if (tries < 7 && alive) {
                setTimeout(() => attempt(tries + 1), 1200);
            }
            else if (alive) {
                // Last resort: ask the Node backend (Postgres) for a status-only
                // copy, so a QR scan works even before this device has synced.
                const res = await trackOrderViaApi(initialOrderId);
                if (alive && res.kind === 'ok') {
                    setRemoteOrder(res.order);
                    setFound(true);
                    setSearching(false);
                    setAutoOpening(false);
                }
                else if (alive) {
                    setSearching(false);
                    setAutoOpening(false);
                    setError('Order not found on this device yet. Please try again in a moment.');
                }
            }
        };
        void attempt();
        return () => { alive = false; };
    }, [initialOrderId, getOrderById, refreshFromCloud]);
    const order = found ? (getOrderById(orderId.trim()) || remoteOrder) : null;
    const trackUrl = order ? orderTrackingUrl(order.orderId) : '';
    const copyTrackingLink = () => {
        if (!trackUrl)
            return;
        navigator.clipboard.writeText(trackUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };
    return (_jsx("div", { className: "py-12 min-h-screen bg-transparent relative z-10", children: _jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("button", { onClick: () => setPage('home'), className: "inline-flex items-center space-x-2 text-xs font-bold text-silver hover:text-ivory transition mb-6", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: "Back to Home" })] }), _jsxs("div", { className: "text-center mb-10", children: [_jsxs("h1", { className: "text-3xl sm:text-4xl font-black text-ivory font-industrial", children: ["Track Your ", _jsx("span", { className: "bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent", children: "Order" })] }), _jsx("p", { className: "text-silver text-sm mt-2", children: "Enter your order details to check delivery status" })] }), _jsx("div", { className: "bg-charcoal border border-gunmetal rounded-3xl p-6 sm:p-8 backdrop-blur-xl mb-8", children: _jsxs("div", { className: "space-y-4", children: [error && _jsx("div", { className: "bg-brand-500/10 border border-brand-500/30 text-brand-400 px-4 py-3 rounded-xl text-xs font-bold text-center", children: error }), autoOpening && !found && (_jsxs("div", { className: "bg-brand-500/10 border border-brand-500/30 text-brand-300 px-4 py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2", children: [_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" }), _jsxs("span", { children: ["Opening live tracking for order #", initialOrderId, "\u2026"] })] })), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-silver block mb-1.5", children: "Order ID" }), _jsx("input", { type: "text", value: orderId, onChange: e => setOrderId(e.target.value), placeholder: "e.g., HSN-2026-00001", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-silver block mb-1.5", children: "Mobile Number (optional for status \u2014 needed to show delivery details)" }), _jsx("input", { type: "tel", value: mobile, onChange: e => setMobile(e.target.value), placeholder: "10-digit mobile number", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition" })] }), _jsxs("button", { onClick: handleSearch, className: "w-full btn-brand font-bold py-3 rounded-xl text-sm flex items-center justify-center space-x-2 hover:from-brand-400 hover:to-brand-500 transition shadow-lg", children: [_jsx(Search, { className: "w-4 h-4" }), _jsx("span", { children: searching ? 'Searching…' : 'Track Order' })] })] }) }), order && (_jsxs("div", { className: "bg-charcoal border border-gunmetal rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-gunmetal pb-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-black text-ivory", children: order.orderId }), _jsxs("div", { className: "text-xs text-silver", children: ["Placed on ", new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-black text-ivory", children: ["Rs.", order.total.toLocaleString('en-IN')] }), _jsxs("div", { className: "text-xs text-silver", children: [order.items.length, " item(s)"] })] })] }), _jsx("div", { className: "space-y-0", children: ORDER_STATUSES.filter(s => !['returned'].includes(s.key)).map((status, idx) => {
                                const timelineEntry = order.timeline.find(t => t.status === status.key);
                                const isCompleted = timelineEntry !== undefined;
                                const isCurrent = order.status === status.key;
                                const Icon = statusIcons[status.key] || Package;
                                return (_jsxs("div", { className: "flex items-start space-x-4 relative", children: [idx < ORDER_STATUSES.filter(s => s.key !== 'returned').length - 1 && (_jsx("div", { className: `absolute left-4 top-8 w-0.5 h-8 ${isCompleted ? 'bg-success' : 'bg-gunmetal'}` })), _jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${isCompleted ? 'bg-success/20 border border-success' : 'bg-charcoal border border-gunmetal'} ${isCurrent ? 'ring-2 ring-champagne/60' : ''}`, children: _jsx(Icon, { className: `w-3.5 h-3.5 ${isCompleted ? 'text-success-foreground' : 'text-slate-600'}` }) }), _jsxs("div", { className: `pb-8 ${isCurrent ? 'text-ivory' : isCompleted ? 'text-silver' : 'text-slate-600'}`, children: [_jsx("div", { className: `text-sm font-bold ${isCurrent ? 'text-ivory' : ''}`, children: status.label }), timelineEntry && _jsx("div", { className: "text-[10px] text-silver", children: new Date(timelineEntry.date).toLocaleString() }), isCurrent && _jsx("div", { className: "text-[10px] text-champagne font-bold mt-0.5", children: "Current Status" })] })] }, status.key));
                            }) }), _jsxs("div", { className: "bg-charcoal/50 border border-gunmetal rounded-2xl p-4 flex items-center space-x-4", children: [_jsx("div", { className: "w-20 h-20 shrink-0 rounded-lg bg-white p-1.5", children: _jsx(QRCodeSVG, { value: trackUrl, size: 68, level: "M", marginSize: 0 }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("img", { src: bustedImageSrc('/windows-h-logo.png'), alt: "HSN logo", className: "h-8 mb-1 rounded object-contain" }), _jsx("div", { className: "text-xs font-bold text-ivory", children: "HSN Cement & Steel" }), _jsx("div", { className: "text-[10px] text-silver", children: "Scan to re-open live status of this order" }), _jsx("button", { onClick: copyTrackingLink, className: "mt-2 inline-flex items-center space-x-1.5 bg-white/10 border border-gunmetal px-3 py-1.5 rounded-full text-[10px] font-bold text-silver hover:text-ivory hover:bg-white/15 transition", children: linkCopied ? _jsxs(_Fragment, { children: [_jsx(Check, { className: "w-3 h-3 text-brand-400" }), _jsx("span", { className: "text-success-foreground", children: "Link copied!" })] }) : _jsxs(_Fragment, { children: [_jsx(Copy, { className: "w-3 h-3" }), _jsx("span", { children: "Copy tracking link" })] }) })] })] }), piiUnlocked ? (_jsxs("div", { className: "bg-charcoal/50 border border-gunmetal rounded-2xl p-4 space-y-2 text-xs", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-brand-400" }), _jsxs("span", { className: "text-silver", children: [order.customer.address, " ", order.customer.landmark ? `- ${order.customer.landmark}` : ''] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Truck, { className: "w-3.5 h-3.5 text-brand-400" }), _jsxs("span", { className: "text-silver", children: [order.deliveryLocation, " (Rs.", order.finalDeliveryCharge ?? order.deliveryCharge, order.finalDeliveryCharge !== undefined && order.finalDeliveryCharge !== order.deliveryCharge ? ' final' : '', ")"] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Phone, { className: "w-3.5 h-3.5 text-brand-400" }), _jsx("span", { className: "text-silver", children: order.customer.mobile })] })] })) : (_jsxs("div", { className: "bg-charcoal/50 border border-gunmetal rounded-2xl p-4 space-y-3 text-xs", children: [_jsx("p", { className: "text-silver font-bold", children: "Delivery details are hidden \u2014 enter the mobile number used for this order to view the address and phone." }), piiError && _jsx("p", { className: "text-brand-400 font-bold", children: piiError }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "tel", value: piiMobile, onChange: e => setPiiMobile(e.target.value), placeholder: "10-digit mobile number", className: "flex-1 bg-obsidian/50 border border-gunmetal/50 text-ivory px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-brand-500 transition" }), _jsx("button", { onClick: unlockPii, className: "btn-brand font-bold px-4 py-2 rounded-xl text-xs shrink-0", children: "Show details" })] })] }))] })), _jsxs("div", { className: "text-center mt-8 text-xs text-silver", children: ["Need help? ", _jsxs("a", { href: telHref(siteContent.phone), className: "text-brand-400 font-bold hover:underline", children: ["Call ", nationalDigits(siteContent.phone)] })] })] }) }));
}
