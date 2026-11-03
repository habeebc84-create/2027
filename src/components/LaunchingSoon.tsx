import { useEffect, useState } from 'react';
import { LAUNCH_DATE, getLaunchRemaining } from '../lib/launch';

/**
 * Full-page launching-soon poster. It covers the whole viewport and
 * renders NO links, nav, cart or page content for visitors — nothing
 * behind it can be opened. Only a signed-in admin sees a button, and
 * that button removes the poster for every device (via the cloud flag).
 * When the countdown reaches zero the poster removes itself.
 */
export default function LaunchingSoon({ isAdmin, onRemove }: { isAdmin: boolean; onRemove: () => void }) {
  const [remaining, setRemaining] = useState(() => getLaunchRemaining());
  useEffect(() => {
    const iv = setInterval(() => setRemaining(getLaunchRemaining()), 1000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    if (remaining.totalMs <= 0) onRemove();
    // Only when the countdown actually hits zero; onRemove is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining.totalMs <= 0]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const boxes = [
    { value: String(remaining.days).padStart(2, '0'), label: 'Days' },
    { value: pad(remaining.hours), label: 'Hours' },
    { value: pad(remaining.minutes), label: 'Minutes' },
    { value: pad(remaining.seconds), label: 'Seconds' },
  ];

  return (
    <div
      data-launching-soon
      className="fixed inset-0 z-[400] overflow-y-auto bg-obsidian text-ivory"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(198,168,117,0.22) 0%, transparent 55%), linear-gradient(180deg, #0B0D0F 0%, #14171A 55%, #0B0D0F 100%)',
      }}
    >
      <div className="min-h-full flex flex-col items-center justify-center text-center px-5 py-10">
        <img src="/windows-h-logo.png" alt="HSN logo" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-brand-500/60 mb-6" />
        <p className="text-brand-400 font-bold tracking-[0.35em] text-xs sm:text-sm mb-4">HSN CEMENT AND STEEL</p>
        <h1 className="font-extrabold leading-none text-[clamp(3rem,14vw,9rem)] tracking-tight">
          LAUNCHING
          <span className="block text-brand-400">SOON</span>
        </h1>
        <p className="mt-5 text-silver text-sm sm:text-base max-w-md">
          Our website is launching soon. Premium cement, steel and roofing —
          opening for orders on Monday, 23 November 2026.
        </p>

        <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-lg" role="timer" aria-label="Countdown to launch">
          {boxes.map(b => (
            <div key={b.label} className="bg-charcoal/70 border border-gunmetal rounded-3xl px-2 py-4 sm:py-5">
              <div className="font-extrabold text-2xl sm:text-4xl text-ivory tabular-nums">{b.value}</div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-silver uppercase mt-1">{b.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-silver">
          Launch date: {LAUNCH_DATE.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="mt-1 text-xs text-silver">Kalikiri, Andhra Pradesh</p>

        {isAdmin && (
          <div className="mt-10 bg-brand-500/10 border border-brand-500/30 rounded-3xl p-5 max-w-md w-full">
            <p className="text-xs font-bold text-brand-300 mb-3">You are signed in as admin — only you see this button.</p>
            <button
              type="button"
              onClick={onRemove}
              className="w-full bg-brand-500 text-obsidian font-extrabold px-6 py-3.5 rounded-2xl hover:brightness-110 transition"
            >
              Remove this poster — open the website
            </button>
            <p className="text-[11px] text-silver mt-3">Removing it opens the site for everyone. You can turn it back on in Admin → Security &amp; Settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
