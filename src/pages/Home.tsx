import { ArrowRight, Phone, Shield, Truck, MapPin, Clock, ChevronRight, Eye, Package, TrendingUp, Award, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { bustedImageSrc } from '../lib/images';
import { telHref } from '../lib/phone';

export default function Home() {
  const { siteContent, products, setPage, categories, marketPrices } = useApp();
  const featuredProducts = products.filter(p => p.featured && p.enabled).slice(0, 6);
  // "Rates Updated" stamp for the price index: the date the admin last
  // saved prices in the portal (defaults to today before the first save).
  const pricesDate = marketPrices.updatedAt ? new Date(marketPrices.updatedAt) : new Date();
  const pricesDateLabel = pricesDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const pricesUpdatedText = pricesDate.toDateString() === new Date().toDateString() ? `Rates Updated: Today (${pricesDateLabel})` : `Rates Updated: ${pricesDateLabel}`;

  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={bustedImageSrc(siteContent.heroImage) || bustedImageSrc('/hero_bg_ultra_8k.png')} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="rounded-full text-xs font-bold text-white border border-white/18 px-4 py-2 flex items-center space-x-2 backdrop-blur-md" style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
              backdropFilter: 'blur(14px) saturate(160%)',
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.3), 0 10px 24px -14px rgba(0,0,0,0.7), 0 6px 14px -10px rgba(0,0,0,0.45)',
            }}>
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>GSTIN: 37AAAAA0000A1Z5</span>
            </span>
            <span className="rounded-full text-xs font-bold text-white border border-white/18 px-4 py-2 flex items-center space-x-2 backdrop-blur-md" style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
              backdropFilter: 'blur(14px) saturate(160%)',
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.3), 0 10px 24px -14px rgba(0,0,0,0.7), 0 6px 14px -10px rgba(0,0,0,0.45)',
            }}>
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Serving Kalikiri & Annamayya District, AP</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl font-industrial mb-8">
            HSN CEMENT AND STEEL
          </h1>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setPage('products')}
              className="px-8 py-4 rounded-2xl shadow-[0_8px_32px_rgba(59,130,246,0.3)] flex items-center justify-center space-x-3 text-base transition transform group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white hover:scale-105 active:scale-95 font-bold"
            >
              <Eye className="w-5 h-5 group-hover:text-white transition" />
              <span className="tracking-wide">Explore Materials Catalogue</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <a
              href={telHref(siteContent.phone)}
              className="bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-white font-bold px-8 py-4 rounded-2xl text-center transition flex items-center justify-center space-x-2 text-base backdrop-blur-md shadow-xl"
            >
              <Phone className="w-5 h-5" />
              <span>Call ({siteContent.phone})</span>
            </a>
          </div>
        </div>
      </section>

      {/* Daily Market Price Index */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
        <div className="rounded-3xl border border-white/16 p-6 sm:p-8 lg:p-10" style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(16px) saturate(170%)',
          WebkitBackdropFilter: 'blur(16px) saturate(170%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3), 0 22px 52px -26px rgba(0,0,0,0.75), 0 10px 24px -14px rgba(0,0,0,0.55)',
        }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-500/15 text-blue-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-blue-500/30 mb-3 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                <span>Daily Market Price Index</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-industrial tracking-wide">
                WHOLESALE TIERED PRICING TABLE
              </h2>
            </div>
            <div className="flex items-center space-x-2 bg-blue-500/15 border border-blue-500/30 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-blue-400">{pricesUpdatedText}</span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cement */}
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/16" style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(12px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 14px -10px rgba(0,0,0,0.5)',
                }}>
                    <Package className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-industrial">Cement Bags (OPC 53 / PPC 50kg)</h3>
                </div>
                <span className="text-[10px] font-bold text-blue-400 rounded-full border border-white/16 px-2.5 py-1" style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(12px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 18px -12px rgba(0,0,0,0.6)',
                }}>JSW / ACC / Dalmia</span>
              </div>
              <div className="divide-y divide-white/10">
                {marketPrices.cement.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 transition hover:bg-white/[0.02]" style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)',
                  }}>
                    <div>
                      <div className="text-sm font-bold text-slate-100">{tier.range}</div>
                      <div className="text-[10px] text-slate-500">{tier.label}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">{tier.price}</span>
                      <span className="text-xs text-slate-400">{tier.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steel */}
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/16" style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(12px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 14px -10px rgba(0,0,0,0.5)',
                }}>
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-industrial">TMT Steel Bars (6mm - 32mm Fe 550D)</h3>
                </div>
                <span className="text-[10px] font-bold text-rose-400 rounded-full border border-white/16 px-2.5 py-1" style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
                  backdropFilter: 'blur(12px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 18px -12px rgba(0,0,0,0.6)',
                }}>Tata Tiscon / Vizag</span>
              </div>
              <div className="divide-y divide-white/10">
                {marketPrices.steel.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 transition hover:bg-white/[0.02]" style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)',
                  }}>
                    <div>
                      <div className="text-sm font-bold text-slate-100">{tier.range}</div>
                      <div className="text-[10px] text-slate-500">{tier.label}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">{tier.price}</span>
                      <span className="text-xs text-slate-400">{tier.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">Prices are indicative and may vary. Call for today's confirmed rates.</p>
            <button onClick={() => setPage('products')} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center space-x-2 transition shadow-lg">
              <span>View Full Product Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-industrial">
            Browse Our <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Product Categories</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">Premium construction materials from top brands</p>
        </div>            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setPage('products')} className="rounded-2xl border border-white/14 p-3 flex flex-col items-center space-y-2 transition group hover:border-white/3 hover:bg-white/[0.02]" style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(14px) saturate(160%)',
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3), 0 14px 34px -18px rgba(0,0,0,0.7), 0 6px 16px -10px rgba(0,0,0,0.45)',
            }}>
              <img src={cat.image} alt={cat.name} className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl group-hover:scale-110 transition" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-industrial">
              Featured <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">Top-rated materials at wholesale direct rates</p>
          </div>
          <button onClick={() => setPage('products')} className="flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Services highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-industrial">
            Our <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">Comprehensive supply and logistics for all project sizes</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Building2, title: 'Bulk Supply', desc: 'Direct factory dispatch for projects' },
            { icon: Truck, title: 'Fleet Delivery', desc: 'Same-day local dispatch to site' },
            { icon: Shield, title: 'Quality Certified', desc: 'Original mill test certificates' },
            { icon: Award, title: '15+ Years', desc: 'Trusted industry experience' },
          ].map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div key={i} className="rounded-2xl border border-white/14 p-5 text-center space-y-3 transition hover:border-white/25 hover:bg-white/[0.02]" style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(14px) saturate(160%)',
                WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3), 0 14px 34px -18px rgba(0,0,0,0.7), 0 6px 16px -10px rgba(0,0,0,0.45)',
              }}>
                <div className="w-12 h-12 rounded-xl border border-white/16 flex items-center justify-center mx-auto" style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(12px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 14px -10px rgba(0,0,0,0.5)',
                }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-sm font-bold text-white">{svc.title}</h4>
                <p className="text-xs text-slate-400">{svc.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <button onClick={() => setPage('services')} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition flex items-center space-x-2 mx-auto">
            <span>View All Services</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
}
