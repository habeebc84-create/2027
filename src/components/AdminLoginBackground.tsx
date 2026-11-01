import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  phase: number;
  speed: number;
  color: [number, number, number];
}

const COLORS: [number, number, number][] = [
  [198, 168, 117], // champagne
  [198, 168, 117],
  [198, 168, 117],
  [247, 245, 240], // ivory
  [194, 193, 189], // silver
];

function rgba([r, g, b]: [number, number, number], a: number) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Decorative admin-login background: small drifting lights/dots that glow
 * softly near the pointer. Purely visual, pointer-events disabled, and it
 * falls back to a static field when the user prefers reduced motion.
 */
export default function AdminLoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf: number | null = null;
    let last = performance.now();
    const pointer = { x: -9999, y: -9999, active: false };
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;

    const spawn = (): Particle => {
      const large = Math.random() < 0.1;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        r: large ? 2.2 + Math.random() * 1.4 : 0.7 + Math.random() * 1.5,
        alpha: 0.28 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.max(42, Math.floor((width * height) / 15000)));
      particles = Array.from({ length: count }, spawn);
      if (reducedMotion) render(performance.now() / 1000);
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      if (pointer.active && !reducedMotion) {
        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 190);
        glow.addColorStop(0, 'rgba(198, 168, 117, 0.12)');
        glow.addColorStop(0.55, 'rgba(198, 168, 117, 0.045)');
        glow.addColorStop(1, 'rgba(198, 168, 117, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(pointer.x - 190, pointer.y - 190, 380, 380);
      }

      for (const p of particles) {
        const twinkle = 0.62 + 0.38 * Math.sin(time * p.speed + p.phase);
        let alpha = p.alpha * twinkle;
        let radius = p.r;

        if (pointer.active && !reducedMotion) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 170) {
            const boost = 1 - dist / 170;
            alpha = Math.min(1, alpha + boost * 0.55);
            radius = p.r * (1 + boost * 1.7);
          }
        }

        const glowRadius = radius * 5.5;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, rgba(p.color, alpha * 0.5));
        grad.addColorStop(0.35, rgba(p.color, alpha * 0.16));
        grad.addColorStop(1, rgba(p.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = rgba(p.color, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (dt: number) => {
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -24) p.x = width + 24;
        if (p.x > width + 24) p.x = -24;
        if (p.y < -24) p.y = height + 24;
        if (p.y > height + 24) p.y = -24;
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
        render(performance.now() / 1000);
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.active = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.x = x;
      pointer.y = y;
      if (reducedMotion) render(performance.now() / 1000);
    };

    const onPointerLeave = () => {
      pointer.active = false;
      if (reducedMotion) render(performance.now() / 1000);
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
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <div className="admin-login-bg" aria-hidden="true">
      <div className="admin-login-orb admin-login-orb-a" />
      <div className="admin-login-orb admin-login-orb-b" />
      <div className="admin-login-orb admin-login-orb-c" />
      <canvas ref={canvasRef} className="admin-login-canvas" />
      <div className="admin-login-vignette" />
    </div>
  );
}
