import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShoppingCart, Star, Package } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
export default function ProductCard({ product }) {
    const { addToCart, setSelectedProductId, setPage } = useApp();
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || '');
    const [quantity, setQuantity] = useState(1);
    const currentPrice = (() => {
        if (selectedSize && product.sizes) {
            const sizeData = product.sizes.find(s => s.size === selectedSize);
            if (sizeData)
                return sizeData.price;
        }
        return product.price;
    })();
    // BUILD 65 audit fix: the card used to let quantity grow past stock
    // (detail page already capped it) and let out-of-stock items be added.
    const currentStock = (() => {
        if (selectedSize && product.sizes) {
            const sizeData = product.sizes.find(s => s.size === selectedSize);
            if (sizeData)
                return sizeData.stock;
        }
        return product.stock;
    })();
    const inStock = currentStock === undefined || currentStock > 0;
    const maxQty = currentStock === undefined ? 999 : Math.max(1, currentStock);
    const handleViewDetail = () => {
        setSelectedProductId(product.id);
        setPage('product-detail');
    };
    return (_jsxs("div", { className: "rounded-2xl bg-charcoal border border-gunmetal overflow-hidden hover:border-champagne/60 transition-all duration-300 hover:shadow-[0_18px_44px_-20px_rgba(0,0,0,0.7)] flex flex-col group h-full", children: [_jsxs("div", { className: "relative overflow-hidden cursor-pointer", onClick: handleViewDetail, children: [_jsx("img", { src: product.image, alt: product.name, className: "w-full h-32 sm:h-48 object-cover group-hover:scale-105 transition duration-500" }), _jsxs("div", { className: "absolute top-3 left-3 right-3 flex items-start justify-between gap-2", children: [product.featured ? (_jsxs("div", { className: "bg-champagne text-obsidian px-2 py-0.5 rounded-full text-[10px] font-black flex items-center space-x-1 shrink-0", children: [_jsx(Star, { className: "w-3 h-3" }), _jsx("span", { children: "FEATURED" })] })) : _jsx("span", {}), _jsx("div", { className: "rounded-lg px-2 py-1 text-[10px] text-ivory font-bold border border-gunmetal bg-obsidian/85 backdrop-blur-md truncate min-w-0", children: product.grade })] })] }), _jsxs("div", { className: "p-3 sm:p-4 flex-1 flex flex-col", children: [_jsx("div", { className: "text-[10px] text-champagne font-semibold uppercase tracking-wider mb-1", children: product.category }), _jsx("h3", { className: "text-sm font-bold text-ivory leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-champagne transition", onClick: handleViewDetail, children: product.name }), _jsx("p", { className: "text-xs text-silver leading-relaxed mb-4 line-clamp-2 flex-1", children: product.description }), _jsxs("div", { className: "flex items-center space-x-1.5 mb-3", children: [_jsx(Package, { className: "w-3 h-3 text-silver" }), _jsx("span", { className: "text-[10px] text-silver font-semibold", children: product.brand })] }), product.sizes && product.sizes.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "text-[10px] font-bold text-silver block mb-1", children: "Select Size" }), _jsx("select", { value: selectedSize, onChange: e => setSelectedSize(e.target.value), className: "w-full bg-obsidian border border-gunmetal text-ivory px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-champagne transition", children: product.sizes.map(s => _jsxs("option", { value: s.size, children: [s.size, " - Rs.", s.price] }, s.size)) })] })), _jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-auto pt-3 border-t border-gunmetal", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-lg font-black text-ivory", children: ["Rs.", currentPrice] }), _jsx("div", { className: "text-[10px] text-silver", children: product.type === 'cement' ? 'per bag' : product.type === 'steel' ? 'per kg' : 'per unit' })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex items-center rounded-lg border border-gunmetal bg-obsidian", children: [_jsx("button", { onClick: () => setQuantity(Math.max(1, quantity - 1)), className: "px-2 py-1.5 text-silver hover:text-ivory text-xs font-bold", "aria-label": `Decrease quantity of ${product.name}`, children: "-" }), _jsx("span", { className: "text-xs font-bold text-ivory px-1 min-w-[20px] text-center", children: quantity }), _jsx("button", { onClick: () => setQuantity(Math.min(maxQty, quantity + 1)), className: "px-2 py-1.5 text-silver hover:text-ivory text-xs font-bold", "aria-label": `Increase quantity of ${product.name}`, children: "+" })] }), _jsx("button", { onClick: () => { if (inStock)
                                            addToCart(product, Math.min(maxQty, quantity), selectedSize); }, disabled: !inStock, className: "btn-purchase p-2.5 rounded-xl shadow-lg disabled:opacity-50", "aria-label": inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`, children: _jsx(ShoppingCart, { className: "w-4 h-4" }) })] })] })] })] }));
}
