import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Home as HomeIcon, Package, Wrench, Images, MessageCircle, PackageCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
const navItems = [
    { label: 'Home', page: 'home' },
    { label: 'Products', page: 'products' },
    { label: 'Services', page: 'services' },
    { label: 'Gallery', page: 'gallery' },
    { label: 'Contact', page: 'contact' },
    { label: 'Track Order', short: 'Track', page: 'order-tracking' },
];
// Each destination gets its own small icon gesture. The active icon repeats
// gently after a long pause; inactive icons respond to hover/tap.
const iconAnimations = {
    home: { y: [0, -3, 0], scale: [1, 1.08, 1] },
    products: { y: [0, -2, 0], rotate: [0, -8, 6, 0] },
    services: { rotate: [0, -18, 10, 0] },
    gallery: { rotate: [0, -6, 4, 0], scale: [1, 1.08, 1] },
    contact: { scale: [1, 1.12, 0.98, 1], rotate: [0, -5, 3, 0] },
    'order-tracking': { y: [0, -3, 0], scale: [1, 1.06, 1] },
};
// The shared highlight morphs its corners as it travels between sections.
const activeRadii = {
    home: 28,
    products: 18,
    services: 24,
    gallery: 14,
    contact: 28,
    'order-tracking': 20,
};
// Apple-style bottom bar (iOS liquid-glass dock): a floating capsule of
// Charcoal Steel glass with a Gunmetal edge. The selected item carries
// a Burnished Champagne pill with Obsidian ink; inactive items use
// Silver Mist so the dock stays readable over photos.
export default function FloatingBottomNav({ visible }) {
    const { currentPage, setPage } = useApp();
    const shouldReduceMotion = useReducedMotion();
    const animate = !shouldReduceMotion;
    const [activation, setActivation] = useState({ page: currentPage, count: 0 });
    const handleNavigate = (page) => {
        // Re-tapping the current section replays its icon gesture too.
        setActivation((prev) => ({ page, count: prev.count + 1 }));
        setPage(page);
    };
    return (_jsx(motion.nav, { style: {
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 60,
            pointerEvents: 'none',
        }, animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: animate ? 12 : 0 }, transition: { duration: animate ? 0.32 : 0, ease: 'easeOut' }, "aria-label": "Primary navigation", "aria-hidden": !visible, inert: !visible, children: _jsxs("div", { className: "dock-glass relative rounded-full w-[calc(100vw-16px)] sm:w-auto p-1.5 border border-gunmetal", style: {
                pointerEvents: visible ? 'auto' : 'none',
                maxWidth: 'calc(100vw - 16px)',
                background: 'linear-gradient(180deg, rgba(26,29,33,0.44) 0%, rgba(26,29,33,0.34) 55%, rgba(26,29,33,0.28) 100%)',
                backdropFilter: 'blur(28px) saturate(135%)',
                WebkitBackdropFilter: 'blur(28px) saturate(135%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.30), 0 24px 48px -20px rgba(0,0,0,0.65), 0 10px 24px -12px rgba(0,0,0,0.45)',
            }, children: [_jsx("span", { "aria-hidden": "true", style: {
                        position: 'absolute',
                        inset: '-1px',
                        borderRadius: '9999px',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.07) 24%, rgba(255,255,255,0) 55%)',
                        pointerEvents: 'none',
                        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                        mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        padding: '1px',
                    } }), _jsx("div", { className: "relative flex items-center gap-0.5 sm:gap-1", children: navItems.map((item, index) => {
                        const isActive = currentPage === item.page;
                        const activationKey = isActive && activation.page === item.page ? activation.count : 0;
                        return (_jsxs(motion.button, { type: "button", "aria-current": isActive ? 'page' : undefined, "aria-label": item.label, onClick: () => handleNavigate(item.page), className: "relative flex-1 sm:flex-none flex flex-col items-center justify-center gap-1 rounded-full px-0 sm:px-2.5 py-2 min-w-0 sm:min-w-[64px] h-[56px] leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne", initial: animate ? { opacity: 0, y: 10, scale: 0.9 } : false, animate: { opacity: 1, y: 0, scale: 1 }, variants: { pressed: { scale: 0.94, transition: { duration: 0.12, delay: 0 } } }, whileHover: animate ? { y: -1.5, transition: { duration: 0.15, delay: 0 } } : undefined, whileTap: animate ? 'pressed' : undefined, transition: { duration: animate ? 0.28 : 0, delay: animate ? index * 0.04 : 0, ease: 'easeOut' }, children: [isActive && (_jsx(motion.span, { layoutId: "appleDockPill", "aria-hidden": "true", className: "absolute inset-0", style: {
                                        background: 'var(--color-champagne)',
                                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 18px -8px rgba(0,0,0,0.55)',
                                        backdropFilter: 'blur(10px) saturate(140%)',
                                        WebkitBackdropFilter: 'blur(10px) saturate(140%)',
                                    }, initial: false, animate: { borderRadius: activeRadii[item.page] }, transition: shouldReduceMotion
                                        ? { duration: 0 }
                                        : {
                                            type: 'spring',
                                            stiffness: 520,
                                            damping: 34,
                                            mass: 0.7,
                                            borderRadius: { duration: 0.35, ease: 'easeOut' },
                                        } })), _jsx(motion.span, { className: "relative flex items-center justify-center", style: { color: isActive ? 'var(--color-obsidian)' : 'var(--color-silver)' }, variants: { pressed: { scale: 0.88, rotate: item.page === 'services' ? -12 : 0 } }, transition: { duration: 0.12 }, children: _jsx(motion.span, { className: "flex items-center justify-center", animate: isActive && animate ? iconAnimations[item.page] : undefined, transition: isActive && animate
                                            ? { duration: 0.7, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.5 }
                                            : { duration: 0 }, children: _jsx(SvgIcon, { name: item.label, size: 22 }) }, `${item.page}-${isActive ? 'active' : 'idle'}-${activationKey}`) }), _jsxs("span", { className: `relative text-[11px] sm:text-[10px] font-medium tracking-tight select-none whitespace-nowrap leading-none ${isActive ? 'text-obsidian' : 'text-silver'}`, children: [_jsx("span", { className: "sm:hidden", children: item.short ?? item.label }), _jsx("span", { className: "hidden sm:inline", children: item.label })] })] }, item.page));
                    }) })] }) }));
}
function SvgIcon({ name, size = 20, strokeWidth = 1.75 }) {
    const map = {
        Products: _jsx(Package, { size: size, strokeWidth: strokeWidth }),
        Services: _jsx(Wrench, { size: size, strokeWidth: strokeWidth }),
        Gallery: _jsx(Images, { size: size, strokeWidth: strokeWidth }),
        Home: _jsx(HomeIcon, { size: size, strokeWidth: strokeWidth }),
        Contact: _jsx(MessageCircle, { size: size, strokeWidth: strokeWidth }),
        'Track Order': _jsx(PackageCheck, { size: size, strokeWidth: strokeWidth }),
    };
    return _jsx(_Fragment, { children: map[name] });
}
