import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
export default function FloatingButtons({ onCartClick }) {
    const { cartCount } = useApp();
    return (_jsxs("div", { className: "fixed bottom-32 md:bottom-36 right-3 sm:right-6 z-40 flex flex-col items-end space-y-3", children: [cartCount > 0 && onCartClick && (_jsxs("button", { type: "button", onClick: onCartClick, className: "lg:hidden relative w-11 h-11 md:w-14 md:h-14 btn-purchase rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(249,115,22,0.25)] hover:scale-110 transition-all duration-300", title: "Open cart", "aria-label": `Open cart, ${cartCount} items`, children: [_jsx(ShoppingCart, { className: "w-5 h-5 md:w-6 md:h-6" }), _jsx("span", { className: "absolute -top-1 -right-1 bg-purchase text-obsidian text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-lg", children: cartCount })] }))] }));
}
