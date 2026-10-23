import { useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface LiquidGlassProps {
  className?: string;
}

export function LiquidGlass({ className = '' }: LiquidGlassProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
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
          'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.1) 52%, rgba(255,255,255,0) 100%)',
        WebkitBackdropFilter: 'blur(20px) saturate(220%)',
        WebkitMask:
          'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        padding: '1px',
        opacity: 0.98,
      }}
    >
      {/* Soft liquid body */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '9999px',
          background:
            'radial-gradient(95% 75% at 42% 45%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0) 70%)',
          opacity: 0.92,
          animation: shouldReduceMotion
            ? ''
            : 'liquidDrift 5.5s ease-in-out infinite alternate',
        }}
      />
      {/* Sharp specular highlight */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '24%',
          top: '16%',
          width: 6,
          height: 2.5,
          borderRadius: '9999px',
          background: 'rgba(255,255,255,0.98)',
          boxShadow: '0 0 12px 4px rgba(255,255,255,0.98)',
          animation: shouldReduceMotion
            ? ''
            : 'liquidShine 4s ease-in-out infinite alternate',
        }}
      />
    </span>
  );
}
