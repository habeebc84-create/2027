import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Shield, MapPin, Truck, Award, Phone, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { telHref, waHref } from '../lib/phone';
import { bustedImageSrc } from '../lib/images';
const WhatsAppIcon = ({ className }) => (_jsx("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: className, children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" }) }));
export default function Splash() {
    const { siteContent, dismissSplash, setPage } = useApp();
    const [exiting] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [currentImg, setCurrentImg] = useState(0);
    // Phones/tablets (<=900px, same breakpoint as the CSS) get the
    // admin's mobile entry photos; laptops get the laptop entry photos.
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 900px)');
        const onChange = () => setIsMobile(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    // Legacy swap: the shared cloud copy still carries '/splash_bg_clear.png'
    // (a generic construction site). Show the HSN shop photo instead, unless
    // the admin has picked a different splash image or front-page images.
    const legacySplash = siteContent.splashImage === '/splash_bg_clear.png'
        ? '/hsn_hero_new.png'
        : siteContent.splashImage;
    // Entry photos: the admin's per-device list first; if that list is
    // empty, fall back to the shared front-page photos, then the shop photo.
    const deviceImages = isMobile ? siteContent.splashMobileImages : siteContent.splashLaptopImages;
    const frontImages = deviceImages && deviceImages.length > 0
        ? deviceImages
        : (siteContent.frontPageImages && siteContent.frontPageImages.length > 0
            ? siteContent.frontPageImages
            : [bustedImageSrc(legacySplash) || bustedImageSrc('/hero_bg_ultra_8k.png')]);
    const shownImg = frontImages.length ? currentImg % frontImages.length : 0;
    // Auto-rotate images if more than one
    useEffect(() => {
        if (frontImages.length <= 1)
            return;
        const iv = setInterval(() => setCurrentImg(i => (i + 1) % frontImages.length), 5000);
        return () => clearInterval(iv);
    }, [frontImages.length]);
    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 50);
        return () => clearTimeout(t);
    }, []);
    const handleEnter = () => {
        // Back to the pre-BUILD-29 behaviour: dismiss immediately, no exit
        // animation delay, so entering can never get stuck.
        try {
            dismissSplash();
        }
        catch { /* entering must not be blocked by storage */ }
        setPage('welcome-gate');
    };
    // Letter-by-letter welcome: each character gets its own span with a
    // growing animation delay, so the text writes itself one letter at
    // a time. Spaces render as non-breaking spaces so they keep their slot.
    let welcomeLetterIndex = 0;
    const welcomeLetterSpans = (line) => {
        const start = welcomeLetterIndex;
        welcomeLetterIndex += line.length;
        return [...line].map((ch, i) => (_jsx("span", { className: "splash-letter", style: { animationDelay: `${(start + i) * 0.06}s` }, children: ch === ' ' ? '\u00A0' : ch }, i)));
    };
    const callHref = telHref(siteContent.phone);
    const whatsappHref = waHref(siteContent.whatsapp);
    return (_jsxs("div", { className: `splash-page ${exiting ? 'splash-exit' : ''}`, style: {
            fontFamily: '"Poppins", sans-serif',
        }, children: [_jsxs("div", { className: "splash-bg", children: [frontImages.map((img, i) => (_jsx("img", { src: img, alt: "", onError: (e) => {
                            e.currentTarget.src = '/hero_bg_ultra_8k.png';
                        }, className: `absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${i === shownImg ? 'opacity-100' : 'opacity-0'}` }, i))), _jsx("div", { className: "splash-overlay" })] }), _jsxs("div", { className: "splash-content", children: [_jsxs("header", { className: `splash-navbar ${loaded ? 'visible' : ''}`, children: [_jsx("span", { "aria-hidden": "true", className: "lime-glass-layer" }), _jsx("span", { "aria-hidden": "true", className: "lime-glass-bead lime-glass-bead-bottom" }), _jsxs("div", { className: "splash-brand", children: [_jsx("div", { className: "splash-logo", children: _jsx("img", { src: bustedImageSrc('/windows-h-logo.png'), alt: "HSN", className: "w-full h-full object-contain p-1" }) }), _jsx("div", { children: _jsx("div", { className: "splash-brand-title", children: "HSN CEMENT & STEEL" }) })] }), _jsx("div", { className: "splash-nav-actions", children: _jsxs("a", { href: whatsappHref, target: "_blank", rel: "noreferrer", className: "splash-nav-btn splash-whatsapp", "aria-label": "WhatsApp", children: [_jsx(WhatsAppIcon, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "WhatsApp" })] }) })] }), _jsxs("main", { className: `splash-hero ${loaded ? 'visible' : ''}`, children: [_jsxs("h1", { className: "splash-heading", "aria-label": "Welcome to HSN Cement and Steel", children: [_jsx("span", { className: "splash-welcome-line splash-welcome-intro", "aria-hidden": "true", children: welcomeLetterSpans('WELCOME TO') }), _jsxs("span", { className: "splash-welcome-line splash-welcome-brand", "aria-hidden": "true", children: [_jsx("span", { className: "splash-brand-phrase", children: welcomeLetterSpans('HSN CEMENT') }), _jsx("span", { className: "splash-brand-phrase", children: welcomeLetterSpans('AND STEEL') })] })] }), _jsxs("div", { className: "splash-cta-row", children: [_jsxs("button", { className: "splash-primary-btn", onClick: handleEnter, "aria-label": "Enter website and shop catalog", children: [_jsxs("span", { className: "splash-primary-left", children: [_jsx("span", { className: "splash-primary-icon", children: "\uD83D\uDED2" }), _jsx("span", { children: "ENTER WEBSITE & SHOP CATALOG" })] }), _jsx("span", { className: "splash-arrow", children: "\u2192" })] }), _jsxs("button", { className: "splash-secondary-btn", onClick: () => window.location.href = callHref, "aria-label": "Call store now", children: [_jsx(Phone, { className: "w-5 h-5" }), _jsx("span", { children: "Call Store Now" })] })] }), _jsx("div", { style: { marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }, children: "HSN BUILD 90" }), _jsxs("div", { className: "splash-info-row", children: [_jsxs("div", { className: "splash-info-pill", children: [_jsx(MapPin, { className: "w-4 h-4" }), _jsx("span", { children: "Kalikiri, AP - 517234" })] }), _jsxs("div", { className: "splash-info-pill", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { children: "Open 12 Hours Daily" })] })] })] }), _jsxs("section", { className: `splash-features ${loaded ? 'visible' : ''}`, children: [_jsxs("div", { className: "splash-feature-card card-1", children: [_jsx("div", { className: "splash-feature-icon card-1-icon", children: _jsx(Shield, { className: "w-6 h-6" }) }), _jsxs("div", { className: "splash-feature-text", children: [_jsx("div", { className: "splash-feature-title", children: "100% Genuine Brands" }), _jsx("div", { className: "splash-feature-desc", children: "JSW, ACC, Dalmia, Bharathi, Tata Tiscon & Vizag Steel" })] })] }), _jsxs("div", { className: "splash-feature-card card-2", children: [_jsx("div", { className: "splash-feature-icon card-2-icon", children: _jsx("span", { className: "text-xl font-black", children: "\u20B9" }) }), _jsxs("div", { className: "splash-feature-text", children: [_jsx("div", { className: "splash-feature-title", children: "Wholesale Direct Rates" }), _jsx("div", { className: "splash-feature-desc", children: "Best daily prices for home builders & contractors" })] })] }), _jsxs("div", { className: "splash-feature-card card-3", children: [_jsx("div", { className: "splash-feature-icon card-3-icon", children: _jsx(Truck, { className: "w-6 h-6" }) }), _jsxs("div", { className: "splash-feature-text", children: [_jsx("div", { className: "splash-feature-title", children: "Express Site Transport" }), _jsx("div", { className: "splash-feature-desc", children: "Direct site delivery in Kalikiri & nearby mandals" })] })] }), _jsxs("div", { className: "splash-feature-card card-4", children: [_jsx("div", { className: "splash-feature-icon card-4-icon", children: _jsx(Award, { className: "w-6 h-6" }) }), _jsxs("div", { className: "splash-feature-text", children: [_jsx("div", { className: "splash-feature-title", children: "15+ Years Trust" }), _jsx("div", { className: "splash-feature-desc", children: "Serving thousands of residential & commercial projects" })] })] })] })] })] }));
}
