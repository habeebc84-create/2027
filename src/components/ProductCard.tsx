import { ShoppingCart, Star, Package } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../types';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, setSelectedProductId, setPage } = useApp();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || '');
  const [quantity, setQuantity] = useState(1);

  const currentPrice = (() => {
    if (selectedSize && product.sizes) {
      const sizeData = product.sizes.find(s => s.size === selectedSize);
      if (sizeData) return sizeData.price;
    }
    return product.price;
  })();
  // BUILD 65 audit fix: the card used to let quantity grow past stock
  // (detail page already capped it) and let out-of-stock items be added.
  const currentStock = (() => {
    if (selectedSize && product.sizes) {
      const sizeData = product.sizes.find(s => s.size === selectedSize);
      if (sizeData) return sizeData.stock;
    }
    return product.stock;
  })();
  const inStock = currentStock === undefined || currentStock > 0;
  const maxQty = currentStock === undefined ? 999 : Math.max(1, currentStock);

  const handleViewDetail = () => {
    setSelectedProductId(product.id);
    setPage('product-detail');
  };

  return (
    <div className="rounded-2xl bg-charcoal border border-gunmetal overflow-hidden hover:border-champagne/60 transition-all duration-300 hover:shadow-[0_18px_44px_-20px_rgba(0,0,0,0.7)] flex flex-col group h-full">
      {/* Image */}
      <div className="relative overflow-hidden cursor-pointer" onClick={handleViewDetail}>
        <img src={product.image} alt={product.name} className="w-full h-32 sm:h-48 object-cover group-hover:scale-105 transition duration-500" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {product.featured ? (
            <div className="bg-champagne text-obsidian px-2 py-0.5 rounded-full text-[10px] font-black flex items-center space-x-1 shrink-0">
              <Star className="w-3 h-3" /><span>FEATURED</span>
            </div>
          ) : <span />}
          <div className="rounded-lg px-2 py-1 text-[10px] text-ivory font-bold border border-gunmetal bg-obsidian/85 backdrop-blur-md truncate min-w-0">
            {product.grade}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="text-[10px] text-champagne font-semibold uppercase tracking-wider mb-1">{product.category}</div>
        <h3 className="text-sm font-bold text-ivory leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-champagne transition" onClick={handleViewDetail}>{product.name}</h3>
        <p className="text-xs text-silver leading-relaxed mb-4 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center space-x-1.5 mb-3">
          <Package className="w-3 h-3 text-silver" /><span className="text-[10px] text-silver font-semibold">{product.brand}</span>
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3">
            <label className="text-[10px] font-bold text-silver block mb-1">Select Size</label>
            <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)}
              className="w-full bg-obsidian border border-gunmetal text-ivory px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-champagne transition">
              {product.sizes.map(s => <option key={s.size} value={s.size}>{s.size} - Rs.{s.price}</option>)}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-auto pt-3 border-t border-gunmetal">
          <div>
            <div className="text-lg font-black text-ivory">Rs.{currentPrice}</div>
            <div className="text-[10px] text-silver">{product.type === 'cement' ? 'per bag' : product.type === 'steel' ? 'per kg' : 'per unit'}</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center rounded-lg border border-gunmetal bg-obsidian">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 py-1.5 text-silver hover:text-ivory text-xs font-bold" aria-label={`Decrease quantity of ${product.name}`}>-</button>
              <span className="text-xs font-bold text-ivory px-1 min-w-[20px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} className="px-2 py-1.5 text-silver hover:text-ivory text-xs font-bold" aria-label={`Increase quantity of ${product.name}`}>+</button>
            </div>
            <button onClick={() => { if (inStock) addToCart(product, Math.min(maxQty, quantity), selectedSize); }} disabled={!inStock} className="btn-purchase p-2.5 rounded-xl shadow-lg disabled:opacity-50" aria-label={inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}>
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
