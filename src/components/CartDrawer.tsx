import { X, Minus, Plus, ShoppingCart, Truck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onProceedToCheckout }: CartDrawerProps) {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, setPage } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm transition-opacity" />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-charcoal/95 backdrop-blur-3xl border-l border-gunmetal text-ivory flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="p-6 border-b border-gunmetal flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-ivory" />
              <h2 className="text-lg font-bold text-ivory">Your Construction Cart</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-silver hover:text-ivory hover:bg-charcoal">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-silver space-y-3">
                <ShoppingCart className="w-12 h-12 text-silver" />
                <p className="text-sm font-medium">Your cart is empty.</p>
                <p className="text-xs text-silver max-w-xs">Explore our catalog for cement, steel rebar, cutting blades, and hardware tools.</p>
                <button onClick={() => { onClose(); setPage('home'); }} className="btn-purchase px-5 py-2.5 rounded-xl text-xs">Return to Shop</button>
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
                  <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="bg-obsidian p-3.5 rounded-xl border border-gunmetal flex items-center space-x-3 backdrop-blur-sm shadow-md animate-[slideIn_0.3s_ease-out]">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gunmetal" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-ivory truncate">{item.product.name}</h4>
                      {item.selectedSize && (
                        <span className="text-[10px] bg-champagne/15 text-champagne px-2 py-0.5 rounded border border-brand-500/30 font-bold inline-block mt-0.5">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-1 bg-charcoal rounded border border-gunmetal">
                          <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedSize)} className="px-2 py-0.5 text-silver hover:text-ivory font-bold text-xs">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-ivory px-1">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedSize)} className="px-2 py-0.5 text-silver hover:text-ivory font-bold text-xs">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-ivory">₹{lineTotal.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-silver">(₹{price}/unit)</div>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id, item.selectedSize)} className="text-silver hover:text-brand-400 p-1 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-obsidian border-t border-gunmetal space-y-4">
              <div className="space-y-1.5 text-xs text-silver">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-ivory">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Site Delivery Charge</span>
                  <span className="text-success-foreground font-bold">FREE (Kalikiri Zone)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gunmetal text-sm font-bold text-ivory">
                  <span>Total Estimated Amount</span>
                  <span className="text-ivory">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-silver bg-charcoal p-2.5 rounded-lg border border-gunmetal">
                <Truck className="w-4 h-4 text-ivory shrink-0" />
                <span>Heavy fleet lorry unloading directly at your building site.</span>
              </div>
              <button onClick={onProceedToCheckout} className="btn-purchase w-full py-3.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg">
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
