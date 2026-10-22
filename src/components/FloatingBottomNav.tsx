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

export default function FloatingBottomNav({ show = true }: FloatingBottomNavProps) {
  const { currentPage, setPage } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;
  const duration = shouldReduceMotion ? 0 : 0.28;

  return (
    <motion.nav
      style={{
        position: 'fixed',
        bottom: 'env(safe-area-inset-bottom, 20px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        padding: '14px 20px 22px',
        maxWidth: 'calc(100% - 32px)',
        width: 'auto',
        margin: '0 auto',
      }}
      initial={false}
      animate={show && { opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: 'easeOut' }}
      aria-label="Primary navigation"
    >
      {/* Glass capsule */}
      <motion.div
        className="relative w-full rounded-full px-2 py-2 shadow-[0_20px_55px_-13px_rgba(0,0,0,0.4),0_8px_18px_-10px_rgba(0,0,0,0.3)] border border-white/30"
        style={{
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.06)',
        }}
        layout
        transition={{ duration, ease: 'easeInOut' }}
      >
        {/* Subtle reflection */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-1px',
            borderRadius: '9999px',
            background:
              'linear-gradient(175deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 52%, rgba(0,0,0,0.02) 100%)',
            pointerEvents: 'none',
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />

        {/* Liquid glass bead, seated just below the main bar */}
        <LiquidGlass className="absolute left-0 right-0 bottom-full mb-1 mx-auto w-3/4 sm:w-1/2 pointer-events-none" />

        <div className="flex items-center justify-between gap-2 sm:gap-4">
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
                  className="relative flex flex-col items-center justify-center gap-0.5 rounded-full px-2 py-2 min-w-[62px] sm:min-w-[70px] leading-none group"
                  style={{
                    height: 50,
                  }}
                  whileHover={animate ? { y: -2.5, scale: 1.02 } : undefined}
                  whileTap={animate ? { scale: 0.96 } : undefined}
                  transition={{ duration, ease: 'easeOut' }}
                >
                  {/* Active underline pill */}
                  <motion.span
                    layoutId="activeNavPill"
                    className="absolute left-3 right-3 bottom-1 h-1 rounded-full bg-black/60"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0.3)',
                    }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  />

                  {/* Icon */}
                  <span className="relative flex items-center justify-center">
                    <span
                      className={`block w-5 h-5 sm:w-[20px] sm:h-[20px] transition-colors duration-200`}
                      style={{
                        color: isActive ? undefined : 'rgba(0,0,0,0.45)',
                      }}
                    >
                      <SvgIcon name={item.label} size={20} />
                    </span>
                  </span>

                  {/* Label */}
                  <span
                    className="text-[10px] sm:text-[11px] font-medium tracking-tight text-neutral-900 select-none whitespace-nowrap"
                    style={{
                      opacity: isActive ? 1 : 0.45,
                      transition: 'opacity 0.2s ease',
                      transform: 'translateY(0)',
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
