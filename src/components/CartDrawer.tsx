import { X, Minus, Plus, ShoppingCart, Truck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onProceedToCheckout }: CartDrawerProps) {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, siteContent } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950/50 backdrop-blur-3xl border-l border-white/10 text-slate-100 flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-slate-100">Your Construction Cart</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <ShoppingCart className="w-12 h-12 text-slate-400" />
                <p className="text-sm font-medium">Your cart is empty.</p>
                <p className="text-xs text-slate-500 max-w-xs">Explore our catalog for cement, steel rebar, cutting blades, and hardware tools.</p>
              </div>
            ) : (
              cart.map((item, idx) => {
                let price = item.product.price;
                if (item.selectedSize && item.product.sizes) {
                  const sizeData = item.product.sizes.find(s => s.size === item.selectedSize);
                  if (sizeData) price = sizeData.price;
                }
                const lineTotal = price * item.quantity;

                return (
                  <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="bg-white/5 p-3.5 rounded-xl border border-white/10 flex items-center space-x-3 backdrop-blur-sm shadow-md animate-[slideIn_0.3s_ease-out]">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-800" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-100 truncate">{item.product.name}</h4>
                      {item.selectedSize && (
                        <span className="text-[10px] bg-blue-500/10 text-white px-2 py-0.5 rounded border border-blue-500/30 font-bold inline-block mt-0.5">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-1 bg-slate-900 rounded border border-slate-800">
                          <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedSize)} className="px-2 py-0.5 text-slate-400 hover:text-white font-bold text-xs">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-200 px-1">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedSize)} className="px-2 py-0.5 text-slate-400 hover:text-white font-bold text-xs">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-white">₹{lineTotal.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-slate-500">(₹{price}/unit)</div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id, item.selectedSize)} className="text-slate-500 hover:text-rose-400 p-1 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-200">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Site Delivery Charge</span>
                  <span className="text-pink-400 font-bold">FREE (Kalikiri Zone)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-slate-100">
                  <span>Total Estimated Amount</span>
                  <span className="text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <Truck className="w-4 h-4 text-white shrink-0" />
                <span>Heavy fleet lorry unloading directly at your building site.</span>
              </div>
              <button onClick={onProceedToCheckout} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 py-3.5 rounded-xl text-xs font-black flex items-center justify-center space-x-2 shadow-lg text-white transition">
                <span>Proceed to Order Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
