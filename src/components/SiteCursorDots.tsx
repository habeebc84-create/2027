import { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  phase: number;
  speed: number;
  depth: number;
  color: [number, number, number];
}

const COLORS: [number, number, number][] = [
  [198, 168, 117], // champagne
  [198, 168, 117],
  [247, 245, 240], // ivory
  [194, 193, 189], // silver
];

function rgba([r, g, b]: [number, number, number], a: number) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Site-wide decorative dot field. The canvas is fixed over the viewport,
 * never captures pointer events, and gently shifts/glows as the cursor moves.
 * Reduced-motion users get a static field instead of continuous animation.
 */
export default function SiteCursorDots() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let raf: number | null = null;
    let last = performance.now();
    let swayX = 0;
    let swayY = 0;
    let targetSwayX = 0;
    let targetSwayY = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;

    const spawn = (): Dot => {
      const large = Math.random() < 0.08;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        r: large ? 1.8 + Math.random() * 1.1 : 0.55 + Math.random() * 1.25,
        alpha: 0.2 + Math.random() * 0.42,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1,
        depth: 0.35 + Math.random() * 0.85,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      if (pointer.active && !reducedMotion) {
        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 180);
        glow.addColorStop(0, 'rgba(198, 168, 117, 0.10)');
        glow.addColorStop(0.55, 'rgba(198, 168, 117, 0.035)');
        glow.addColorStop(1, 'rgba(198, 168, 117, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(pointer.x - 180, pointer.y - 180, 360, 360);
      }

      for (const d of dots) {
        const twinkle = 0.64 + 0.36 * Math.sin(time * d.speed + d.phase);
        let alpha = d.alpha * twinkle;
        let radius = d.r;
        let x = d.x + swayX * d.depth;
        let y = d.y + swayY * d.depth;

        if (pointer.active && !reducedMotion) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 175) {
            const boost = 1 - dist / 175;
            // Nearby dots lean toward the moving cursor and brighten.
            x -= dx * boost * 0.16;
            y -= dy * boost * 0.16;
            alpha = Math.min(0.9, alpha + boost * 0.5);
            radius = d.r * (1 + boost * 1.5);
          }
        }

        const glowRadius = radius * 4.8;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        grad.addColorStop(0, rgba(d.color, alpha * 0.45));
        grad.addColorStop(0.4, rgba(d.color, alpha * 0.14));
        grad.addColorStop(1, rgba(d.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = rgba(d.color, alpha);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(180, Math.max(70, Math.floor((width * height) / 9000)));
      dots = Array.from({ length: count }, spawn);
      if (reducedMotion) render(0);
    };

    const step = (dt: number) => {
      const ease = Math.min(1, dt * 4.5);
      swayX += (targetSwayX - swayX) * ease;
      swayY += (targetSwayY - swayY) * ease;
      for (const d of dots) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x < -30) d.x = width + 30;
        if (d.x > width + 30) d.x = -30;
        if (d.y < -30) d.y = height + 30;
        if (d.y > height + 30) d.y = -30;
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      step(dt);
      render(now / 1000);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      if (reducedMotion) {
        raf = null;
        render(0);
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.active = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      targetSwayX = (e.clientX / Math.max(1, width) - 0.5) * 30;
      targetSwayY = (e.clientY / Math.max(1, height) - 0.5) * 22;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      targetSwayX = 0;
      targetSwayY = 0;
    };

    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      start();
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
      } else {
        start();
      }
    };

    resize();
    start();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    window.addEventListener('blur', onPointerLeave);
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <div className="site-cursor-dots" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
