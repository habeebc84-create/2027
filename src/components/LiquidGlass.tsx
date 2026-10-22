import { useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface LiquidGlassProps {
  className?: string;
}

export function LiquidGlass({ className = '' }: LiquidGlassProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(!shouldReduceMotion);

  useEffect(() => {
    if (!shouldReduceMotion) {
      const timer = setTimeout(() => setVisible(true), 60);
      return () => clearTimeout(timer);
    }
  }, [shouldReduceMotion]);

  if (!visible) return null;

  return (
    <span
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        display: 'block',
        height: 10,
        overflow: 'hidden',
        borderRadius: '9999px',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.05) 55%, rgba(255,255,255,0) 100%)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 30px -16px rgba(0,0,0,0.45)',
        WebkitMask:
          'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        padding: '1px',
        opacity: 0.95,
      }}
    >
      {/* Shifting refraction highlight */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '9999px',
          background:
            'radial-gradient(90% 60% at 35% 40%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%)',
          opacity: 0.85,
          animation: shouldReduceMotion
            ? ''
            : 'liquidDrift 7s ease-in-out infinite alternate',
        }}
      />
      {/* Tiny specular hotspot */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '18%',
          top: '14%',
          width: 6,
          height: 3,
          borderRadius: '9999px',
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 0 8px 2px rgba(255,255,255,0.9)',
          animation: shouldReduceMotion
            ? ''
            : 'liquidShine 5s ease-in-out infinite alternate',
        }}
      />
    </span>
  );
}
