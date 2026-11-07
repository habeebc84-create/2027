/**
 * Launching-soon gate: the site is announced as launching 20 days after
 * 3 Nov 2026, i.e. Monday 23 Nov 2026 — but the admin can change the
 * opening date and time from Admin > Security & Settings (stored as an
 * ISO string with an IST offset, e.g. 2026-11-23T00:00:00+05:30). The
 * poster counts down live to that moment; once it is reached the gate
 * switches itself off, and the admin can switch it off earlier.
 */
export const DEFAULT_LAUNCH_DATE_TIME = '2026-11-23T00:00:00+05:30';
export function parseLaunchTime(value) {
    const parsed = value ? Date.parse(value) : NaN;
    return Number.isFinite(parsed) ? parsed : Date.parse(DEFAULT_LAUNCH_DATE_TIME);
}
export function getLaunchRemaining(launchTime, now = Date.now()) {
    const totalMs = Math.max(0, launchTime - now);
    const totalSeconds = Math.floor(totalMs / 1000);
    return {
        totalMs,
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    };
}
export function isLaunchPending(launchTime, now = Date.now()) {
    return now < launchTime;
}
/** Split an ISO launch string into date/time inputs (IST offset kept as-is). */
export function splitLaunchDateTime(value) {
    return { date: value.slice(0, 10), time: value.slice(11, 16) };
}
export function joinLaunchDateTime(date, time) {
    return `${date}T${time || '00:00'}:00+05:30`;
}
