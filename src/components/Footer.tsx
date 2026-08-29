import { MapPin, Phone as PhoneIcon, Clock, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Footer() {
  const { setPage, siteContent, logoutAdmin } = useApp();

  return (
    <footer className="bg-gradient-to-b from-slate-950/80 to-slate-950 border-t border-blue-500/30 text-slate-400 text-xs pt-16 pb-8 relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-pink-500 to-indigo-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setPage('home')}>
              <img src="/windows-h-logo.png" alt="HSN Logo" className="w-12 h-12 rounded-xl object-contain bg-slate-900 border border-slate-800 p-1 shadow-sm group-hover:border-pink-500 transition" />
              <span className="text-xl font-black text-white tracking-tight group-hover:text-pink-400 transition font-industrial">HSN CEMENT & STEEL</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Kalikiri's leading construction materials supplier. Authorised dealer for JSW, ACC, Dalmia, Bharathi Cement, Tata Tiscon, Vizag Steel & Bosch Cutting Blades.
            </p>
            <div className="flex items-center space-x-2 text-white font-semibold text-[11px]">
              <Shield className="w-4 h-4 text-pink-400" />
              <span>100% Factory Certified Genuine Quality</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">Quick Navigation</h4>
            <ul className="space-y-2 font-medium">
              {['home', 'products', 'services', 'gallery', 'about', 'contact'].map(page => (
                <li key={page}>
                  <button onClick={() => setPage(page as any)} className="hover:text-white transition capitalize text-xs">
                    {page === 'about' ? 'About Us' : page}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">Top Categories</h4>
            <ul className="space-y-2 font-medium text-xs">
              <li><button onClick={() => setPage('products')} className="hover:text-white transition">OPC & PPC Cement Bags</button></li>
              <li><button onClick={() => setPage('products')} className="hover:text-white transition">Tata Tiscon TMT (6mm-32mm)</button></li>
              <li><button onClick={() => setPage('products')} className="hover:text-white transition">Vizag Steel Rebar</button></li>
              <li><button onClick={() => setPage('products')} className="hover:text-white transition">Bosch Diamond & Metal Cutting Blades</button></li>
              <li><button onClick={() => setPage('products')} className="hover:text-white transition">18G & 20G Binding Wires</button></li>
              <li><button onClick={() => setPage('products')} className="hover:text-white transition">Waterproofing & Construction Chemicals</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">Store Contact</h4>
            <ul className="space-y-3 font-medium">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>{siteContent.address}</span>
              </li>
              <li className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4 text-white shrink-0" />
                <a href={`tel:${siteContent.phone}`} className="hover:text-white font-bold">{siteContent.phone}</a>
              </li>
              <li className="flex items-center space-x-2">
                <WhatsAppIcon className="w-4 h-4 text-pink-400 shrink-0" />
                <a href={`https://wa.me/${siteContent.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-pink-400 font-bold">{siteContent.whatsapp}</a>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-white shrink-0" />
                <span>{siteContent.businessHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 text-center flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <img src="/windows-h-logo.png" alt="Logo" className="w-6 h-6 rounded-md object-contain" />
            <p className="cursor-default text-slate-400">
              © {new Date().getFullYear()} HSN CEMENT AND STEEL. All Rights Reserved. Kalikiri, AP.
            </p>
          </div>
          <button onClick={() => setPage('terms')} className="mt-2 sm:mt-0 text-slate-300 hover:text-amber-400 font-bold transition flex items-center gap-1 cursor-pointer border border-white/15 px-3 py-1.5 rounded-full bg-slate-900/5">
            <span>Terms & Conditions</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
