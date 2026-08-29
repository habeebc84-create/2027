import { useState } from 'react';
import { MapPin, Phone as PhoneIcon, Clock, Send, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Contact() {
  const { siteContent, showToast } = useApp();
  const [form, setForm] = useState({ name: '', mobile: '', materialNeeded: 'Cement & Steel', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile) {
      showToast('Please enter your name and mobile number', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Inquiry sent successfully!');
  };

  return (
    <div className="py-12 bg-transparent min-h-screen space-y-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 font-industrial">
            Contact <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">HSN CEMENT AND STEEL</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">Get instant price quotes, structural material estimates, or schedule site delivery.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Store Details */}
          <div className="lg:col-span-5 bg-white/5 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-3">Store Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-white shrink-0 mt-1" />
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Address</div>
                  <div className="text-slate-200 font-semibold">{siteContent.address}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <PhoneIcon className="w-5 h-5 text-white shrink-0 mt-1" />
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Phone Number</div>
                  <a href={`tel:${siteContent.phone}`} className="text-white font-bold hover:underline">{siteContent.phone}</a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <WhatsAppIcon className="w-5 h-5 text-pink-400 shrink-0 mt-1" />
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">WhatsApp Number</div>
                  <a href={`https://wa.me/${siteContent.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-pink-400 font-bold hover:underline">{siteContent.whatsapp}</a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-white shrink-0 mt-1" />
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Business Hours</div>
                  <div className="text-slate-200 font-semibold">{siteContent.businessHours}</div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex space-x-3">
              <a href={`tel:${siteContent.phone}`} className="flex-1 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold py-3 rounded-xl text-xs text-center transition">Call Store</a>
              <a href={`https://wa.me/${siteContent.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl text-xs text-center transition">WhatsApp Us</a>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white/5 p-6 sm:p-8 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Send Price Inquiry / Site Quote Request</h3>
            {submitted ? (
              <div className="bg-pink-500/10 border border-pink-500/30 text-fuchsia-300 p-6 rounded-2xl text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-pink-400 mx-auto" />
                <h4 className="text-lg font-bold">Thank You! Your Inquiry Has Been Received.</h4>
                <p className="text-xs text-slate-300">Our store manager will contact you on <strong>{form.mobile}</strong> shortly with pricing and delivery terms.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', mobile: '', materialNeeded: 'Cement & Steel', message: '' }); }} className="bg-pink-600 text-white font-bold text-xs px-4 py-2 rounded-xl">Send Another Inquiry</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Your Full Name *</label>
                    <input type="text" required placeholder="e.g. K. Venkat Reddy" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Number *</label>
                    <input type="tel" required placeholder="e.g. 9848022334" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Materials Requirement</label>
                  <select value={form.materialNeeded} onChange={e => setForm({...form, materialNeeded: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                    <option value="Cement & Steel">Cement & Steel (Bulk Order)</option>
                    <option value="Cement Only">Cement Bags Only (JSW, ACC, Dalmia, Bharathi)</option>
                    <option value="Steel Only">Tata Tiscon & Vizag Steel TMT Bars</option>
                    <option value="Binding Wires & Nails">Binding Wires & Construction Nails</option>
                    <option value="Pipes & Waterproofing">PVC Pipes, Tanks & Waterproofing</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Site Location & Quantity Notes</label>
                  <textarea rows={4} placeholder="Enter site location in Kalikiri / nearby mandals and estimated quantities..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none" />
                </div>
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 text-sm transition">
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps */}
        <div className="mt-12 rounded-2xl overflow-hidden border border-slate-800" style={{ height: '320px' }}>
          <iframe src={siteContent.googleMapsEmbed} width="100%" height="320" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}
