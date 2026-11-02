import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowRight, Phone, Shield, Truck, MapPin, Clock, ChevronRight, Eye, Package, TrendingUp, Award, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { telHref } from '../lib/phone';

// Code-split: the burst is a decorative hero background and pulls in
// three.js, so it loads as its own chunk after first paint instead of
// blocking the catalogue on it. The hero's gradient/glow canvas below
// is the fallback while the chunk is in flight (and if WebGL is absent).
const GlowingParticles = lazy(() => import('../components/GlowingParticles'));

export default function Home() {
  const { siteContent, products, setPage, categories, marketPrices, siteSettings } = useApp();
  // Phone tuning for the two WebGL pieces on this page (hero particle
  // density, closing wordmark rig): their sizes are tuned for desktop
  // frames, so desktop values would swamp a 390px screen.
  const [isPhone, setIsPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsPhone(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const featuredProducts = (Array.isArray(products) ? products : []).filter(p => p && p.featured && p.enabled).slice(0, 6);
  // "Rates Updated" stamp for the price index: the date the admin last
  // saved prices in the portal (defaults to today before the first save).
  const pricesDate = marketPrices?.updatedAt ? new Date(marketPrices.updatedAt) : new Date();
  const pricesDateLabel = pricesDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const pricesUpdatedText = pricesDate.toDateString() === new Date().toDateString() ? `Rates Updated: Today (${pricesDateLabel})` : `Rates Updated: ${pricesDateLabel}`;

  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="home-hero relative flex items-center overflow-hidden">
        {/* Obsidian/charcoal brand canvas with a restrained champagne glow.
            Purchase orange is reserved for the catalog CTA below. */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-obsidian to-obsidian" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-champagne/10 blur-[120px] rounded-full" />
          <div className="absolute top-1/3 -right-24 w-96 h-96 bg-champagne/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
        </div>

        {/* Glowing particle burst filling the hero — the stretch from the
            top bar down to the Daily Market Price Index panel (which
            overlaps this section's foot). Seated right so the headline
            keeps the left; champagne sparks off an ivory-hot core are the
            palette's brand accent (COLOR_PALETTE.md), melting into the
            existing champagne glow. Purely decorative, hence aria-hidden,
            and pointer-events-none so it can never sit on a CTA tap.
            Phones get a sparser cloud (density is squared into the ray
            count, so 12 is roughly half the points of 16). */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div className="absolute left-1/2 top-[54%] aspect-square w-[440px] max-w-none -translate-y-1/2 translate-x-[-16%] opacity-80 sm:w-[600px] sm:translate-x-[-14%] lg:left-auto lg:right-[-140px] lg:w-[720px] lg:translate-x-0">
            <Suspense fallback={null}>
              <GlowingParticles
                color="#C6A875"
                hot="#F7F5F0"
                density={isPhone ? 12 : 16}
                sizePercent={95}
                style={{ minWidth: 0, minHeight: 0, width: '100%', height: '100%' }}
              />
            </Suspense>
          </div>
        </div>
        {/* Readability veil: keeps the headline/CTAs on a calm ground
            while the burst stays bright on the right. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-obsidian/80 via-obsidian/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="rounded-full text-xs font-bold text-ivory bg-charcoal/70 border border-gunmetal px-4 py-2 flex items-center space-x-2 backdrop-blur-md">
              <Shield className="w-4 h-4 text-champagne" />
              <span>GSTIN: {siteSettings.gstNumber}</span>
            </span>
            <span className="rounded-full text-xs font-bold text-ivory bg-charcoal/70 border border-gunmetal px-4 py-2 flex items-center space-x-2 backdrop-blur-md">
              <MapPin className="w-4 h-4 text-silver" />
              <span>Serving Kalikiri & Annamayya District, AP</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-ivory tracking-tight leading-none drop-shadow-2xl font-industrial mb-8">
            HSN CEMENT <span className="text-champagne">AND STEEL</span>
          </h1>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setPage('products')}
              className="btn-purchase px-8 py-4 rounded-2xl shadow-xl flex items-center justify-center space-x-3 text-base group"
            >
              <Eye className="w-5 h-5" />
              <span className="tracking-wide">Explore Materials Catalogue</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <a
              href={telHref(siteContent.phone)}
              className="btn-secondary font-bold px-8 py-4 rounded-2xl text-center flex items-center justify-center space-x-2 text-base backdrop-blur-md shadow-xl"
            >
              <Phone className="w-5 h-5" />
              <span>Call ({siteContent.phone})</span>
            </a>
          </div>
        </div>
      </section>

      {/* Daily Market Price Index — warm porcelain reading surface */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
        <Reveal>
        <div className="surface-light market-price-panel rounded-3xl p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-champagne/15 text-brand-ink text-[10px] font-bold px-3 py-1.5 rounded-full border border-champagne/40 mb-3 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                <span>Daily Market Price Index</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-graphite font-industrial tracking-wide">
                WHOLESALE TIERED PRICING TABLE
              </h2>
            </div>
            <div className="status-success-light flex items-center space-x-2 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-bold">{pricesUpdatedText}</span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Cement Bags (OPC 53 / PPC 50kg)', badge: 'JSW / ACC / Dalmia', icon: Package, tiers: marketPrices.cement },
              { title: 'TMT Steel Bars (6mm - 32mm Fe 550D)', badge: 'Tata Tiscon / Vizag', icon: TrendingUp, tiers: marketPrices.steel },
            ].map(group => {
              const Icon = group.icon;
              return (
                <div key={group.title} className="market-price-card rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gunmetal/20">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-champagne/15 border border-champagne/40 shrink-0">
                        <Icon className="w-4 h-4 text-brand-ink" />
                      </div>
                      <h3 className="text-sm font-bold text-graphite font-industrial">{group.title}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-muted-light rounded-full border border-gunmetal/25 px-2.5 py-1 shrink-0">{group.badge}</span>
                  </div>
                  <div>
                    {group.tiers.map((tier, i) => (
                      <div key={i} className="market-price-row flex items-center justify-between px-5 py-3.5 transition">
                        <div>
                          <div className="text-sm font-bold text-graphite">{tier.range}</div>
                          <div className="text-[10px] text-muted-light">{tier.label}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-graphite">{tier.price}</span>
                          <span className="text-xs text-muted-light">{tier.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-light">Prices are indicative and may vary. Call for today's confirmed rates.</p>
            <button onClick={() => setPage('products')} className="btn-secondary font-bold px-6 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-lg">
              <span>View Full Product Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Reveal>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-ivory font-industrial">
            Browse Our Product Categories
          </h2>
          <p className="text-silver text-sm mt-2">Premium construction materials from top brands</p>
        </div>
        </Reveal>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} delay={Math.min(i * 50, 400)} className="h-full">
            <button onClick={() => setPage('products')} className="rounded-2xl border border-gunmetal p-3 flex flex-col items-center space-y-2 transition group hover:border-champagne/50 hover:bg-charcoal w-full h-full" style={{
              background:
                'var(--color-charcoal)',
              backdropFilter: 'blur(14px) saturate(160%)',
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3), 0 14px 34px -18px rgba(0,0,0,0.7), 0 6px 16px -10px rgba(0,0,0,0.45)',
            }}>
              <img src={cat.image} alt={cat.name} className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl group-hover:scale-110 transition" />
              <span className="text-[10px] sm:text-xs font-bold text-silver text-center leading-tight">{cat.name}</span>
            </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Reveal>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-ivory font-industrial">
              Featured Products
            </h2>
            <p className="text-silver text-xs mt-1">Top-rated materials at wholesale direct rates</p>
          </div>
          <button onClick={() => setPage('products')} className="flex items-center space-x-1 text-xs font-bold text-ivory hover:text-ivory transition">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredProducts.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i * 60, 360)} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Reveal>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-ivory font-industrial">
            Our Services
          </h2>
          <p className="text-silver text-sm mt-2">Comprehensive supply and logistics for all project sizes</p>
        </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { icon: Building2, title: 'Bulk Supply', desc: 'Direct factory dispatch for projects' },
            { icon: Truck, title: 'Fleet Delivery', desc: 'Same-day local dispatch to site' },
            { icon: Shield, title: 'Quality Certified', desc: 'Original mill test certificates' },
            { icon: Award, title: '15+ Years', desc: 'Trusted industry experience' },
          ].map((svc, i) => {
            const Icon = svc.icon;
            return (
              <Reveal key={i} delay={Math.min(i * 60, 240)} className="h-full">
              <div className="rounded-2xl border border-gunmetal p-5 text-center space-y-3 transition hover:border-champagne/50 hover:bg-charcoal h-full w-full" style={{
                background:
                  'var(--color-charcoal)',
                backdropFilter: 'blur(14px) saturate(160%)',
                WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3), 0 14px 34px -18px rgba(0,0,0,0.7), 0 6px 16px -10px rgba(0,0,0,0.45)',
              }}>
                <div className="w-12 h-12 rounded-xl border border-gunmetal flex items-center justify-center mx-auto" style={{
                  background:
                    'color-mix(in srgb, var(--color-champagne) 14%, var(--color-charcoal))',
                  backdropFilter: 'blur(12px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 14px -10px rgba(0,0,0,0.5)',
                }}>
                  <Icon className="w-6 h-6 text-champagne" />
                </div>
                <h4 className="text-sm font-bold text-ivory">{svc.title}</h4>
                <p className="text-xs text-silver">{svc.desc}</p>
              </div>
              </Reveal>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <button onClick={() => setPage('services')} className="bg-charcoal/80 hover:bg-charcoal border border-gunmetal text-ivory font-bold px-6 py-3 rounded-xl text-sm transition flex items-center space-x-2 mx-auto">
            <span>View All Services</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Closing brand mark — the business name in big all-caps at the very
          end of the home page. This is plain HTML text rather than the old
          canvas band: it is always visible (no WebGL/font-loading
          dependency), selectable, readable by assistive tech, and cannot be
          silently shrunk by a fallback font. Oswald is self-hosted in
          main.tsx, and the viewport-based size makes the 17-letter name span
          the full width on phones and desktops alike. */}
      <Reveal>
        <div className="relative w-full overflow-hidden bg-obsidian pt-8 pb-28 sm:pt-12 lg:pb-12">
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-charcoal/30 to-obsidian" />
          <div className="absolute left-1/2 top-1/2 h-32 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/10 blur-[90px] pointer-events-none" />
          <h2
            className="relative z-10 font-industrial font-bold text-ivory text-center leading-none whitespace-nowrap select-none"
            style={{
              fontSize: 'clamp(2.25rem, 10.6vw, 11rem)',
              letterSpacing: '-0.01em',
              textShadow: '0 0 32px rgba(198, 168, 117, 0.28)',
            }}
          >
            HSNCEMENTANDSTEEL
          </h2>
        </div>
      </Reveal>

    </div>
  );
}
