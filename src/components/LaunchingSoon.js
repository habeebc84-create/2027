import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export default function LaunchingSoon({ isAdmin, onRemove, launchDateTime }) {
    const launchTime = parseLaunchTime(launchDateTime);
    const [remaining, setRemaining] = useState(() => getLaunchRemaining(launchTime));
    useEffect(() => {
        setRemaining(getLaunchRemaining(launchTime));
        const iv = setInterval(() => setRemaining(getLaunchRemaining(launchTime)), 1000);
        return () => clearInterval(iv);
    }, [launchTime]);
    useEffect(() => {
        if (remaining.totalMs <= 0)
            onRemove();
        // Only when the countdown actually hits zero; onRemove is stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remaining.totalMs <= 0]);
    const pad = (n) => String(n).padStart(2, '0');
    const boxes = [
        { value: String(remaining.days).padStart(2, '0'), label: 'Days' },
        { value: pad(remaining.hours), label: 'Hours' },
        { value: pad(remaining.minutes), label: 'Minutes' },
        { value: pad(remaining.seconds), label: 'Seconds' },
    ];
    const launchDate = new Date(launchTime);
    return (_jsxs("div", { "data-launching-soon": true, className: "fixed inset-0 z-[400] overflow-y-auto bg-obsidian text-ivory", children: [_jsx("div", { className: "absolute inset-0", "data-kinetic-grid": true, children: _jsx(KineticGrid, { background: "transparent", dotColor: "#F7F5F0", lineColor: "#C6A875", trailColor: "#C6A875", spacing: 36, radius: 260, strength: 5, trail: true }) }), _jsx("div", { className: "absolute inset-0 bg-obsidian/55 pointer-events-none" }), _jsxs("div", { className: "relative z-10 min-h-full flex flex-col items-center justify-center text-center px-5 py-10 pointer-events-none", children: [_jsx("img", { src: "/windows-h-logo.png", alt: "HSN logo", className: "w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-brand-500/60 mb-6" }), _jsx("p", { className: "text-brand-400 font-bold tracking-[0.35em] text-xs sm:text-sm mb-4", children: "HSN CEMENT AND STEEL" }), _jsxs("h1", { className: "font-extrabold leading-none text-[clamp(3rem,14vw,9rem)] tracking-tight", children: ["LAUNCHING", _jsx("span", { className: "block text-brand-400", children: "SOON" })] }), _jsxs("p", { className: "mt-5 text-silver text-sm sm:text-base max-w-md", children: ["Our website is launching soon. Premium cement, steel and roofing \u2014 opening for orders on ", launchDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), "."] }), _jsx("div", { className: "launch-clock mt-8 grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-lg", role: "timer", "aria-label": "Countdown to launch", children: boxes.map(b => (_jsxs("div", { className: "bg-charcoal/70 border border-gunmetal rounded-3xl px-2 py-4 sm:py-5", children: [_jsx("div", { className: "launch-digit font-extrabold text-2xl sm:text-4xl text-ivory tabular-nums", children: b.value }, b.value), _jsx("div", { className: "text-[10px] sm:text-xs font-bold tracking-widest text-silver uppercase mt-1", children: b.label })] }, b.label))) }), _jsxs("p", { className: "mt-6 text-xs text-silver", children: ["Launch: ", launchDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), " at ", launchDate.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })] }), _jsx("p", { className: "mt-1 text-xs text-silver", children: "Kalikiri, Andhra Pradesh" }), isAdmin && (_jsxs("div", { className: "mt-10 bg-brand-500/10 border border-brand-500/30 rounded-3xl p-5 max-w-md w-full pointer-events-auto", children: [_jsx("p", { className: "text-xs font-bold text-brand-300 mb-3", children: "You are signed in as admin \u2014 only you see this button." }), _jsx("button", { type: "button", onClick: onRemove, className: "w-full bg-brand-500 text-obsidian font-extrabold px-6 py-3.5 rounded-2xl hover:brightness-110 transition", children: "Remove this poster \u2014 open the website" }), _jsx("p", { className: "text-[11px] text-silver mt-3", children: "Removing it opens the site for everyone. You can change the opening date/time and turn it back on in Admin \u2192 Security & Settings." })] }))] })] }));
}
