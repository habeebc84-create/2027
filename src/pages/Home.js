import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowRight, Phone, Shield, Truck, ChevronRight, Eye, Package, TrendingUp, Award, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import VectorWordmark from '../components/VectorWordmark';
import { telHref } from '../lib/phone';
// Code-split: the burst is a decorative hero background and pulls in
// three.js, so it loads as its own chunk after first paint instead of
// blocking the catalogue on it. The hero's gradient/glow canvas below
// is the fallback while the chunk is in flight (and if WebGL is absent).
const GlowingParticles = lazy(() => import('../components/GlowingParticles'));
export default function Home() {
    const { siteContent, products, setPage, categories, marketPrices, siteSettings } = useApp();
    // Phone tuning for the two WebGL pieces on this page (hero particle
    // density, closing wordmark rig): their sizes are tuned for desktop
    // frames, so desktop values would swamp a 390px screen.
    const [isPhone, setIsPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 640px)');
        const update = () => setIsPhone(mq.matches);
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);
    const featuredProducts = (Array.isArray(products) ? products : []).filter(p => p && p.featured && p.enabled).slice(0, 6);
    // "Rates Updated" stamp for the price index: the date the admin last
    // saved prices in the portal (defaults to today before the first save).
    const pricesDate = marketPrices?.updatedAt ? new Date(marketPrices.updatedAt) : new Date();
    const pricesDateLabel = pricesDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const pricesUpdatedText = pricesDate.toDateString() === new Date().toDateString() ? `Rates Updated: Today (${pricesDateLabel})` : `Rates Updated: ${pricesDateLabel}`;
    return (_jsxs("div", { className: "relative z-10", children: [_jsxs("section", { className: "home-hero relative flex items-center overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 z-0", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-charcoal via-obsidian to-obsidian" }), _jsx("div", { className: "absolute -top-24 -left-24 w-96 h-96 bg-champagne/10 blur-[120px] rounded-full" }), _jsx("div", { className: "absolute top-1/3 -right-24 w-96 h-96 bg-champagne/5 blur-[120px] rounded-full" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" })] }), _jsx("div", { "aria-hidden": "true", className: "pointer-events-none absolute inset-0 z-[1] overflow-hidden", children: _jsx("div", { className: "absolute left-1/2 top-[54%] aspect-square w-[440px] max-w-none -translate-y-1/2 translate-x-[-16%] opacity-80 sm:w-[600px] sm:translate-x-[-14%] lg:left-auto lg:right-[-140px] lg:w-[720px] lg:translate-x-0", children: _jsx(Suspense, { fallback: null, children: _jsx(GlowingParticles, { color: "#C6A875", hot: "#F7F5F0", density: isPhone ? 12 : 16, sizePercent: 95, style: { minWidth: 0, minHeight: 0, width: '100%', height: '100%' } }) }) }) }), _jsx("div", { "aria-hidden": "true", className: "pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-obsidian/80 via-obsidian/30 to-transparent" }), _jsxs("div", { className: "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-6", children: [_jsxs("span", { className: "rounded-full text-xs font-bold text-ivory bg-charcoal/70 border border-gunmetal px-4 py-2 flex items-center space-x-2 backdrop-blur-md", children: [_jsx(Shield, { className: "w-4 h-4 text-champagne" }), _jsxs("span", { children: ["GSTIN: ", siteSettings.gstNumber] })] }), ] }), _jsxs("h1", { className: "text-4xl sm:text-6xl lg:text-7xl font-black text-ivory tracking-tight leading-none drop-shadow-2xl font-industrial mb-8", children: ["HSN CEMENT ", _jsx("span", { className: "text-champagne", children: "AND STEEL" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("button", { onClick: () => setPage('products'), className: "btn-purchase px-8 py-4 rounded-2xl shadow-xl flex items-center justify-center space-x-3 text-base group", children: [_jsx(Eye, { className: "w-5 h-5" }), _jsx("span", { className: "tracking-wide", children: "Explore Materials Catalogue" }), _jsx(ArrowRight, { className: "w-5 h-5 group-hover:translate-x-1 transition" })] }), _jsxs("a", { href: telHref(siteContent.phone), className: "btn-secondary font-bold px-8 py-4 rounded-2xl text-center flex items-center justify-center space-x-2 text-base backdrop-blur-md shadow-xl", children: [_jsx(Phone, { className: "w-5 h-5" }), _jsxs("span", { children: ["Call (", siteContent.phone, ")"] })] })] })] })] }), _jsx("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12", children: _jsx(Reveal, { children: _jsxs("div", { className: "surface-light market-price-panel rounded-3xl p-6 sm:p-8 lg:p-10", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl sm:text-2xl font-black text-graphite font-industrial tracking-wide", children: "WHOLESALE TIERED PRICING TABLE" }), _jsx("p", { className: "text-[11px] text-muted-light mt-1", children: pricesUpdatedText })] }), ] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                                    { title: 'Cement Bags (OPC 53 / PPC 50kg)', badge: 'JSW / ACC / Dalmia', icon: Package, tiers: marketPrices.cement },
                                    { title: 'TMT Steel Bars (6mm - 32mm Fe 550D)', badge: 'Tata Tiscon / Vizag', icon: TrendingUp, tiers: marketPrices.steel },
                                ].map(group => {
                                    const Icon = group.icon;
                                    return (_jsxs("div", { className: "market-price-card rounded-2xl overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between gap-3 px-5 py-4 border-b border-gunmetal/20", children: [_jsxs("div", { className: "flex items-center space-x-2 min-w-0", children: [_jsx("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center bg-champagne/15 border border-champagne/40 shrink-0", children: _jsx(Icon, { className: "w-4 h-4 text-brand-ink" }) }), _jsx("h3", { className: "text-sm font-bold text-graphite font-industrial", children: group.title })] }), _jsx("span", { className: "text-[10px] font-bold text-muted-light rounded-full border border-gunmetal/25 px-2.5 py-1 shrink-0", children: group.badge })] }), _jsx("div", { children: group.tiers.map((tier, i) => (_jsxs("div", { className: "market-price-row flex items-center justify-between px-5 py-3.5 transition", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-bold text-graphite", children: tier.range }), _jsx("div", { className: "text-[10px] text-muted-light", children: tier.label })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-lg font-black text-graphite", children: tier.price }), _jsx("span", { className: "text-xs text-muted-light", children: tier.unit })] })] }, i))) })] }, group.title));
                                }) }), _jsxs("div", { className: "mt-8 flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsx("p", { className: "text-xs text-muted-light", children: "Prices are indicative and may vary. Call for today's confirmed rates." }), _jsxs("button", { onClick: () => setPage('products'), className: "btn-secondary font-bold px-6 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-lg", children: [_jsx("span", { children: "View Full Product Catalog" }), _jsx(ChevronRight, { className: "w-4 h-4" })] })] })] }) }) }), _jsxs("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16", children: [_jsx(Reveal, { children: _jsxs("div", { className: "mb-10", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-black text-ivory font-industrial", children: "Browse Our Product Categories" }), _jsx("p", { className: "text-silver text-sm mt-2", children: "Premium construction materials from top brands" })] }) }), _jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3", children: categories.map((cat, i) => (_jsx(Reveal, { delay: Math.min(i * 50, 400), className: "h-full", children: _jsxs("button", { onClick: () => setPage('products'), className: "rounded-2xl border border-gunmetal p-3 flex flex-col items-center space-y-2 transition group hover:border-champagne/50 hover:bg-charcoal w-full h-full", style: {
                                    background: 'var(--color-charcoal)',
                                    backdropFilter: 'blur(14px) saturate(160%)',
                                    WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3), 0 14px 34px -18px rgba(0,0,0,0.7), 0 6px 16px -10px rgba(0,0,0,0.45)',
                                }, children: [_jsx("img", { src: cat.image, alt: cat.name, className: "w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl group-hover:scale-110 transition" }), _jsx("span", { className: "text-[10px] sm:text-xs font-bold text-silver text-center leading-tight", children: cat.name })] }) }, cat.id))) })] }), _jsxs("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16", children: [_jsx(Reveal, { children: _jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-black text-ivory font-industrial", children: "Featured Products" }), _jsx("p", { className: "text-silver text-xs mt-1", children: "Top-rated materials at wholesale direct rates" })] })] }) }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6", children: featuredProducts.map((product, i) => (_jsx(Reveal, { delay: Math.min(i * 60, 360), className: "h-full", children: _jsx(ProductCard, { product: product }) }, product.id))) })] }), _jsxs("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16", children: [_jsx(Reveal, { children: _jsxs("div", { className: "mb-10", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-black text-ivory font-industrial", children: "Our Services" }), _jsx("p", { className: "text-silver text-sm mt-2", children: "Comprehensive supply and logistics for all project sizes" })] }) }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: [
                            { icon: Building2, title: 'Bulk Supply', desc: 'Direct factory dispatch for projects' },
                            { icon: Truck, title: 'Fleet Delivery', desc: 'Same-day local dispatch to site' },
                            { icon: Shield, title: 'Quality Certified', desc: 'Original mill test certificates' },
                            { icon: Award, title: '15+ Years', desc: 'Trusted industry experience' },
                        ].map((svc, i) => {
                            const Icon = svc.icon;
                            return (_jsx(Reveal, { delay: Math.min(i * 60, 240), className: "h-full", children: _jsxs("div", { className: "rounded-2xl border border-gunmetal p-5 text-center space-y-3 transition hover:border-champagne/50 hover:bg-charcoal h-full w-full", style: {
                                        background: 'var(--color-charcoal)',
                                        backdropFilter: 'blur(14px) saturate(160%)',
                                        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3), 0 14px 34px -18px rgba(0,0,0,0.7), 0 6px 16px -10px rgba(0,0,0,0.45)',
                                    }, children: [_jsx("div", { className: "w-12 h-12 rounded-xl border border-gunmetal flex items-center justify-center mx-auto", style: {
                                                background: 'color-mix(in srgb, var(--color-champagne) 14%, var(--color-charcoal))',
                                                backdropFilter: 'blur(12px) saturate(150%)',
                                                WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 14px -10px rgba(0,0,0,0.5)',
                                            }, children: _jsx(Icon, { className: "w-6 h-6 text-champagne" }) }), _jsx("h4", { className: "text-sm font-bold text-ivory", children: svc.title }), _jsx("p", { className: "text-xs text-silver", children: svc.desc })] }) }, i));
                        }) }), ] }), _jsx("h2", { className: "sr-only", children: "HSNCEMENTANDSTEEL" }), _jsx("section", { "aria-hidden": "true", className: "relative w-full", children: _jsx(Reveal, { className: "home-wordmark-reveal", children: _jsx(VectorWordmark, { text: "HSNCEMENTANDSTEEL", font: {
                            // Oswald is the site's industrial display face (see the
                            // .font-industrial token). Its condensed caps let the full
                            // 17-letter name render noticeably larger than the old
                            // mixed-case Inter mark while still fitting edge-to-edge.
                            fontFamily: 'Oswald',
                            fontWeight: 700,
                            // Larger reference glyphs make the closing brand mark easy to
                            // read on laptop and phone; the canvas fitting logic scales it
                            // down only when the full name needs to fit its available width.
                            fontSize: '260px',
                            lineHeight: '1em',
                            letterSpacing: '-0.01em',
                            textAlign: 'left',
                        }, background: "#0B0C0E", textColor: "#F7F5F0", shade: "#C2C1BD", accent: "rgba(198, 168, 117, 0.7)", reach: isPhone ? 150 : 290, handles: isPhone ? { size: 48, spread: 44, labels: true } : { size: 72, spread: 27, labels: true }, style: {
                            minWidth: 0,
                            minHeight: 0,
                            width: '100%',
                            height: 'clamp(200px, 44vw, 580px)',
                        } }) }) })] }));
}
