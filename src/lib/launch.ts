/**
 * Launching-soon gate: the site is announced as launching 20 days after
 * 3 Nov 2026, i.e. Monday 23 Nov 2026. The poster counts down live to
 * midnight IST on that day; once it is reached the gate switches itself
 * off, and the admin can switch it off earlier from the poster itself
 * (when signed in) or from Admin > Security & Settings.
 */
export const LAUNCH_DATE = new Date('2026-11-23T00:00:00+05:30');

export interface LaunchRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getLaunchRemaining(now = Date.now()): LaunchRemaining {
  const totalMs = Math.max(0, LAUNCH_DATE.getTime() - now);
  const totalSeconds = Math.floor(totalMs / 1000);
  return {
    totalMs,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function isLaunchPending(now = Date.now()): boolean {
  return now < LAUNCH_DATE.getTime();
}
