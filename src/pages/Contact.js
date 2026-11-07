import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { MapPin, Phone as PhoneIcon, Clock, Send, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { telHref, waHref } from '../lib/phone';
const WhatsAppIcon = ({ className }) => (_jsx("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: className, children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" }) }));
export default function Contact() {
    const { siteContent, showToast, addNotification } = useApp();
    const [form, setForm] = useState({ name: '', mobile: '', materialNeeded: 'Cement & Steel', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.mobile) {
            showToast('Please enter your name and mobile number', 'error');
            return;
        }
        const mobileDigits = form.mobile.replace(/\D/g, '').slice(-10);
        if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
            showToast('Enter a valid 10-digit Indian mobile number.', 'error');
            return;
        }
        // BUILD 65 audit fix: the old form showed "Inquiry sent successfully"
        // but sent nothing anywhere — the store never received it. An inquiry
        // is now a real admin notification (synced via the cloud copy, so the
        // admin sees it on every device in Notifications).
        // BUILD 80 security fix: inquiries used to be type 'announcement',
        // so the public notification popup showed every visitor the
        // inquirer's name and mobile number (and auto-popped it on Home).
        // 'inquiry' is admin-only: the popup filters it out (see
        // NotificationPopup), while the admin dashboard still lists all
        // notifications, so the admin still sees the inquiry there.
        addNotification({
            id: `inquiry-${Date.now()}`,
            title: `Inquiry: ${form.name}`,
            content: `${form.materialNeeded} — ${form.message || 'No notes'} — Mobile: ${mobileDigits}`,
            type: 'inquiry',
            active: true,
            read: false,
            createdAt: new Date().toISOString(),
        });
        setSubmitted(true);
        showToast('Inquiry sent successfully!');
    };
    return (_jsx("div", { className: "py-12 bg-transparent min-h-screen space-y-12 relative z-10", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center max-w-3xl mx-auto mb-12", children: [_jsxs("h1", { className: "text-3xl sm:text-5xl font-black text-ivory font-industrial", children: ["Contact ", _jsx("span", { className: "bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent", children: "HSN CEMENT AND STEEL" })] }), _jsx("p", { className: "text-silver text-sm sm:text-base mt-2", children: "Get instant price quotes, structural material estimates, or schedule site delivery." })] }), _jsxs("div", { className: "grid lg:grid-cols-12 gap-8", children: [_jsxs("div", { className: "lg:col-span-5 rounded-3xl border border-gunmetal space-y-6 p-6 sm:p-8", style: {
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                                backdropFilter: 'blur(16px) saturate(140%)',
                                WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3), 0 18px 44px -22px rgba(0,0,0,0.7), 0 8px 22px -12px rgba(0,0,0,0.5)',
                            }, children: [_jsx("h3", { className: "text-xl font-bold text-ivory border-b border-gunmetal pb-3", children: "Store Details" }), _jsxs("div", { className: "space-y-4 text-sm", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(MapPin, { className: "w-5 h-5 text-brand-400 shrink-0 mt-1" }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-silver uppercase", children: "Address" }), _jsx("div", { className: "text-ivory font-semibold", children: siteContent.address })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(PhoneIcon, { className: "w-5 h-5 text-brand-400 shrink-0 mt-1" }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-silver uppercase", children: "Phone Number" }), _jsx("a", { href: telHref(siteContent.phone), className: "text-ivory font-bold hover:underline", children: siteContent.phone })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(WhatsAppIcon, { className: "w-5 h-5 text-champagne shrink-0 mt-1" }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-silver uppercase", children: "WhatsApp Number" }), _jsx("a", { href: waHref(siteContent.whatsapp), target: "_blank", rel: "noreferrer", className: "text-champagne font-bold hover:underline", children: siteContent.whatsapp })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Clock, { className: "w-5 h-5 text-brand-400 shrink-0 mt-1" }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-silver uppercase", children: "Business Hours" }), _jsx("div", { className: "text-ivory font-semibold", children: siteContent.businessHours })] })] })] }), _jsxs("div", { className: "pt-4 flex space-x-3 border-t border-gunmetal", children: [_jsx("a", { href: telHref(siteContent.phone), className: "flex-1 btn-brand font-bold py-3 rounded-xl text-xs text-center transition", children: "Call Store" }), _jsx("a", { href: waHref(siteContent.whatsapp), target: "_blank", rel: "noreferrer", className: "flex-1 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-3 rounded-xl text-xs text-center transition", children: "WhatsApp Us" })] })] }), _jsxs("div", { className: "lg:col-span-7 rounded-3xl border border-gunmetal p-6 sm:p-8", style: {
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                                backdropFilter: 'blur(16px) saturate(140%)',
                                WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3), 0 18px 44px -22px rgba(0,0,0,0.7), 0 8px 22px -12px rgba(0,0,0,0.5)',
                            }, children: [_jsx("h3", { className: "text-xl font-bold text-ivory mb-6", children: "Send Price Inquiry / Site Quote Request" }), submitted ? (_jsxs("div", { className: "rounded-2xl text-center space-y-3 border border-gunmetal p-6", style: {
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                                        backdropFilter: 'blur(12px) saturate(150%)',
                                        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 26px -16px rgba(0,0,0,0.7), 0 6px 14px -10px rgba(0,0,0,0.45)',
                                    }, children: [_jsx(CheckCircle, { className: "w-12 h-12 text-success-foreground mx-auto" }), _jsx("h4", { className: "text-lg font-bold", children: "Thank You! Your Inquiry Has Been Received." }), _jsxs("p", { className: "text-xs text-silver", children: ["Our store manager will contact you on ", _jsx("strong", { children: form.mobile }), " shortly with pricing and delivery terms."] }), _jsx("button", { onClick: () => { setSubmitted(false); setForm({ name: '', mobile: '', materialNeeded: 'Cement & Steel', message: '' }); }, className: "btn-brand font-bold text-xs px-4 py-2 rounded-xl transition", children: "Send Another Inquiry" })] })) : (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-silver block mb-1", children: "Your Full Name *" }), _jsx("input", { type: "text", required: true, placeholder: "e.g. K. Venkat Reddy", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), className: "w-full bg-obsidian border border-gunmetal text-ivory px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-silver block mb-1", children: "Mobile Number *" }), _jsx("input", { type: "tel", required: true, placeholder: "e.g. 9848022334", value: form.mobile, onChange: e => setForm({ ...form, mobile: e.target.value }), className: "w-full bg-obsidian border border-gunmetal text-ivory px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-silver block mb-1", children: "Materials Requirement" }), _jsxs("select", { value: form.materialNeeded, onChange: e => setForm({ ...form, materialNeeded: e.target.value }), className: "w-full bg-obsidian border border-gunmetal text-ivory px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-500", children: [_jsx("option", { value: "Cement & Steel", children: "Cement & Steel (Bulk Order)" }), _jsx("option", { value: "Cement Only", children: "Cement Bags Only (JSW, ACC, Dalmia, Bharathi)" }), _jsx("option", { value: "Steel Only", children: "Tata Tiscon & Vizag Steel TMT Bars" }), _jsx("option", { value: "Binding Wires & Nails", children: "Binding Wires & Construction Nails" }), _jsx("option", { value: "Pipes & Waterproofing", children: "PVC Pipes, Tanks & Waterproofing" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-silver block mb-1", children: "Site Location & Quantity Notes" }), _jsx("textarea", { rows: 4, placeholder: "Enter site location in Kalikiri / nearby mandals and estimated quantities...", value: form.message, onChange: e => setForm({ ...form, message: e.target.value }), className: "w-full bg-obsidian border border-gunmetal text-ivory px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-500 resize-none" })] }), _jsxs("button", { type: "submit", className: "w-full btn-brand font-black py-3.5 rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2 text-sm transition", children: [_jsx(Send, { className: "w-4 h-4" }), _jsx("span", { children: "Submit Inquiry" })] })] }))] })] }), _jsx("div", { className: "mt-12 grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                        { label: 'Store 1', plusCode: 'MR23+GF' },
                        { label: 'Store 2', plusCode: 'MR53+J4' },
                    ].map(store => {
                        const query = encodeURIComponent(`${store.plusCode} Kalikiri, Andhra Pradesh`);
                        return (_jsxs("div", { className: "rounded-2xl overflow-hidden border border-gunmetal", children: [_jsx("iframe", { src: `https://maps.google.com/maps?q=${query}&z=17&output=embed`, width: "100%", height: "280", style: { border: 0 }, allowFullScreen: true, loading: "lazy", referrerPolicy: "no-referrer-when-downgrade", title: `HSN Cement and Steel - ${store.label}` }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 p-3 bg-charcoal/40", children: [_jsxs("p", { className: "text-[11px] text-silver", children: [_jsx(MapPin, { className: "w-3 h-3 inline mr-1 text-brand-400" }), store.label, " \u2014 ", store.plusCode, " Kalikiri, AP"] }), _jsxs("a", { href: `https://www.google.com/maps/dir/?api=1&destination=${query}`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center space-x-1.5 btn-brand px-3 py-1.5 rounded-lg text-[11px] font-bold transition", children: [_jsx(MapPin, { className: "w-3 h-3" }), _jsx("span", { children: "Get Directions" })] })] })] }, store.plusCode));
                    }) })] }) }));
}
