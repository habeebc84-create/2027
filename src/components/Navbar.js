import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bustedImageSrc } from '../lib/images';
import { waHref } from '../lib/phone';
const WhatsAppIcon = ({ className }) => (_jsx("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: className, children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" }) }));
// Top bar: brand, WhatsApp and cart only. Larger bar, still pinned. The section links
// (Products, Services, Gallery, Contact, Track Order) live in
// the FloatingBottomNav dock, so they are not repeated here.
// The bar is always pinned to the top — it never slides away or moves
// while scrolling, on the home page or anywhere else.
const navItems = [
    { label: 'Home', page: 'home' },
    { label: 'Products', page: 'products' },
    { label: 'Services', page: 'services' },
    { label: 'Gallery', page: 'gallery' },
    { label: 'Contact', page: 'contact' },
    { label: 'Track Order', page: 'order-tracking' },
];
export default function Navbar({ onCartClick }) {
    const { setPage, cartCount, siteContent, currentPage } = useApp();
    const handleNav = (e, page) => {
        e.preventDefault();
        setPage(page);
    };
    return (_jsx("nav", { className: "fixed top-0 left-0 right-0 z-50 pt-2 px-3 sm:px-5", children: _jsx("div", { className: "w-full max-w-7xl mx-auto rounded-2xl bg-obsidian/90 backdrop-blur-xl border border-gunmetal shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-3 sm:px-4 py-1.5", children: _jsxs("div", { className: "flex items-center justify-between gap-3 sm:gap-4 h-12 sm:h-16", children: [_jsxs("a", { href: "/", onClick: e => handleNav(e, 'home'), className: "flex items-center space-x-2 cursor-pointer group shrink-0", "aria-label": "HSN Cement and Steel \u2014 Home", children: [_jsx("img", { src: bustedImageSrc('/windows-h-logo.png'), alt: "HSN Logo", className: "w-10 h-10 sm:w-14 sm:h-14 rounded-xl object-contain border border-gunmetal bg-obsidian/40 p-1 shadow-md group-hover:border-white/30 transition duration-300" }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-sm sm:text-lg font-black text-ivory tracking-tight group-hover:text-ivory transition font-industrial leading-tight", children: "HSN CEMENT & STEEL" }), _jsx("span", { className: "text-[11px] tracking-[0.08em] font-bold text-silver uppercase hidden sm:block leading-tight", children: "Premium Building Materials" })] })] }), _jsx("div", { className: "hidden lg:flex items-center gap-1 flex-1 justify-center px-2", children: navItems.map(item => {
                            const isActive = currentPage === item.page;
                            return (_jsx("button", { type: "button", "aria-current": isActive ? 'page' : undefined, onClick: e => handleNav(e, item.page), className: `whitespace-nowrap px-3 py-2 rounded-full text-xs font-bold transition ${isActive ? 'bg-champagne/15 text-champagne' : 'text-silver hover:text-ivory hover:bg-charcoal'}`, children: item.label }, item.page));
                        }) }), _jsxs("div", { className: "flex items-center space-x-2 shrink-0", children: [_jsxs("a", { href: waHref(siteContent.whatsapp), target: "_blank", rel: "noreferrer", className: "hidden sm:flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#1DA851] text-white px-3.5 py-2 rounded-lg text-xs xl:text-sm font-bold transition shadow-md shadow-green-500/20", children: [_jsx(WhatsAppIcon, { className: "w-4 h-4" }), _jsx("span", { children: "WhatsApp" })] }), _jsxs("button", { onClick: onCartClick, className: "relative bg-charcoal/60 hover:bg-slate-700/60 border border-gunmetal text-ivory p-2.5 rounded-lg transition shadow-md", "aria-label": "Open cart", children: [_jsx(ShoppingCart, { className: "w-6 h-6" }), cartCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 bg-brand text-obsidian text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg", children: cartCount }))] })] })] }) }) }));
}
