import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Phone, ShoppingBag, Star, Truck, Shield, MapPin, Package, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface WelcomeGateProps {
  onContinue: () => void;
  onShopCategory: (category: string) => void;
}

export default function WelcomeGate({ onContinue, onShopCategory }: WelcomeGateProps) {
  const { categories, products, siteContent, brands } = useApp();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 400),
      setTimeout(() => setPhase(3), 650),
      setTimeout(() => setPhase(4), 900),
      setTimeout(() => setPhase(5), 1150),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const activeCategories = useMemo(() => categories.filter(c => c.enabled !== false).slice(0, 10), [categories]);
  const featuredProducts = useMemo(() => products.filter(p => p.featured && p.enabled).slice(0, 6), [products]);

  const categoryIcons: Record<string, string> = {
    'Cement': '🏗️',
    'TMT Steel': '🔩',
    'Structural Steel': '⚙️',
    'Roofing Sheets': '🏠',
    'Plumbing Materials': '🔧',
    'Electrical Materials': '⚡',
    'Construction Materials': '🧱',
    'Hardware': '🛠️',
    'Sand & Aggregates': '🏖️',
    'Bricks & Blocks': '📦',
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Glassy background with animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-pink-600/15 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-[15%] -right-[10%] w-[55vw] h-[55vw] bg-blue-600/15 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[30%] left-[40%] w-[35vw] h-[35vw] bg-amber-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[60%] right-[20%] w-[30vw] h-[30vw] bg-purple-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '9s' }} />
      </div>
      {/* Glassy mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-slate-950/30 to-black/50 pointer-events-none" />
      <div className="absolute inset-0 backdrop-blur-[40px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Top Bar */}
        <div className={`flex items-center justify-between mb-8 sm:mb-12 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center space-x-3">
            <img src="/windows-h-logo.png" alt="HSN Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-white/10 bg-slate-900/50 p-1.5" />
            <div>
              <h1 className="text-sm sm:text-lg font-black text-white font-industrial tracking-tight">HSN CEMENT & STEEL</h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Premium Building Materials</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a href={`tel:${siteContent.phone}`} className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-3 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition hover:scale-105">
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Call Now</span>
            </a>
            <a href={`https://wa.me/${siteContent.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
              className="flex items-center space-x-1.5 bg-[#25D366]/90 hover:bg-[#25D366] text-white px-3 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition hover:scale-105 border border-[#25D366]/30">
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Hero Section */}
        <div className={`text-center mb-10 sm:mb-14 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/25 px-4 py-1.5 rounded-full mb-4">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">Browse Our Complete Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-industrial tracking-tight mb-3">
            What Are You <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Looking For?</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Choose a category to explore our premium building materials, or continue to the full website.
          </p>
        </div>

        {/* Category Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10 sm:mb-14 transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {activeCategories.map((cat, i) => (
            <button key={cat.id} onClick={() => onShopCategory(cat.name)}
              className="group bg-white/5 hover:bg-white/10 border border-white/8 hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] cursor-pointer"
              style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                {categoryIcons[cat.name] || '📦'}
              </div>
              <h3 className="text-[11px] sm:text-xs font-black text-white leading-tight mb-1">{cat.name}</h3>
              <p className="text-[9px] sm:text-[10px] text-slate-500">
                {products.filter(p => p.category === cat.name && p.enabled).length} products
              </p>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 mx-auto mt-2 transition-colors" />
            </button>
          ))}
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className={`mb-10 sm:mb-14 transition-all duration-700 ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black text-white font-industrial">Featured Products</h3>
              </div>
              <button onClick={onContinue} className="text-[10px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {featuredProducts.map((p, i) => (
                <button key={p.id} onClick={() => onShopCategory(p.category)}
                  className="group bg-white/5 hover:bg-white/10 border border-white/8 hover:border-amber-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] text-left cursor-pointer"
                  style={{ transitionDelay: `${i * 60}ms` }}>
                  <div className="aspect-square bg-slate-900/50 overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-2.5 sm:p-3">
                    <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">{p.brand}</p>
                    <h4 className="text-[10px] sm:text-xs font-bold text-white line-clamp-2 mt-0.5 leading-tight">{p.name}</h4>
                    <p className="text-xs sm:text-sm font-black text-white mt-1">₹{p.price.toLocaleString('en-IN')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className={`grid grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-14 transition-all duration-700 ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { label: 'Our Services', desc: 'Site delivery & custom cutting', icon: Truck, color: 'from-blue-500/20 to-cyan-600/20' },
            { label: 'About HSN', desc: '15+ years of trust', icon: Shield, color: 'from-purple-500/20 to-pink-600/20' },
            { label: 'Contact Us', desc: 'Kalikiri, AP – 517234', icon: MapPin, color: 'from-emerald-500/20 to-teal-600/20' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} onClick={onContinue}
                className="group bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 rounded-2xl p-4 sm:p-5 flex items-center space-x-3 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.color} border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-black text-white">{item.label}</h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-400">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Brand Badges */}
        <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 sm:mb-12 transition-all duration-700 ${phase >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-2">Trusted Brands:</span>
          {brands.slice(0, 6).map(b => (
            <span key={b.id} className="bg-white/5 border border-white/8 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold text-slate-300 hover:bg-white/10 hover:border-white/15 transition-colors">
              {b.name}
            </span>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`text-center space-y-4 transition-all duration-700 ${phase >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button onClick={onContinue}
            className="group px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 hover:from-amber-500/30 hover:via-orange-500/30 hover:to-amber-500/20 border border-amber-500/30 hover:border-amber-400/50 text-white font-black text-sm sm:text-base tracking-wide inline-flex items-center space-x-3 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-[0_8px_32px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.25)] cursor-pointer">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <span>CONTINUE TO FULL WEBSITE</span>
            <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[10px] sm:text-xs text-slate-500">
            Explore all {products.filter(p => p.enabled).length}+ products across {activeCategories.length} categories
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 py-4 text-center text-[10px] text-slate-600">
          © {new Date().getFullYear()} HSN CEMENT AND STEEL. All Rights Reserved. Kalikiri, AP.
        </footer>
      </div>
    </div>
  );
}
