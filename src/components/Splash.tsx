import { useState, useEffect, useCallback } from 'react';
import { Shield, MapPin, Truck, Award, ArrowRight, Phone, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bustedImageSrc } from '../lib/images';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Splash() {
  const { siteContent, dismissSplash, setPage } = useApp();
  const [exiting, setExiting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  const frontImages = siteContent.frontPageImages && siteContent.frontPageImages.length > 0
    ? siteContent.frontPageImages
    : [bustedImageSrc(siteContent.splashImage) || bustedImageSrc('/hero_bg_ultra_8k.png')];

  // Auto-rotate images if more than one
  useEffect(() => {
    if (frontImages.length <= 1) return;
    const iv = setInterval(() => setCurrentImg(i => (i + 1) % frontImages.length), 5000);
    return () => clearInterval(iv);
  }, [frontImages.length]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(() => {
      dismissSplash();
      setPage('welcome-gate');
    }, 800);
  };

  const phone = siteContent.phone || '919999999999';
  const whatsapp = (siteContent.whatsapp || '919999999999').replace(/[^0-9]/g, '');

  return (
    <div
      className={`splash-page ${exiting ? 'splash-exit' : ''}`}
      style={{
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      {/* Background with slideshow */}
      <div className="splash-bg">
        {frontImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              i === currentImg ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="splash-overlay" />
      </div>

      {/* Content container */}
      <div className="splash-content">

        {/* ====== TOP NAVBAR ====== */}
        <header className={`splash-navbar ${loaded ? 'visible' : ''}`}>
          <div className="splash-brand">
            <div className="splash-logo">
              <img src={bustedImageSrc('/windows-h-logo.png')} alt="HSN" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <div className="splash-brand-title">HSN CEMENT &amp; STEEL</div>
              <div className="splash-brand-subtitle">
                PREMIUM BUILDING MATERIALS &nbsp;•&nbsp; Kalikiri, AP
              </div>
            </div>
          </div>
          <div className="splash-nav-actions">
            <button className="splash-nav-btn splash-call" onClick={() => window.location.href = `tel:+${phone}`} aria-label="Call Now">
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </button>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="splash-nav-btn splash-whatsapp" aria-label="WhatsApp">
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </header>

        {/* ====== HERO ====== */}
        <main className={`splash-hero ${loaded ? 'visible' : ''}`}>

          {/* Badges */}
          <div className="splash-badges">
            <div className="splash-badge">
              <Shield className="w-4 h-4 text-purple-300" />
              <span>GSTIN Registered Dealer</span>
            </div>
            <div className="splash-badge">
              <MapPin className="w-4 h-4 text-blue-300" />
              <span>Kalikiri, AP</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="splash-heading">
            WELCOME TO<br />
            HSN CEMENT AND STEEL
          </h1>

          {/* CTA Buttons */}
          <div className="splash-cta-row">
            <button className="splash-primary-btn" onClick={handleEnter} aria-label="Enter website and shop catalog">
              <span className="splash-primary-left">
                <span className="splash-primary-icon">🛒</span>
                <span>ENTER WEBSITE &amp; SHOP CATALOG</span>
              </span>
              <span className="splash-arrow">→</span>
            </button>
            <button className="splash-secondary-btn" onClick={() => window.location.href = `tel:+${phone}`} aria-label="Call store now">
              <Phone className="w-5 h-5" />
              <span>Call Store Now</span>
            </button>
          </div>

          {/* Info Pills */}
          <div className="splash-info-row">
            <div className="splash-info-pill">
              <MapPin className="w-4 h-4" />
              <span>Kalikiri, AP - 517234</span>
            </div>
            <div className="splash-info-pill">
              <Clock className="w-4 h-4" />
              <span>Open 12 Hours Daily</span>
            </div>
          </div>
        </main>

        {/* ====== BOTTOM FEATURE CARDS ====== */}
        <section className={`splash-features ${loaded ? 'visible' : ''}`}>
          <div className="splash-feature-card card-1">
            <div className="splash-feature-icon card-1-icon">
              <Shield className="w-6 h-6" />
            </div>
            <div className="splash-feature-text">
              <div className="splash-feature-title">100% Genuine Brands</div>
              <div className="splash-feature-desc">JSW, ACC, Dalmia, Bharathi, Tata Tiscon &amp; Vizag Steel</div>
            </div>
          </div>

          <div className="splash-feature-card card-2">
            <div className="splash-feature-icon card-2-icon">
              <span className="text-xl font-black">₹</span>
            </div>
            <div className="splash-feature-text">
              <div className="splash-feature-title">Wholesale Direct Rates</div>
              <div className="splash-feature-desc">Best daily prices for home builders &amp; contractors</div>
            </div>
          </div>

          <div className="splash-feature-card card-3">
            <div className="splash-feature-icon card-3-icon">
              <Truck className="w-6 h-6" />
            </div>
            <div className="splash-feature-text">
              <div className="splash-feature-title">Express Site Transport</div>
              <div className="splash-feature-desc">Direct site delivery in Kalikiri &amp; nearby mandals</div>
            </div>
          </div>

          <div className="splash-feature-card card-4">
            <div className="splash-feature-icon card-4-icon">
              <Award className="w-6 h-6" />
            </div>
            <div className="splash-feature-text">
              <div className="splash-feature-title">15+ Years Trust</div>
              <div className="splash-feature-desc">Serving thousands of residential &amp; commercial projects</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
