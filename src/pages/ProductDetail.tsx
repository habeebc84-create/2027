import { useState, useMemo } from 'react';
import { ArrowLeft, ShoppingCart, Phone, Minus, Plus, Shield, Truck, Star, ChevronRight, MapPin, Clock, Check, Package, ZoomIn, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function ProductDetail() {
  const { products, selectedProductId, setSelectedProductId, setPage, addToCart, siteContent, transportZones, cartCount } = useApp();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  const product = products.find(p => p.id === selectedProductId);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.id !== product.id && p.enabled && (p.category === product.category || p.brand === product.brand)).slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-200">Product not found</h2>
          <button onClick={() => setPage('products')} className="bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs">Back to Products</button>
        </div>
      </div>
    );
  }

  const sizeData = selectedSize && product.sizes ? product.sizes.find(s => s.size === selectedSize) : null;
  const currentPrice = sizeData ? sizeData.price : product.price;
  const currentStock = sizeData ? sizeData.stock : product.stock;
  const unit = product.type === 'cement' ? 'bag' : product.type === 'steel' ? 'kg' : product.type === 'wire' ? 'kg' : 'unit';
  const inStock = currentStock > 0;

  const handleAddToCart = () => { addToCart(product, quantity, selectedSize || undefined); };
  const handleBuyNow = () => { addToCart(product, quantity, selectedSize || undefined); setPage('checkout'); };
  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hello HSN Cement & Steel,\n\nI am interested in:\nProduct: ${product.name}\nVariant: ${selectedSize || 'Standard'}\nQuantity: ${quantity}\nPrice: Rs.${currentPrice}/${unit}\n\nPlease provide availability and delivery details.`);
    window.open(`https://wa.me/${siteContent.whatsapp.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050816] relative">
      {/* Top mini-bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#050816]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          <button onClick={() => setPage('products')} className="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /><span>Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 hidden sm:block">HSN Cement & Steel</span>
          </div>
          <button onClick={() => setPage('checkout')} className="relative p-2 text-slate-300 hover:text-white">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
          </button>
        </div>
      </div>

      <div className="pt-14 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-[11px] text-slate-500 py-4">
          <button onClick={() => setPage('home')} className="hover:text-white transition">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => setPage('products')} className="hover:text-white transition">Products</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-300">{product.category}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white truncate max-w-[150px]">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group cursor-pointer" onClick={() => setZoomed(true)}>
              <img src={product.image} alt={product.name} className="w-full h-72 sm:h-[420px] object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-4">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5"><ZoomIn className="w-3.5 h-3.5" /><span>Zoom</span></span>
              </div>
            </div>
            {/* Trust badges below image */}
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[10px] font-bold text-emerald-400">100% Genuine</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                <Truck className="w-3.5 h-3.5 text-blue-400" /><span className="text-[10px] font-bold text-blue-400">Kalikiri Site Delivery</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info + Price + Actions */}
          <div className="space-y-5">
            {/* Category + Brand */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2.5 py-1 rounded-full">{product.brand}</span>
              {product.featured && <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center space-x-1"><Star className="w-3 h-3" /><span>Featured</span></span>}
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-black text-white font-industrial leading-tight">{product.name}</h1>

            {/* Description */}
            <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>

            {/* Price Card */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wholesale Price Rate</div>
                <div className="flex items-center space-x-1.5 text-[10px] text-blue-400 font-bold"><Clock className="w-3 h-3" /><span>Rate Updated Today</span></div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white">Rs.{currentPrice}</span>
                  <span className="text-sm text-slate-400 ml-1">/ {unit}</span>
                </div>
                <div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${inStock ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30'}`}>
                  {inStock ? <><Check className="w-3 h-3 inline mr-1" />In Stock ({currentStock} available)</> : 'OUT OF STOCK'}
                </div>
              </div>
            </div>

            {/* Variants */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="text-xs font-bold text-white block mb-2.5">Select Size / Variant</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {product.sizes.map(s => {
                    const isActive = selectedSize === s.size;
                    const outOfStock = s.stock <= 0;
                    return (
                      <button key={s.size} onClick={() => { if (!outOfStock) { setSelectedSize(s.size); setQuantity(1); } }} disabled={outOfStock}
                        className={`relative p-3 rounded-xl border text-center transition ${isActive ? 'bg-blue-500/20 text-white border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : outOfStock ? 'bg-white/[0.02] text-slate-600 border-white/5 cursor-not-allowed' : 'bg-white/5 text-slate-300 border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5'}`}>
                        <div className="text-xs font-bold">{s.size}</div>
                        <div className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>Rs.{s.price}</div>
                        {outOfStock && <div className="text-[8px] text-rose-400 mt-0.5">Out of Stock</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-xs font-bold text-white block mb-2">Quantity</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2.5 text-slate-400 hover:text-white transition"><Minus className="w-4 h-4" /></button>
                  <span className="text-sm font-black text-white px-5 min-w-[40px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} className="px-4 py-2.5 text-slate-400 hover:text-white transition"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-xs text-slate-500">Total: <span className="text-white font-bold">Rs.{(currentPrice * quantity).toLocaleString('en-IN')}</span></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button onClick={handleAddToCart} disabled={!inStock}
                className={`w-full flex items-center justify-center space-x-2.5 py-4 rounded-2xl font-black text-sm transition shadow-lg ${inStock ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart (Rs.{(currentPrice * quantity).toLocaleString('en-IN')})</span>
              </button>
              <button onClick={handleBuyNow} disabled={!inStock}
                className={`w-full flex items-center justify-center space-x-2.5 py-4 rounded-2xl font-black text-sm transition ${inStock ? 'bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                <span>Buy Now</span>
              </button>
            </div>

            {/* WhatsApp + Call */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleWhatsApp} className="flex items-center justify-center space-x-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-bold py-3 rounded-2xl text-xs hover:bg-[#25D366]/20 transition">
                <WhatsAppIcon className="w-4 h-4" /><span>Inquire on WhatsApp</span>
              </button>
              <a href={`tel:${siteContent.phone}`} className="flex items-center justify-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold py-3 rounded-2xl text-xs hover:bg-blue-500/20 transition">
                <Phone className="w-4 h-4" /><span>Call for Bulk Quote</span>
              </a>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {(product.specifications || product.grade) && (
          <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-black text-white font-industrial mb-4 flex items-center space-x-2"><Package className="w-4 h-4 text-blue-400" /><span>Product Specifications</span></h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex justify-between text-xs bg-white/[0.03] px-3 py-2 rounded-lg"><span className="text-slate-500">Brand</span><span className="text-slate-200 font-bold">{product.brand}</span></div>
              <div className="flex justify-between text-xs bg-white/[0.03] px-3 py-2 rounded-lg"><span className="text-slate-500">Category</span><span className="text-slate-200 font-bold">{product.category}</span></div>
              <div className="flex justify-between text-xs bg-white/[0.03] px-3 py-2 rounded-lg"><span className="text-slate-500">Grade</span><span className="text-slate-200 font-bold">{product.grade}</span></div>
              {product.specifications && Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs bg-white/[0.03] px-3 py-2 rounded-lg"><span className="text-slate-500">{k}</span><span className="text-slate-200 font-bold">{v}</span></div>
              ))}
              <div className="flex justify-between text-xs bg-white/[0.03] px-3 py-2 rounded-lg"><span className="text-slate-500">Unit</span><span className="text-slate-200 font-bold">{unit}</span></div>
              <div className="flex justify-between text-xs bg-white/[0.03] px-3 py-2 rounded-lg"><span className="text-slate-500">Type</span><span className="text-slate-200 font-bold capitalize">{product.type}</span></div>
            </div>
          </div>
        )}

        {/* Delivery Information */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-black text-white font-industrial mb-4 flex items-center space-x-2"><Truck className="w-4 h-4 text-blue-400" /><span>Delivery Information</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex items-start space-x-3 bg-white/[0.03] px-4 py-3 rounded-xl">
              <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div><div className="text-xs font-bold text-white">Kalikiri Site Delivery</div><div className="text-[10px] text-slate-400 mt-0.5">Same-day or next morning</div></div>
            </div>
            <div className="flex items-start space-x-3 bg-white/[0.03] px-4 py-3 rounded-xl">
              <Truck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div><div className="text-xs font-bold text-white">Nearby Mandals</div><div className="text-[10px] text-slate-400 mt-0.5">1-2 business days</div></div>
            </div>
            <div className="flex items-start space-x-3 bg-white/[0.03] px-4 py-3 rounded-xl">
              <Clock className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div><div className="text-xs font-bold text-white">Express Delivery</div><div className="text-[10px] text-slate-400 mt-0.5">Orders before 2 PM dispatched same day</div></div>
            </div>
          </div>
          {transportZones.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Zones</div>
              <div className="flex flex-wrap gap-2">
                {transportZones.filter(z => z.enabled).map(z => (
                  <span key={z.id} className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-slate-300">{z.name} — {z.charge === 0 ? 'FREE' : `Rs.${z.charge}`}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-black text-white font-industrial mb-5">Related Products</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map(rp => (
                <button key={rp.id} onClick={() => { setSelectedProductId(rp.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition group text-left">
                  <img src={rp.image} alt={rp.name} className="w-full h-32 object-cover group-hover:scale-105 transition duration-500" />
                  <div className="p-3">
                    <div className="text-[10px] text-slate-500 font-bold">{rp.brand}</div>
                    <div className="text-xs font-bold text-slate-200 line-clamp-2 mt-0.5">{rp.name}</div>
                    <div className="text-sm font-black text-white mt-1.5">Rs.{rp.price} <span className="text-[10px] text-slate-500 font-normal">/ {rp.type === 'cement' ? 'bag' : rp.type === 'steel' ? 'kg' : 'unit'}</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomed && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
          <button onClick={() => setZoomed(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
          <img src={product.image} alt={product.name} className="max-w-full max-h-[90vh] object-contain rounded-2xl" />
        </div>
      )}

      {/* Floating mini-cart for mobile */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#050816]/95 backdrop-blur-xl border-t border-white/10 p-3 z-40">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="text-sm font-black text-white">Rs.{currentPrice}<span className="text-[10px] text-slate-500 font-normal"> / {unit}</span></div>
            <div className={`text-[10px] font-bold ${inStock ? 'text-emerald-400' : 'text-rose-400'}`}>{inStock ? `${currentStock} in stock` : 'Out of stock'}</div>
          </div>
          <button onClick={handleAddToCart} disabled={!inStock}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition ${inStock ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
            <ShoppingCart className="w-4 h-4" /><span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
