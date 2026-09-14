import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bustedImageSrc } from '../lib/images';

export default function Checkout({ onBackToCart, onOrderSuccess }: { onBackToCart: () => void; onOrderSuccess: (orderId: string) => void }) {
  const { cart, cartTotal, cartCount, placeOrder, showToast, transportZones, siteContent, setPage } = useApp();
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
  const [customerLocation, setCustomerLocation] = useState('');
  const [locating, setLocating] = useState(false);

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
        <h2 className="text-xl font-bold text-slate-200">Your Cart is Empty</h2>
        <button onClick={onBackToCart} className="bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-blue-950/30 relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <button onClick={onBackToCart} className="inline-flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /><span>Back to Products</span>
          </button>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 font-industrial tracking-tight">
          Secure <span className="text-white">Checkout</span>
        </h1>

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
            <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-[2rem] space-y-6 shadow-2xl">
              <h2 className="text-lg font-black text-slate-100 flex items-center space-x-2 border-b border-white/10 pb-4">
                <MapPin className="w-5 h-5 text-white" /><span>Delivery Details</span>
              </h2>
              <form onSubmit={e => {
                e.preventDefault();
                if (!name || !mobile || !address || !landmark) { showToast('Please fill required fields.', 'error'); return; }
                if (mobile.length < 10) { showToast('Enter valid 10-digit mobile.', 'error'); return; }
                setIsProcessing(true);
                setTimeout(() => {
                  const year = new Date().getFullYear();
                  const count = (parseInt(localStorage.getItem('hsn_order_count') || '0')) + 1;
                  const oid = `HSN-${year}-${String(count).padStart(5, '0')}`;
                  placeOrder({
                    items: cart, total: totalPayable,
                    customer: { name, mobile, email, address, village, mandal, pincode, landmark },
                    paymentMode, deliveryNote, deliveryLocation: selectedZone.name,
                    deliveryCharge, handlingCharge, deliveryMethod,
                    customerLocation: customerLocation || undefined,
                  });
                  onOrderSuccess(oid);
                }, 1500);
              }} className="space-y-5 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">Full Name *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Contractor / Builder name" className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">Mobile Number *</label>
                    <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="10-digit number" className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Optional" className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">Village / Town</label>
                    <input type="text" value={village} onChange={e => setVillage(e.target.value)} placeholder="e.g., Kalikiri" className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">Mandal</label>
                    <input type="text" value={mandal} onChange={e => setMandal(e.target.value)} placeholder="e.g., Kalikiri" className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">Pincode</label>
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="517234" className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition placeholder-slate-600" />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">Delivery Address *</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} required rows={2} placeholder="Full site address" className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition placeholder-slate-600 resize-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">Landmark *</label>
                  <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} required placeholder="Near Water Tank / Panchayat Office" className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition placeholder-slate-600" />
                </div>

                {/* Share exact location via maps */}
                <div className="bg-blue-500/5 border border-blue-500/25 rounded-2xl p-4 space-y-3">
                  <label className="font-bold text-slate-200 block text-xs">📍 Share Delivery Location (recommended)</label>
                  <p className="text-[10px] text-slate-400">Sharing your exact spot on the map helps us calculate the true transport distance and gives you the fairest final delivery price.</p>
                  {customerLocation ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-xl text-[11px] font-bold">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 line-clamp-1">Location attached ✓</span>
                        <button type="button" onClick={() => setCustomerLocation('')} className="text-emerald-400 hover:text-emerald-300 text-[10px] underline shrink-0">Remove</button>
                      </div>
                      <a href={customerLocation} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-[10px] text-blue-400 hover:text-blue-300 underline">
                        <MapPin className="w-3 h-3" /><span>Preview on Google Maps</span>
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button type="button" onClick={() => {
                        if (!navigator.geolocation) { showToast('GPS not supported on this device', 'error'); return; }
                        setLocating(true);
                        navigator.geolocation.getCurrentPosition(
                          pos => { setCustomerLocation(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`); setLocating(false); showToast('Current location attached'); },
                          () => { setLocating(false); showToast('Could not get GPS location — allow location permission or paste a link', 'error'); },
                          { enableHighAccuracy: true, timeout: 12000 },
                        );
                      }} disabled={locating} className="p-2.5 rounded-xl border text-[11px] font-bold transition bg-blue-500/20 text-white border-blue-400/50 hover:bg-blue-500/30 disabled:opacity-50">
                        {locating ? 'Locating…' : '📡 Use My GPS'}
                      </button>
                      <button type="button" onClick={() => {
                        const input = window.prompt('Open Google Maps, long-press your delivery spot, then paste the shared link here:');
                        if (input && input.trim()) {
                          if (/maps\.|goo\.gl|plus\.codes|@-?\d/i.test(input.trim())) { setCustomerLocation(input.trim()); showToast('Location attached'); }
                          else showToast('That does not look like a Maps link', 'error');
                        }
                      }} className="p-2.5 rounded-xl border text-[11px] font-bold transition bg-slate-950/50 text-slate-300 border-slate-700/50 hover:bg-slate-900">
                        🔗 Paste Map Link
                      </button>
                      <button type="button" onClick={() => {
                        window.open(`https://www.google.com/maps/search/${encodeURIComponent('near me')}`, '_blank');
                        const input = window.prompt('In the map that opened, tap your delivery spot, press Share, copy the link, and paste it here:');
                        if (input && input.trim()) {
                          if (/maps\.|goo\.gl|plus\.codes|@-?\d/i.test(input.trim())) { setCustomerLocation(input.trim()); showToast('Location attached'); }
                          else showToast('That does not look like a Maps link', 'error');
                        }
                      }} className="p-2.5 rounded-xl border text-[11px] font-bold transition bg-slate-950/50 text-slate-300 border-slate-700/50 hover:bg-slate-900">
                        🗺️ Pick on Map
                      </button>
                    </div>
                  )}
                </div>

                {/* Delivery Method */}
                <div className="pt-2">
                  <label className="font-bold text-slate-200 block mb-2">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setDeliveryMethod('delivery')} className={`p-3 rounded-xl border text-xs font-bold transition ${deliveryMethod === 'delivery' ? 'bg-blue-500/20 text-white border-blue-400/50' : 'bg-slate-950/50 text-slate-400 border-slate-700/50'}`}>
                      <Truck className="w-4 h-4 inline mr-1.5" />Site Delivery
                    </button>
                    <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`p-3 rounded-xl border text-xs font-bold transition ${deliveryMethod === 'pickup' ? 'bg-blue-500/20 text-white border-blue-400/50' : 'bg-slate-950/50 text-slate-400 border-slate-700/50'}`}>
                      <MapPin className="w-4 h-4 inline mr-1.5" />Store Pickup
                    </button>
                  </div>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div>
                    <label className="font-bold text-slate-300 block mb-1.5">Transport Zone</label>
                    <select value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition">
                      {transportZones.filter(z => z.charge > 0).map(z => (
                        <option key={z.id} value={z.name} className="bg-slate-950">{z.name} - Rs.{z.charge} ({z.estimatedTime})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-300 block mb-1.5">Additional Notes (Optional)</label>
                  <input type="text" value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} placeholder="e.g., Unload near column foundation" className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 p-3 rounded-2xl focus:outline-none focus:border-blue-400 transition placeholder-slate-600" />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <label className="font-bold text-slate-200 block mb-3 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-white" /><span>Payment Mode</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPaymentMode('Cash on Delivery')} className={`p-3 rounded-xl border text-xs font-bold transition ${paymentMode === 'Cash on Delivery' ? 'bg-blue-500/20 text-white border-blue-400/50' : 'bg-slate-950/50 text-slate-400 border-slate-700/50'}`}>Cash on Delivery</button>
                    <button type="button" onClick={() => setPaymentMode('Online Payment (UPI)')} className={`p-3 rounded-xl border text-xs font-bold transition ${paymentMode === 'Online Payment (UPI)' ? 'bg-blue-500/20 text-white border-blue-400/50' : 'bg-slate-950/50 text-slate-400 border-slate-700/50'}`}>Online UPI</button>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-fuchsia-600 hover:from-blue-400 hover:via-indigo-500 hover:to-fuchsia-500 py-4 rounded-2xl font-black text-sm shadow-2xl mt-4 text-white transition">
                  CONFIRM & PLACE ORDER
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-2xl sticky top-28">
                <h3 className="text-lg font-black text-slate-100 border-b border-white/10 pb-4 flex justify-between items-center mb-4">
                  <span>Order Summary</span>
                  <span className="bg-blue-500/20 text-white px-3 py-1 rounded-full text-xs">{cartCount} Items</span>
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4">
                  {cart.map((item, idx) => {
                    let price = item.product.price;
                    if (item.selectedSize && item.product.sizes) {
                      const s = item.product.sizes.find(sz => sz.size === item.selectedSize);
                      if (s) price = s.price;
                    }
                    return (
                      <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                        <div className="flex-1 pr-3">
                          <div className="font-bold text-slate-200 text-xs line-clamp-1">{item.product.name}</div>
                          <div className="text-[10px] text-slate-400">Qty: {item.quantity} {item.selectedSize ? `(${item.selectedSize})` : ''}</div>
                        </div>
                        <div className="font-black text-white text-xs whitespace-nowrap">Rs.{(price * item.quantity).toLocaleString('en-IN')}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300"><span>Subtotal</span><span className="font-bold">Rs.{cartTotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-slate-300"><span>Delivery</span><span className={deliveryCharge === 0 ? 'text-emerald-400 font-bold' : 'text-slate-100'}>{deliveryCharge === 0 ? 'FREE' : `Rs.${deliveryCharge}`}</span></div>
                  {handlingCharge > 0 && <div className="flex justify-between text-slate-300"><span>Handling</span><span>Rs.{handlingCharge}</span></div>}
                  <div className="flex justify-between items-end pt-3 border-t border-white/10">
                    <span className="font-bold text-slate-300">Total</span>
                    <span className="text-xl font-black text-white">Rs.{totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 p-12 rounded-3xl shadow-2xl flex flex-col items-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <img src={bustedImageSrc('/windows-h-logo.png')} alt="Logo" className="w-14 h-14 object-contain" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 animate-pulse">Processing Order...</h3>
          </div>
        </div>
      )}
    </div>
  );
}
