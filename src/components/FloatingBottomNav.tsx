import { motion, useReducedMotion } from 'framer-motion';
import { Home as HomeIcon, Package, Wrench, Images, MessageCircle, PackageCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Page } from '../types';

interface NavItem {
  label: string;
  short?: string;
  page: Page;
}

const navItems: NavItem[] = [
  { label: 'Home', page: 'home' },
  { label: 'Products', page: 'products' },
  { label: 'Services', page: 'services' },
  { label: 'Gallery', page: 'gallery' },
  { label: 'Contact', page: 'contact' },
  { label: 'Track Order', short: 'Track', page: 'order-tracking' },
];

interface FloatingBottomNavProps {
  visible: boolean;
}

// Apple-style bottom bar (iOS liquid-glass dock): a floating capsule of
// CLEAR neutral glass — no white fill and no warm/brown tint anywhere.
// The glass is a cool charcoal (blue >= red, so it can never read brown),
// heavily blurred with restrained saturation so the colours of photos
// behind it do not bleed through and tint the bar. Only the selected
// item carries a glass pill; every other item sits directly on the glass.
export default function FloatingBottomNav({ visible }: FloatingBottomNavProps) {
  const { currentPage, setPage } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;

  return (
    // Centring: the nav stretches across the full width and centres the
    // bar with flexbox, so the bar always sits exactly in the middle of
    // the website. It deliberately does NOT use left:50% + translateX:
    // framer-motion rebuilds the transform for the hide/show y animation
    // and drops a hand-written translateX(-50%), which left the bar
    // off-centre. pointerEvents are disabled on the wrapper and enabled
    // on the bar itself, so the page stays clickable around the bar.
    <motion.nav
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 60,
        pointerEvents: 'none',
      }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      aria-label="Primary navigation"
    >
      <div
        className="relative rounded-full p-1 sm:p-1.5 border border-white/10"
        style={{
          pointerEvents: 'auto',
          maxWidth: 'calc(100vw - 16px)',
          background:
            'linear-gradient(180deg, rgba(16,21,33,0.44) 0%, rgba(16,21,33,0.34) 55%, rgba(16,21,33,0.28) 100%)',
          backdropFilter: 'blur(28px) saturate(135%)',
          WebkitBackdropFilter: 'blur(28px) saturate(135%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.30), 0 24px 48px -20px rgba(0,0,0,0.65), 0 10px 24px -12px rgba(0,0,0,0.45)',
        }}
      >
        {/* Specular edge — the thin light line along the top of the glass,
            like light refracting on the rim of an Apple bar. It is an edge
            highlight only; the bar itself has no white fill. */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-1px',
            borderRadius: '9999px',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.07) 24%, rgba(255,255,255,0) 55%)',
            pointerEvents: 'none',
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />

        <div className="relative flex items-center gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;

            return (
              <motion.button
                key={item.page}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                onClick={() => setPage(item.page)}
                className="relative flex-1 sm:flex-none flex flex-col items-center justify-center gap-1 rounded-full px-1 sm:px-2.5 py-2 min-w-0 sm:min-w-[64px] h-[52px] sm:h-[56px] leading-none"
                whileHover={animate ? { y: -1.5 } : undefined}
                whileTap={animate ? { scale: 0.94 } : undefined}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {/* Selected item: one clear-glass pill that slides between
                    items, Apple-style. No white paint — just lighter glass,
                    a hairline ring and a soft shadow. */}
                {isActive && (
                  <motion.span
                    layoutId="appleDockPill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.07) 100%)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 0 0 1px rgba(255,255,255,0.13), 0 8px 18px -8px rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(10px) saturate(140%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(140%)',
                    }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 }
                    }
                  />
                )}

                {/* Icon */}
                <span
                  className="relative flex items-center justify-center transition-opacity duration-200"
                  style={{
                    color: '#ffffff',
                    opacity: isActive ? 1 : 0.62,
                  }}
                >
                  <SvgIcon name={item.label} size={22} />
                </span>

                {/* Label */}
                <span
                  className="relative text-[10px] font-medium tracking-tight text-white select-none whitespace-nowrap leading-none transition-opacity duration-200"
                  style={{ opacity: isActive ? 1 : 0.62 }}
                >
                  <span className="sm:hidden">{item.short ?? item.label}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

function SvgIcon({ name, size = 20, strokeWidth = 1.75 }: { name: string; size?: number; strokeWidth?: number }) {
  const map: Record<string, React.ReactNode> = {
    Products: <Package size={size} strokeWidth={strokeWidth} />,
    Services: <Wrench size={size} strokeWidth={strokeWidth} />,
    Gallery: <Images size={size} strokeWidth={strokeWidth} />,
    Home: <HomeIcon size={size} strokeWidth={strokeWidth} />,
    Contact: <MessageCircle size={size} strokeWidth={strokeWidth} />,
    'Track Order': <PackageCheck size={size} strokeWidth={strokeWidth} />,
  };

  return <>{map[name]}</>;
}
