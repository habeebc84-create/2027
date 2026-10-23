import { motion, useReducedMotion } from 'framer-motion';
import { Package, Wrench, Images, Info, MessageCircle, PackageCheck } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import { useApp } from '../context/AppContext';
import type { Page } from '../types';

interface NavItem {
  label: string;
  page: Page;
}

const navItems: NavItem[] = [
  { label: 'Products', page: 'products' },
  { label: 'Services', page: 'services' },
  { label: 'Gallery', page: 'gallery' },
  { label: 'About Us', page: 'about' },
  { label: 'Contact', page: 'contact' },
  { label: 'Track Order', page: 'order-tracking' },
];

const MotionNavItem = motion.button;

interface FloatingBottomNavProps {
  show?: boolean;
}

interface FloatingBottomNavProps {
  visible: boolean;
}

export default function FloatingBottomNav({ visible }: FloatingBottomNavProps) {
  const { currentPage, setPage } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;
  const duration = shouldReduceMotion ? 0 : 0.24;

  return (
    <motion.nav
      style={{
        position: 'fixed',
        bottom: 'env(safe-area-inset-bottom, 24px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        padding: '12px 16px 18px',
        maxWidth: 'calc(100% - 24px)',
        width: 'auto',
        margin: '0 auto',
      }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      aria-label="Primary navigation"
    >
      {/* Liquid glass bar — translucent white glass, no color tint */}
      <motion.div
        className="relative w-full rounded-full px-2 py-1.5 border border-white/20 shadow-[0_24px_56px_-26px_rgba(0,0,0,0.7),0_10px_22px_-12px_rgba(0,0,0,0.5)]"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.75),
             inset 0 -1px 0 rgba(0,0,0,0.2),
             inset 0 3px 8px rgba(255,255,255,0.18),
             0 24px 56px -26px rgba(0,0,0,0.7),
             0 10px 22px -12px rgba(0,0,0,0.5)',
        }}
        layout
        transition={{ duration, ease: 'easeInOut' }}
      >        {/* Top liquid-glass highlight — bright white refraction */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-1.5px',
            borderRadius: '9999px',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.55) 24%, rgba(255,255,255,0) 72%)',
            pointerEvents: 'none',
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1.4px',
          }}
        />

        {/* Liquid glass bead, sitting right on the bottom edge */}
        <LiquidGlass className="absolute left-0 right-0 bottom-full mb-1.5 mx-auto w-5/6 sm:w-2/3 pointer-events-none" />

        <div className="flex items-center justify-between gap-1 sm:gap-3">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;

            return (
              <motion.div
                key={item.page}
                className="flex items-center justify-center shrink-0"
                layout
                transition={{ duration, ease: 'easeInOut' }}
              >
                <MotionNavItem
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  onClick={() => setPage(item.page)}
                  className="relative flex flex-col items-center justify-center gap-0.5 rounded-full px-1.5 py-1.5 min-w-[56px] sm:min-w-[64px] leading-none group"
                  style={{
                    height: 42,
                    background:
                      isActive
                        ? 'linear-gradient(165deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0.15) 100%)'
                        : 'rgba(255,255,255,0.06)',
                    backdropFilter: isActive ? 'blur(12px) saturate(180%)' : 'blur(6px) saturate(150%)',
                    WebkitBackdropFilter: isActive ? 'blur(12px) saturate(180%)' : 'blur(6px) saturate(150%)',
                    boxShadow:
                      isActive
                        ? 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 0 rgba(255,255,255,0.3), 0 10px 22px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.28)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.2), 0 6px 14px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                  whileHover={animate ? { y: -2, scale: 1.01 } : undefined}
                  whileTap={animate ? { scale: 0.96 } : undefined}
                  transition={{ duration, ease: 'easeOut' }}
                >
                  {/* Active underline pill — liquid glass highlight */}
                  <motion.span
                    layoutId="activeNavPill"
                    className="absolute left-3 right-3 bottom-1 h-1 rounded-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0.32)',
                    }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />

                  {/* Icon */}
                  <span className="relative flex items-center justify-center">
                    <span
                      className="block w-4 h-4 sm:w-[18px] sm:h-[18px] transition-colors duration-200"
                      style={{
                        color: isActive ? undefined : 'rgba(255,255,255,0.85)',
                      }}
                    >
                      <SvgIcon name={item.label} size={18} />
                    </span>
                  </span>

                  {/* Label */}
                  <span
                    className="text-[9px] sm:text-[10px] font-medium tracking-tight text-white select-none whitespace-nowrap leading-none"
                    style={{
                      opacity: isActive ? 1 : 0.78,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    {item.label}
                  </span>
                </MotionNavItem>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.nav>
  );
}

function SvgIcon({ name, size = 20, strokeWidth = 1.75 }: { name: string; size?: number; strokeWidth?: number }) {
  const map: Record<string, React.ReactNode> = {
    Products: <Package size={size} strokeWidth={strokeWidth} />,
    Services: <Wrench size={size} strokeWidth={strokeWidth} />,
    Gallery: <Images size={size} strokeWidth={strokeWidth} />,
    'About Us': <Info size={size} strokeWidth={strokeWidth} />,
    Contact: <MessageCircle size={size} strokeWidth={strokeWidth} />,
    'Track Order': <PackageCheck size={size} strokeWidth={strokeWidth} />,
  };

  return <>{map[name]}</>;
}
