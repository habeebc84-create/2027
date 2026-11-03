import { useEffect, useState } from 'react';
import KineticGrid from './originkit/ui/kineticgrid';
import { getLaunchRemaining, parseLaunchTime } from '../lib/launch';

/**
 * Full-page launching-soon poster. It covers the whole viewport and
 * renders NO links, nav, cart or page content for visitors — nothing
 * behind it can be opened. The Originkit Kinetic Grid (added verbatim
 * via the Originkit CLI, src/components/originkit/ui/kineticgrid.tsx)
 * runs behind the poster content, its dots pulled toward the cursor.
 * Only a signed-in admin sees a button, and that button removes the
 * poster for every device (via the cloud flag). When the countdown
 * reaches zero the poster removes itself.
 */
export default function LaunchingSoon({ isAdmin, onRemove, launchDateTime }: { isAdmin: boolean; onRemove: () => void; launchDateTime: string }) {
  const launchTime = parseLaunchTime(launchDateTime);
  const [remaining, setRemaining] = useState(() => getLaunchRemaining(launchTime));
  useEffect(() => {
    setRemaining(getLaunchRemaining(launchTime));
    const iv = setInterval(() => setRemaining(getLaunchRemaining(launchTime)), 1000);
    return () => clearInterval(iv);
  }, [launchTime]);
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
  const launchDate = new Date(launchTime);

  return (
    <div
      data-launching-soon
      className="fixed inset-0 z-[400] overflow-y-auto bg-obsidian text-ivory"
    >
      {/* Kinetic Grid backside: full-screen, behind the poster content. */}
      <div className="absolute inset-0" data-kinetic-grid>
        <KineticGrid
          background="transparent"
          dotColor="#F7F5F0"
          lineColor="#C6A875"
          trailColor="#C6A875"
          spacing={36}
          radius={260}
          strength={5}
          trail
        />
      </div>
      <div className="absolute inset-0 bg-obsidian/55 pointer-events-none" />
      <div className="relative z-10 min-h-full flex flex-col items-center justify-center text-center px-5 py-10 pointer-events-none">
        <img src="/windows-h-logo.png" alt="HSN logo" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-brand-500/60 mb-6" />
        <p className="text-brand-400 font-bold tracking-[0.35em] text-xs sm:text-sm mb-4">HSN CEMENT AND STEEL</p>
        <h1 className="font-extrabold leading-none text-[clamp(3rem,14vw,9rem)] tracking-tight">
          LAUNCHING
          <span className="block text-brand-400">SOON</span>
        </h1>
        <p className="mt-5 text-silver text-sm sm:text-base max-w-md">
          Our website is launching soon. Premium cement, steel and roofing —
          opening for orders on {launchDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>

        <div className="launch-clock mt-8 grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-lg" role="timer" aria-label="Countdown to launch">
          {boxes.map(b => (
            <div key={b.label} className="bg-charcoal/70 border border-gunmetal rounded-3xl px-2 py-4 sm:py-5">
              <div key={b.value} className="launch-digit font-extrabold text-2xl sm:text-4xl text-ivory tabular-nums">{b.value}</div>
              <div className="text-[10px] sm:text-xs font-bold tracking-widest text-silver uppercase mt-1">{b.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-silver">
          Launch: {launchDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {launchDate.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
        </p>
        <p className="mt-1 text-xs text-silver">Kalikiri, Andhra Pradesh</p>

        {isAdmin && (
          <div className="mt-10 bg-brand-500/10 border border-brand-500/30 rounded-3xl p-5 max-w-md w-full pointer-events-auto">
            <p className="text-xs font-bold text-brand-300 mb-3">You are signed in as admin — only you see this button.</p>
            <button
              type="button"
              onClick={onRemove}
              className="w-full bg-brand-500 text-obsidian font-extrabold px-6 py-3.5 rounded-2xl hover:brightness-110 transition"
            >
              Remove this poster — open the website
            </button>
            <p className="text-[11px] text-silver mt-3">Removing it opens the site for everyone. You can change the opening date/time and turn it back on in Admin → Security &amp; Settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
