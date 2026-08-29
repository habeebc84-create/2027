import { ShoppingCart, Phone, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Page } from '../types';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const navLinks: { label: string; page: Page; path: string }[] = [
  { label: 'Home', page: 'home', path: '/' },
  { label: 'Products', page: 'products', path: '/products' },
  { label: 'Services', page: 'services', path: '/services' },
  { label: 'Gallery', page: 'gallery', path: '/gallery' },
  { label: 'About Us', page: 'about', path: '/about' },
  { label: 'Contact', page: 'contact', path: '/contact' },
  { label: 'Track Order', page: 'order-tracking', path: '/track-order' },
];

export default function Navbar({ onCartClick }: { onCartClick: () => void }) {
  const { setPage, currentPage, cartCount, siteContent } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (e: React.MouseEvent, page: Page) => {
    e.preventDefault();
    setPage(page);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-2.5 px-4 sm:px-6 lg:px-8">
      {/* Floating rounded bar */}
      <div className="max-w-[1400px] mx-auto rounded-2xl bg-slate-950/30 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-3 sm:px-4 py-1.5">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <a href="/" onClick={e => handleNav(e, 'home')} className="flex items-center space-x-2 cursor-pointer group shrink-0">
            <img src="/windows-h-logo.png" alt="HSN Logo" className="w-10 h-10 rounded-lg object-contain border border-white/10 bg-slate-950/40 p-0.5 shadow-md group-hover:border-white/30 transition duration-300" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black text-white tracking-tight group-hover:text-slate-200 transition font-industrial leading-tight">HSN CEMENT & STEEL</span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.1em] font-bold text-slate-400 uppercase hidden sm:block">Premium Building Materials</span>
            </div>
          </a>

          {/* Center nav */}
          <div className="hidden lg:flex items-center space-x-0">
            {navLinks.map(link => (
              <a
                key={link.page}
                href={link.path}
                onClick={e => handleNav(e, link.page)}
                className={`px-2.5 xl:px-4 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition ${
                  currentPage === link.page
                    ? 'text-white bg-white/10 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-2 shrink-0">
            <a href={`tel:${siteContent.phone}`} className="hidden sm:flex items-center space-x-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 text-white px-3 xl:px-4 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition shadow-md">
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>
            <a href={`https://wa.me/${siteContent.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hidden sm:flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 xl:px-4 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition shadow-md shadow-green-500/20">
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <button onClick={onCartClick} className="relative bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 text-white p-2 rounded-xl transition shadow-md">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 text-slate-300 hover:text-white">
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 max-w-[1400px] mx-auto rounded-2xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-3 space-y-1">
          {navLinks.map(link => (
            <a
              key={link.page}
              href={link.path}
              onClick={e => { handleNav(e, link.page); setMobileOpen(false); }}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentPage === link.page ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-2 border-t border-white/10 flex space-x-2">
            <a href={`tel:${siteContent.phone}`} className="flex-1 flex items-center justify-center space-x-2 bg-slate-800/60 border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-bold">
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>
            <a href={`https://wa.me/${siteContent.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center space-x-2 bg-[#25D366] text-white px-4 py-2.5 rounded-xl text-sm font-bold">
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
