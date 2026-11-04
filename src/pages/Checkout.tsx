import { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bustedImageSrc } from '../lib/images';

export default function Checkout({ onBackToCart, onOrderSuccess }: { onBackToCart: () => void; onOrderSuccess: (orderId: string) => void }) {
  const { cart, cartTotal, cartCount, placeOrder, showToast, transportZones, setPage } = useApp();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [village, setVillage] = useState('');
  const [mandal, setMandal] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash on Delivery');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryLocation, setDeliveryLocation] = useState(transportZones[0]?.name || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedZone = transportZones.find(z => z.name === deliveryLocation) || transportZones[0] || { name: '', charge: 0 };
  const deliveryCharge = deliveryMethod === 'pickup' ? 0 : selectedZone.charge;

  const handlingCharge = cart.reduce((acc, item) => {
    if (item.product.type === 'cement') return acc + item.quantity * 5;
    if (item.product.type === 'steel' || item.product.type === 'wire') return acc + item.quantity * 20;
    return acc;
  }, 0);

  const totalPayable = cartTotal + deliveryCharge + handlingCharge;

  if (cart.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-ivory">Your Cart is Empty</h2>
        <button onClick={() => setPage('home')} className="btn-purchase px-5 py-2.5 rounded-xl text-xs">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 min-h-screen bg-gradient-to-br from-obsidian via-brand-950/40 to-brand-950/30 relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <button onClick={onBackToCart} className="inline-flex items-center space-x-2 text-xs font-bold text-silver hover:text-ivory transition">
            <ArrowLeft className="w-4 h-4" /><span>Back to Products</span>
          </button>

        <h1 className="text-3xl sm:text-4xl font-black text-ivory font-industrial tracking-tight">
          Secure <span className="text-ivory">Checkout</span>
        </h1>

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-7 bg-charcoal/40 backdrop-blur-2xl border border-gunmetal p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-2xl">
              <h2 className="text-lg font-black text-ivory flex items-center space-x-2 border-b border-gunmetal pb-4">
                <MapPin className="w-5 h-5 text-ivory" /><span>Delivery Details</span>
              </h2>
              <form onSubmit={e => {
                e.preventDefault();
                if (!name || !mobile || !address || !landmark) { showToast('Please fill required fields.', 'error'); return; }
                // BUILD 65 audit fix: the old check (length < 10) accepted
                // letters and 11+ digit numbers. Indian mobiles are exactly
                // 10 digits starting 6-9; store the cleaned digits.
                const mobileDigits = mobile.replace(/\D/g, '').slice(-10);
                if (!/^[6-9]\d{9}$/.test(mobileDigits)) { showToast('Enter a valid 10-digit Indian mobile number.', 'error'); return; }
                if (pincode && !/^\d{6}$/.test(pincode.replace(/\D/g, ''))) { showToast('Pincode must be 6 digits.', 'error'); return; }
                setIsProcessing(true);
                setTimeout(() => {
                  // BUILD 65: use the id placeOrder actually created — the
                  // old code computed its own id from the counter, which
                  // could drift from the stored order.
                  const oid = placeOrder({
                    items: cart, total: totalPayable,
                    customer: { name, mobile: mobileDigits, email, address, village, mandal, pincode, landmark },
                    paymentMode, deliveryNote, deliveryLocation: selectedZone.name,
                    deliveryCharge, handlingCharge, deliveryMethod,
                  });
                  onOrderSuccess(oid);
                }, 1500);
              }} className="space-y-5 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-silver block mb-1.5">Full Name *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Contractor / Builder name" className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-silver block mb-1.5">Mobile Number *</label>
                    <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="10-digit number" className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-silver block mb-1.5">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Optional" className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-silver block mb-1.5">Village / Town</label>
                    <input type="text" value={village} onChange={e => setVillage(e.target.value)} placeholder="e.g., Kalikiri" className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-silver block mb-1.5">Mandal</label>
                    <input type="text" value={mandal} onChange={e => setMandal(e.target.value)} placeholder="e.g., Kalikiri" className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-silver block mb-1.5">Pincode</label>
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="517234" className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-silver block mb-1.5">Delivery Address *</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} required rows={2} placeholder="Full site address" className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600 resize-none" />
                </div>
                <div>
                  <label className="font-bold text-silver block mb-1.5">Landmark *</label>
                  <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} required placeholder="Near Water Tank / Panchayat Office" className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" />
                </div>

                {/* Delivery Method */}
                <div className="pt-2">
                  <label className="font-bold text-ivory block mb-2">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setDeliveryMethod('delivery')} className={`p-3 rounded-xl border text-xs font-bold transition ${deliveryMethod === 'delivery' ? 'bg-brand-500/20 text-ivory border-brand-400/50' : 'bg-obsidian/50 text-silver border-gunmetal/50'}`}>
                      <Truck className="w-4 h-4 inline mr-1.5" />Site Delivery
                    </button>
                    <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`p-3 rounded-xl border text-xs font-bold transition ${deliveryMethod === 'pickup' ? 'bg-brand-500/20 text-ivory border-brand-400/50' : 'bg-obsidian/50 text-silver border-gunmetal/50'}`}>
                      <MapPin className="w-4 h-4 inline mr-1.5" />Store Pickup
                    </button>
                  </div>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div>
                    <label className="font-bold text-silver block mb-1.5">Transport Zone</label>
                    <select value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition">
                      {transportZones.filter(z => z.charge > 0).map(z => (
                        <option key={z.id} value={z.name} className="bg-obsidian">{z.name} - Rs.{z.charge} ({z.estimatedTime})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="font-bold text-silver block mb-1.5">Additional Notes (Optional)</label>
                  <input type="text" value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} placeholder="e.g., Unload near column foundation" className="w-full bg-obsidian/50 border border-gunmetal/50 text-ivory p-3 rounded-2xl focus:outline-none focus:border-brand-400 transition placeholder-slate-600" />
                </div>

                <div className="pt-4 border-t border-gunmetal">
                  <label className="font-bold text-ivory block mb-3 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-ivory" /><span>Payment Mode</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPaymentMode('Cash on Delivery')} className={`p-3 rounded-xl border text-xs font-bold transition ${paymentMode === 'Cash on Delivery' ? 'bg-brand-500/20 text-ivory border-brand-400/50' : 'bg-obsidian/50 text-silver border-gunmetal/50'}`}>Cash on Delivery</button>
                    <button type="button" onClick={() => setPaymentMode('UPI on Delivery')} className={`p-3 rounded-xl border text-xs font-bold transition ${paymentMode === 'UPI on Delivery' ? 'bg-brand-500/20 text-ivory border-brand-400/50' : 'bg-obsidian/50 text-silver border-gunmetal/50'}`}>UPI on Delivery</button>
                  </div>
                </div>

                <button type="submit" className="btn-purchase w-full py-4 rounded-2xl text-sm shadow-2xl mt-4">
                  CONFIRM & PLACE ORDER
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-charcoal/40 backdrop-blur-2xl border border-gunmetal p-6 sm:p-8 rounded-[2rem] shadow-2xl sticky top-28">
                <h3 className="text-lg font-black text-ivory border-b border-gunmetal pb-4 flex justify-between items-center mb-4">
                  <span>Order Summary</span>
                  <span className="bg-brand-500/20 text-ivory px-3 py-1 rounded-full text-xs">{cartCount} Items</span>
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4">
                  {cart.map((item, idx) => {
                    let price = item.product.price;
                    if (item.selectedSize && item.product.sizes) {
                      const s = item.product.sizes.find(sz => sz.size === item.selectedSize);
                      if (s) price = s.price;
                    }
                    return (
                      <div key={idx} className="flex justify-between items-center bg-obsidian/40 p-3 rounded-xl border border-gunmetal">
                        <div className="flex-1 pr-3">
                          <div className="font-bold text-ivory text-xs line-clamp-1">{item.product.name}</div>
                          <div className="text-[10px] text-silver">Qty: {item.quantity} {item.selectedSize ? `(${item.selectedSize})` : ''}</div>
                        </div>
                        <div className="font-black text-ivory text-xs whitespace-nowrap">Rs.{(price * item.quantity).toLocaleString('en-IN')}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gunmetal pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-silver"><span>Subtotal</span><span className="font-bold">Rs.{cartTotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-silver"><span>Delivery</span><span className={deliveryCharge === 0 ? 'text-success-foreground font-bold' : 'text-ivory'}>{deliveryCharge === 0 ? 'FREE' : `Rs.${deliveryCharge}`}</span></div>
                  {handlingCharge > 0 && <div className="flex justify-between text-silver"><span>Handling</span><span>Rs.{handlingCharge}</span></div>}
                  <div className="flex justify-between items-end pt-3 border-t border-gunmetal">
                    <span className="font-bold text-silver">Total</span>
                    <span className="text-xl font-black text-ivory">Rs.{totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-md">
          <div className="bg-charcoal border border-gunmetal p-12 rounded-3xl shadow-2xl flex flex-col items-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-charcoal border-2 border-gunmetal flex items-center justify-center shadow-[0_0_30px_rgba(198,168,117,0.3)]">
              <img src={bustedImageSrc('/windows-h-logo.png')} alt="Logo" className="w-14 h-14 object-contain" />
            </div>
            <h3 className="text-lg font-bold text-ivory animate-pulse">Processing Order...</h3>
          </div>
        </div>
      )}
    </div>
  );
}
