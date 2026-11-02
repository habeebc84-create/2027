import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Home as HomeIcon, Package, Wrench, Images, MessageCircle, PackageCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Page } from '../types';

type DockPage = Extract<Page, 'home' | 'products' | 'services' | 'gallery' | 'contact' | 'order-tracking'>;

interface NavItem {
  label: string;
  short?: string;
  page: DockPage;
}

const navItems: NavItem[] = [
  { label: 'Home', page: 'home' },
  { label: 'Products', page: 'products' },
  { label: 'Services', page: 'services' },
  { label: 'Gallery', page: 'gallery' },
  { label: 'Contact', page: 'contact' },
  { label: 'Track Order', short: 'Track', page: 'order-tracking' },
];

// Each destination gets its own small icon gesture. The active icon repeats
// gently after a long pause; inactive icons respond to hover/tap.
const iconAnimations: Record<DockPage, { y?: number[]; rotate?: number[]; scale?: number[] }> = {
  home: { y: [0, -3, 0], scale: [1, 1.08, 1] },
  products: { y: [0, -2, 0], rotate: [0, -8, 6, 0] },
  services: { rotate: [0, -18, 10, 0] },
  gallery: { rotate: [0, -6, 4, 0], scale: [1, 1.08, 1] },
  contact: { scale: [1, 1.12, 0.98, 1], rotate: [0, -5, 3, 0] },
  'order-tracking': { y: [0, -3, 0], scale: [1, 1.06, 1] },
};

// The shared highlight morphs its corners as it travels between sections.
const activeRadii: Record<DockPage, number> = {
  home: 28,
  products: 18,
  services: 24,
  gallery: 14,
  contact: 28,
  'order-tracking': 20,
};

interface FloatingBottomNavProps {
  visible: boolean;
}

// Apple-style bottom bar (iOS liquid-glass dock): a floating capsule of
// Charcoal Steel glass with a Gunmetal edge. The selected item carries
// a Burnished Champagne pill with Obsidian ink; inactive items use
// Silver Mist so the dock stays readable over photos.
export default function FloatingBottomNav({ visible }: FloatingBottomNavProps) {
  const { currentPage, setPage } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;
  const [activation, setActivation] = useState<{ page: Page; count: number }>({ page: currentPage, count: 0 });

  const handleNavigate = (page: DockPage) => {
    // Re-tapping the current section replays its icon gesture too.
    setActivation((prev) => ({ page, count: prev.count + 1 }));
    setPage(page);
  };

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
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: animate ? 12 : 0 }}
      transition={{ duration: animate ? 0.32 : 0, ease: 'easeOut' }}
      aria-label="Primary navigation"
      aria-hidden={!visible}
      inert={!visible}
    >
      <div
        className="relative rounded-full w-[calc(100vw-16px)] sm:w-auto p-1.5 border border-gunmetal"
        style={{
          pointerEvents: visible ? 'auto' : 'none',
          maxWidth: 'calc(100vw - 16px)',
          background:
            'linear-gradient(180deg, rgba(26,29,33,0.44) 0%, rgba(26,29,33,0.34) 55%, rgba(26,29,33,0.28) 100%)',
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
          {navItems.map((item, index) => {
            const isActive = currentPage === item.page;
            const activationKey = isActive && activation.page === item.page ? activation.count : 0;

            return (
              <motion.button
                key={item.page}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                onClick={() => handleNavigate(item.page)}
                className="relative flex-1 sm:flex-none flex flex-col items-center justify-center gap-1 rounded-full px-0 sm:px-2.5 py-2 min-w-0 sm:min-w-[64px] h-[56px] leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
                initial={animate ? { opacity: 0, y: 10, scale: 0.9 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                variants={{ pressed: { scale: 0.94, transition: { duration: 0.12, delay: 0 } } }}
                whileHover={animate ? { y: -1.5, transition: { duration: 0.15, delay: 0 } } : undefined}
                whileTap={animate ? 'pressed' : undefined}
                transition={{ duration: animate ? 0.28 : 0, delay: animate ? index * 0.04 : 0, ease: 'easeOut' }}
              >
                {/* Selected item: one champagne pill that slides between
                    items and morphs its corner shape for each section. */}
                {isActive && (
                  <motion.span
                    layoutId="appleDockPill"
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background: 'var(--color-champagne)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 18px -8px rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(10px) saturate(140%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(140%)',
                    }}
                    initial={false}
                    animate={{ borderRadius: activeRadii[item.page] }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : {
                            type: 'spring',
                            stiffness: 520,
                            damping: 34,
                            mass: 0.7,
                            borderRadius: { duration: 0.35, ease: 'easeOut' },
                          }
                    }
                  />
                )}

                {/* Icon: outer layer handles tap compression; inner layer
                    plays the destination-specific gesture. */}
                <motion.span
                  className="relative flex items-center justify-center"
                  style={{ color: isActive ? 'var(--color-obsidian)' : 'var(--color-silver)' }}
                  variants={{ pressed: { scale: 0.88, rotate: item.page === 'services' ? -12 : 0 } }}
                  transition={{ duration: 0.12 }}
                >
                  <motion.span
                    key={`${item.page}-${isActive ? 'active' : 'idle'}-${activationKey}`}
                    className="flex items-center justify-center"
                    animate={isActive && animate ? iconAnimations[item.page] : undefined}
                    transition={
                      isActive && animate
                        ? { duration: 0.7, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.5 }
                        : { duration: 0 }
                    }
                  >
                    <SvgIcon name={item.label} size={22} />
                  </motion.span>
                </motion.span>

                {/* Label */}
                <span
                  className={`relative text-[11px] sm:text-[10px] font-medium tracking-tight select-none whitespace-nowrap leading-none ${isActive ? 'text-obsidian' : 'text-silver'}`}
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
