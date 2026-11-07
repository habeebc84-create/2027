import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Building2, Truck, Scissors, ShieldCheck, Phone, ExternalLink, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { telHref, waHref } from '../lib/phone';
const detailedServices = [
    {
        title: 'Bulk Supply for Major Construction Projects',
        icon: Building2,
        description: 'We supply high volume cement bags, primary steel rebar bundles, and hardware directly to residential apartments, commercial buildings, and government civil contracts with tiered bulk discounts.',
        features: ['Direct factory dispatch', 'Customized billing schedules', 'Dedicated account coordinator'],
    },
    {
        title: 'On-Site Vehicle Express Delivery',
        icon: Truck,
        description: 'Our fleet of heavy lorries and tractors ensures prompt material delivery straight to your construction site across Kalikiri mandal and neighboring regions.',
        features: ['Same-day local dispatch', 'Safe unloading support', 'Live GPS tracking alert'],
    },
    {
        title: 'Steel Rebar Cutting & Bending Support',
        icon: Scissors,
        description: 'Custom length cutting and stirrup bending service to save on-site labor time, minimize steel scrap wastage, and speed up structural column/beam work.',
        features: ['Precision bending specs', 'Reduced site scrap', 'Organized bundled tags'],
    },
    {
        title: 'Structural Quality Testing & Certification',
        icon: ShieldCheck,
        description: 'Every cement batch and steel rebar ton comes backed with manufacturer quality test certificates (MTC), guaranteeing compliance with IS standards.',
        features: ['Original mill certificates', 'Grade 53 OPC & Fe 550D compliant', '100% genuine guarantee'],
    },
];
export default function Services() {
    const { siteContent } = useApp();
    return (_jsx("div", { className: "py-12 bg-transparent min-h-screen space-y-16 relative z-10", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center max-w-3xl mx-auto mb-12", children: [_jsxs("div", { className: "inline-flex items-center space-x-1.5 bg-brand-500/10 text-ivory text-xs font-bold px-3 py-1 rounded-full border border-brand-500/30 mb-4", children: [_jsx(Truck, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Our Premium Services" })] }), _jsxs("h1", { className: "text-3xl sm:text-5xl font-black text-ivory leading-tight font-industrial", children: ["Comprehensive ", _jsx("span", { className: "bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent", children: "Supply & Logistics" })] }), _jsx("p", { className: "text-silver text-sm sm:text-base mt-4 leading-relaxed", children: "HSN CEMENT AND STEEL offers comprehensive supply, logistics, and site support tailored for contractors, civil engineers, and individual home builders." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: detailedServices.map((svc, i) => {
                        const Icon = svc.icon;
                        return (_jsxs("div", { className: "bg-charcoal rounded-3xl border border-gunmetal hover:border-brand-500/40 transition duration-300 flex flex-col p-6 sm:p-8", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-brand-500/10 text-ivory border border-brand-500/30 flex items-center justify-center mb-6", children: _jsx(Icon, { className: "w-7 h-7" }) }), _jsx("h3", { className: "text-xl font-bold text-ivory mb-3", children: svc.title }), _jsx("p", { className: "text-silver text-xs sm:text-sm leading-relaxed mb-6", children: svc.description }), _jsx("ul", { className: "space-y-2 mb-6", children: svc.features.map((feat, j) => (_jsxs("li", { className: "flex items-center space-x-2 text-xs text-silver font-semibold", children: [_jsx(Check, { className: "w-4 h-4 text-brand-400 shrink-0" }), _jsx("span", { children: feat })] }, j))) }), _jsxs("div", { className: "pt-4 border-t border-gunmetal/80 flex items-center justify-between mt-auto", children: [_jsxs("a", { href: telHref(siteContent.phone), className: "text-ivory hover:text-brand-300 font-bold text-xs flex items-center space-x-1", children: [_jsx(Phone, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Call for Quote" })] }), _jsxs("a", { href: waHref(siteContent.whatsapp, `Hi, I want to inquire about ${svc.title}`), target: "_blank", rel: "noreferrer", className: "bg-champagne/10 hover:bg-champagne/20 text-champagne font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 border border-champagne/30", children: [_jsx(ExternalLink, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "WhatsApp Inquiry" })] })] })] }, i));
                    }) }), _jsxs("div", { className: "mt-16 pt-12 border-t border-gunmetal", children: [_jsxs("h2", { className: "text-xl font-black text-ivory font-industrial mb-6 text-center", children: ["Delivery ", _jsx("span", { className: "bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent", children: "Zones & Rates" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", children: [
                                { zone: 'Kalikiri Yard (Self Pick-up)', charge: 'FREE' },
                                { zone: 'Kalikiri (Within Town)', charge: '₹500' },
                                { zone: 'Pileru', charge: '₹1,000' },
                                { zone: 'Vayalpadu', charge: '₹1,200' },
                                { zone: 'Valmikipuram', charge: '₹1,500' },
                                { zone: 'Gurramkonda', charge: '₹1,800' },
                                { zone: 'Madanapalle', charge: '₹2,000' },
                            ].map((loc, i) => (_jsxs("div", { className: "bg-charcoal border border-gunmetal rounded-xl p-4 flex items-center justify-between hover:border-brand-500/30 transition", children: [_jsx("span", { className: "text-xs font-bold text-ivory", children: loc.zone }), _jsx("span", { className: `text-xs font-black ${loc.charge === 'FREE' ? 'text-brand-400' : 'text-ivory'}`, children: loc.charge })] }, i))) })] })] }) }));
}
