import { motion, useReducedMotion } from 'framer-motion';
import { Package, Wrench, Images, Info, MessageCircle, PackageCheck } from 'lucide-react';
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
  const animate = shouldReduceMotion ? false : true;
  const duration = shouldReduceMotion ? 0 : 0.28;

  return (
    <motion.nav
      style={{
        position: 'fixed',
        bottom: 'env(safe-area-inset-bottom, 20px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        padding: '12px 16px 20px',
        maxWidth: 'calc(100% - 32px)',
        width: 'auto',
        margin: '0 auto',
      }}
      initial={false}
      animate={show && { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-label="Primary navigation"
    >
      {/* Glass capsule */}
      <motion.div
        className="relative w-full rounded-full px-2 py-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35),0_6px_14px_-8px_rgba(0,0,0,0.25)] border border-white/30"
        style={{
          background: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06)',
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
              'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.02) 100%)',
            pointerEvents: 'none',
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />

        <div className="flex items-center justify-center gap-1 sm:gap-2">
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
                  className="relative flex flex-col items-center justify-center gap-0.5 rounded-full px-3 py-2 min-w-[64px] sm:min-w-[72px] leading-none group"
                  style={{
                    height: 48,
                  }}
                  whileHover={animate ? { y: -3, scale: 1.02 } : undefined}
                  whileTap={animate ? { scale: 0.96 } : undefined}
                  transition={{ duration, ease: 'easeOut' }}
                >
                  {/* Active overlay icon: sits above the text icon and fades in/out instead of clipping */}
                  {isActive && (
                    <motion.span
                      key="active-icon"
                      className="absolute inset-0 flex items-center justify-center"
                      aria-hidden="true"
                      initial={{ opacity: 0, scale: 0.92, y: 1.5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -1.5 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <span className="text-neutral-900">
                        <SvgIcon name={item.label} size={20} />
                      </span>
                    </motion.span>
                  )}

                  {/* Active underline pill */}
                  <motion.span
                    layoutId="activeNavPill"
                    className="absolute inset-x-3 bottom-1 h-1 rounded-full bg-black/60"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0.3)',
                    }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  />

                  {/* Icon */}
                  <span className="relative flex items-center justify-center">
                    <span className="block w-5 h-5 sm:w-[20px] sm:h-[20px] text-neutral-900">
                      <SvgIcon name={item.label} size={20} />
                    </span>
                  </span>

                  {/* Label */}
                  <span
                    className="text-[10px] sm:text-[11px] font-medium tracking-tight text-neutral-900 select-none overflow-hidden whitespace-nowrap"
                    style={{
                      opacity: isActive ? 1 : 0.45,
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
