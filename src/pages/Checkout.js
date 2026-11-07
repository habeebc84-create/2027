import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bustedImageSrc } from '../lib/images';
export default function Checkout({ onBackToCart, onOrderSuccess }) {
    const { cart, cartTotal, cartCount, placeOrder, showToast, transportZones, setPage } = useApp();
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [village, setVillage] = useState('');
    const [mandal, setMandal] = useState('');
    const [pincode, setPincode] = useState('');
    const [landmark, setLandmark] = useState('');
    const [deliveryNote, setDeliveryNote] = useState('');
    const [paymentMode, setPaymentMode] = useState('Cash on Delivery');
    const [deliveryMethod, setDeliveryMethod] = useState('delivery');
    const [deliveryLocation, setDeliveryLocation] = useState(() => 
    // BUILD 87: the dropdown below only lists zones with charge > 0, but
    // this used to default to transportZones[0] — "Kalikiri Yard
    // (Self Pick-up)", charge 0 — which is NOT in the list. The browser
    // then DISPLAYED the first option ("Kalikiri (Within Town) - Rs.500")
    // while the state stayed on the Yard zone, so the summary said
    // "Delivery FREE" under a Rs.500 zone. Default to the first
    // chargeable zone, so the shown zone and the charged zone agree.
    transportZones.find(z => z.charge > 0)?.name || transportZones[0]?.name || '');
    const [isProcessing, setIsProcessing] = useState(false);
    // BUILD 87: inline field errors, so a bad mobile/pincode is flagged on
    // the field itself instead of only at submit (toast).
    const [mobileError, setMobileError] = useState('');
    const [pincodeError, setPincodeError] = useState('');
    const selectedZone = transportZones.find(z => z.name === deliveryLocation) || transportZones.find(z => z.charge > 0) || transportZones[0] || { name: '', charge: 0 };
    const deliveryCharge = deliveryMethod === 'pickup' ? 0 : selectedZone.charge;
    const handlingCharge = cart.reduce((acc, item) => {
        if (item.product.type === 'cement')
            return acc + item.quantity * 5;
        if (item.product.type === 'steel' || item.product.type === 'wire')
            return acc + item.quantity * 20;
        return acc;
    }, 0);
    const totalPayable = cartTotal + deliveryCharge + handlingCharge;
    if (cart.length === 0) {
        return (_jsxs("div", { className: "py-20 text-center space-y-4", children: [_jsx("h2", { className: "text-xl font-bold text-ivory", children: "Your Cart is Empty" }), _jsx("button", { onClick: () => setPage('home'), className: "btn-purchase px-5 py-2.5 rounded-xl text-xs", children: "Return to Shop" })] }));
    }
    return (_jsxs("div", { className: "py-8 sm:py-12 min-h-screen bg-gradient-to-br from-obsidian via-brand-950/40 to-brand-950/30 relative z-10", children: [_jsxs("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8", children: [_jsxs("button", { onClick: onBackToCart, className: "inline-flex items-center space-x-2 text-xs font-bold text-silver hover:text-ivory transition", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: "Back to Products" })] }), _jsxs("h1", { className: "text-3xl sm:text-4xl font-black text-ivory font-industrial tracking-tight", children: ["Secure ", _jsx("span", { className: "text-ivory", children: "Checkout" })] }), _jsxs("div", { className: "grid lg:grid-cols-12 gap-6 sm:gap-8", children: [_jsxs("div", { className: "lg:col-span-7 bg-charcoal/40 backdrop-blur-2xl border border-gunmetal p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-2xl", children: [_jsxs("h2", { className: "text-lg font-black text-ivory flex items-center space-x-2 border-b border-gunmetal pb-4", children: [_jsx(MapPin, { className: "w-5 h-5 text-ivory" }), _jsx("span", { children: "Delivery Details" })] }), _jsxs("form", { onSubmit: e => {
                                            e.preventDefault();
                                            // BUILD 77 audit fix: a second submit (double-click / Enter
                                            // while the 1500ms timer runs) used to place a second order.
                                            if (isProcessing)
                                                return;
                                            if (!name || !mobile || !address || !landmark) {
                                                showToast('Please fill required fields.', 'error');
                                                return;
                                            }
                                            // BUILD 65 audit fix: the old check (length < 10) accepted
                                            // letters and 11+ digit numbers. Indian mobiles are exactly
                                            // 10 digits starting 6-9; store the cleaned digits.
                                            const mobileDigits = mobile.replace(/\D/g, '').slice(-10);
                                            if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
                                                showToast('Enter a valid 10-digit Indian mobile number.', 'error');
                                                return;
                                            }
                                            if (pincode && !/^\d{6}$/.test(pincode.replace(/\D/g, ''))) {
                                                showToast('Pincode must be 6 digits.', 'error');
                                                return;
                                            }
                                            setIsProcessing(true);
                                            setTimeout(async () => {
                                                // BUILD 65: use the id placeOrder actually created — the
                                                // old code computed its own id from the counter, which
                                                // could drift from the stored order. BUILD 84: placeOrder
                                                // is async now (it tries the Node backend first).
                                                try {
                                                    const oid = await placeOrder({
                                                        items: cart, total: totalPayable,
                                                        customer: { name, mobile: mobileDigits, email, address, village, mandal, pincode, landmark },
                                                        paymentMode, deliveryNote, deliveryLocation: selectedZone.name,
                                                        deliveryCharge, handlingCharge, deliveryMethod,
                                                    });
                                                    onOrderSuccess(oid);
                                                }
                                                catch {
                                                    setIsProcessing(false);
                                                    showToast('Could not place the order. Please try again.', 'error');
                                                }
                                            }, 1500);
                                        }, className: "space-y-5 text-xs sm:text-sm", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Full Name *" }), _jsx("input", { type: "text", value: name, onChange: e => setName(e.target.value), required: true, placeholder: "Contractor / Builder name", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" })] }), _jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Mobile Number *" }), _jsx("input", { type: "tel", value: mobile, onChange: e => { setMobile(e.target.value); setMobileError(''); }, onBlur: () => { const d = mobile.replace(/\D/g, '').slice(-10); setMobileError(mobile.trim() !== '' && !/^[6-9]\d{9}$/.test(d) ? 'Enter a valid 10-digit Indian mobile number.' : ''); }, required: true, placeholder: "10-digit number", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" }), mobileError && _jsx("p", { className: "text-[11px] text-red-400 font-bold mt-1.5", children: mobileError })] }), _jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "Optional", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" })] }), _jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Village / Town" }), _jsx("input", { type: "text", value: village, onChange: e => setVillage(e.target.value), placeholder: "e.g., Kalikiri", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" })] }), _jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Mandal" }), _jsx("input", { type: "text", value: mandal, onChange: e => setMandal(e.target.value), placeholder: "e.g., Kalikiri", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" })] }), _jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Pincode" }), _jsx("input", { type: "text", value: pincode, onChange: e => { setPincode(e.target.value); setPincodeError(''); }, onBlur: () => { setPincodeError(pincode.trim() !== '' && !/^\d{6}$/.test(pincode.replace(/\D/g, '')) ? 'Pincode must be 6 digits.' : ''); }, placeholder: "517234", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" }), pincodeError && _jsx("p", { className: "text-[11px] text-red-400 font-bold mt-1.5", children: pincodeError })] })] }), _jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Delivery Address *" }), _jsx("textarea", { value: address, onChange: e => setAddress(e.target.value), required: true, rows: 2, placeholder: "Full site address", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600 resize-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Landmark *" }), _jsx("input", { type: "text", value: landmark, onChange: e => setLandmark(e.target.value), required: true, placeholder: "Near Water Tank / Panchayat Office", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" })] }), _jsxs("div", { className: "pt-2", children: [_jsx("label", { className: "font-bold text-ivory block mb-2", children: "Delivery Method" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { type: "button", onClick: () => setDeliveryMethod('delivery'), className: `p-3 rounded-xl border text-xs font-bold transition ${deliveryMethod === 'delivery' ? 'bg-brand-500/20 text-ivory border-brand-400/50' : 'bg-obsidian/50 text-silver border-gunmetal/50'}`, children: [_jsx(Truck, { className: "w-4 h-4 inline mr-1.5" }), "Site Delivery"] }), _jsxs("button", { type: "button", onClick: () => setDeliveryMethod('pickup'), className: `p-3 rounded-xl border text-xs font-bold transition ${deliveryMethod === 'pickup' ? 'bg-brand-500/20 text-ivory border-brand-400/50' : 'bg-obsidian/50 text-silver border-gunmetal/50'}`, children: [_jsx(MapPin, { className: "w-4 h-4 inline mr-1.5" }), "Store Pickup"] })] })] }), deliveryMethod === 'delivery' && (_jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Transport Zone" }), _jsx("select", { value: deliveryLocation, onChange: e => setDeliveryLocation(e.target.value), className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition", children: transportZones.filter(z => z.charge > 0).map(z => (_jsxs("option", { value: z.name, className: "bg-obsidian", children: [z.name, " - Rs.", z.charge, " (", z.estimatedTime, ")"] }, z.id))) })] })), _jsxs("div", { children: [_jsx("label", { className: "font-bold text-silver block mb-1.5", children: "Additional Notes (Optional)" }), _jsx("input", { type: "text", value: deliveryNote, onChange: e => setDeliveryNote(e.target.value), placeholder: "e.g., Unload near column foundation", className: "w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" })] }), _jsxs("div", { className: "pt-4 border-t border-gunmetal", children: [_jsxs("label", { className: "font-bold text-ivory block mb-3 flex items-center space-x-2", children: [_jsx(CreditCard, { className: "w-5 h-5 text-ivory" }), _jsx("span", { children: "Payment Mode" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("button", { type: "button", onClick: () => setPaymentMode('Cash on Delivery'), className: `p-3 rounded-xl border text-xs font-bold transition ${paymentMode === 'Cash on Delivery' ? 'bg-brand-500/20 text-ivory border-brand-400/50' : 'bg-obsidian/50 text-silver border-gunmetal/50'}`, children: "Cash on Delivery" }), _jsx("button", { type: "button", onClick: () => setPaymentMode('UPI on Delivery'), className: `p-3 rounded-xl border text-xs font-bold transition ${paymentMode === 'UPI on Delivery' ? 'bg-brand-500/20 text-ivory border-brand-400/50' : 'bg-obsidian/50 text-silver border-gunmetal/50'}`, children: "UPI on Delivery" })] })] }), _jsx("button", { type: "submit", disabled: isProcessing, className: "btn-purchase w-full py-4 rounded-2xl text-sm shadow-2xl mt-4 disabled:opacity-60", children: "CONFIRM & PLACE ORDER" })] })] }), _jsx("div", { className: "lg:col-span-5", children: _jsxs("div", { className: "bg-charcoal/40 backdrop-blur-2xl border border-gunmetal p-6 sm:p-8 rounded-[2rem] shadow-2xl sticky top-28", children: [_jsxs("h3", { className: "text-lg font-black text-ivory border-b border-gunmetal pb-4 flex justify-between items-center mb-4", children: [_jsx("span", { children: "Order Summary" }), _jsxs("span", { className: "bg-brand-500/20 text-ivory px-3 py-1 rounded-full text-xs", children: [cartCount, " Items"] })] }), _jsx("div", { className: "space-y-3 max-h-60 overflow-y-auto pr-2 mb-4", children: cart.map((item, idx) => {
                                                let price = item.product.price;
                                                if (item.selectedSize && item.product.sizes) {
                                                    const s = item.product.sizes.find(sz => sz.size === item.selectedSize);
                                                    if (s)
                                                        price = s.price;
                                                }
                                                return (_jsxs("div", { className: "flex justify-between items-center bg-obsidian/40 p-3 rounded-xl border border-gunmetal", children: [_jsxs("div", { className: "flex-1 pr-3", children: [_jsx("div", { className: "font-bold text-ivory text-xs line-clamp-1", children: item.product.name }), _jsxs("div", { className: "text-[10px] text-silver", children: ["Qty: ", item.quantity, " ", item.selectedSize ? `(${item.selectedSize})` : ''] })] }), _jsxs("div", { className: "font-black text-ivory text-xs whitespace-nowrap", children: ["Rs.", (price * item.quantity).toLocaleString('en-IN')] })] }, idx));
                                            }) }), _jsxs("div", { className: "border-t border-gunmetal pt-4 space-y-2 text-xs", children: [_jsxs("div", { className: "flex justify-between text-silver", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { className: "font-bold", children: ["Rs.", cartTotal.toLocaleString('en-IN')] })] }), _jsxs("div", { className: "flex justify-between text-silver", children: [_jsx("span", { children: "Delivery" }), _jsx("span", { className: deliveryCharge === 0 ? 'text-success-foreground font-bold' : 'text-ivory', children: deliveryCharge === 0 ? 'FREE' : `Rs.${deliveryCharge}` })] }), handlingCharge > 0 && _jsxs("div", { className: "flex justify-between text-silver", children: [_jsx("span", { children: "Handling" }), _jsxs("span", { children: ["Rs.", handlingCharge] })] }), _jsxs("div", { className: "flex justify-between items-end pt-3 border-t border-gunmetal", children: [_jsx("span", { className: "font-bold text-silver", children: "Total" }), _jsxs("span", { className: "text-xl font-black text-ivory", children: ["Rs.", totalPayable.toLocaleString('en-IN')] })] })] })] }) })] })] }), isProcessing && (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-md", children: _jsxs("div", { className: "bg-charcoal border border-gunmetal p-12 rounded-3xl shadow-2xl flex flex-col items-center space-y-6", children: [_jsx("div", { className: "w-20 h-20 rounded-full bg-charcoal border-2 border-gunmetal flex items-center justify-center shadow-[0_0_30px_rgba(198,168,117,0.3)]", children: _jsx("img", { src: bustedImageSrc('/windows-h-logo.png'), alt: "Logo", className: "w-14 h-14 object-contain" }) }), _jsx("h3", { className: "text-lg font-bold text-ivory animate-pulse", children: "Processing Order..." })] }) }))] }));
}
