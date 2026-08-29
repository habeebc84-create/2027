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

  const handleViewDetail = () => {
    setSelectedProductId(product.id);
    setPage('product-detail');
  };

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] flex flex-col group">
      {/* Image */}
      <div className="relative overflow-hidden cursor-pointer" onClick={handleViewDetail}>
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
        {product.featured && (
          <div className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center space-x-1">
            <Star className="w-3 h-3" /><span>FEATURED</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-lg text-[10px] text-slate-300 font-bold">{product.grade}</div>
      </div>
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">{product.category}</div>
        <h3 className="text-sm font-bold text-slate-100 leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-blue-400 transition" onClick={handleViewDetail}>{product.name}</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center space-x-1.5 mb-3">
          <Package className="w-3 h-3 text-slate-500" /><span className="text-[10px] text-slate-400 font-semibold">{product.brand}</span>
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3">
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Select Size</label>
            <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition">
              {product.sizes.map(s => <option key={s.size} value={s.size}>{s.size} - Rs.{s.price}</option>)}
            </select>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/50">
          <div>
            <div className="text-lg font-black text-white">Rs.{currentPrice}</div>
            <div className="text-[10px] text-slate-500">{product.type === 'cement' ? 'per bag' : product.type === 'steel' ? 'per kg' : 'per unit'}</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 py-1.5 text-slate-400 hover:text-white text-xs font-bold">-</button>
              <span className="text-xs font-bold text-slate-200 px-1 min-w-[20px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-2 py-1.5 text-slate-400 hover:text-white text-xs font-bold">+</button>
            </div>
            <button onClick={() => addToCart(product, quantity, selectedSize)} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white p-2.5 rounded-xl transition shadow-lg">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
