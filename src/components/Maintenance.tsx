/**
 * Full-page system-under-maintenance page (BUILD 73). It covers the whole
 * viewport and renders NO links, nav, cart or page content for visitors —
 * nothing behind it can be opened while maintenance is ON. The admin
 * portal itself is never gated, and a signed-in admin on this page sees
 * only a button that turns maintenance off for every device (via the
 * cloud flag). Same pattern as the Launching Soon poster, but it takes
 * precedence over the poster: if both are ON, visitors see maintenance.
 * BUILD 74: the rotating-dot loader from Uiverse.io (sent by the owner)
 * runs above the heading, re-coloured to HSN champagne/ivory — see the
 * .pl rules in index.css. It is decorative only; it does not mean the
 * page is about to open.
 */
export default function Maintenance({ isAdmin, onTurnOff, message }: { isAdmin: boolean; onTurnOff: () => void; message: string }) {
  const text = message && message.trim() ? message : 'We are currently maintaining the system. Please check back soon.';
  return (
    <div
      data-maintenance
      className="fixed inset-0 z-[400] overflow-y-auto overflow-x-clip bg-obsidian text-ivory"
    >
      <div className="relative z-10 min-h-full flex flex-col items-center justify-center text-center px-5 py-10 pointer-events-none">
        <div className="pl mb-8" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="pl__dot" />
          ))}
          <div className="pl__text">HSN</div>
        </div>
        <img src="/windows-h-logo.png" alt="HSN logo" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-brand-500/60 mb-6" />
        <p className="text-brand-400 font-bold tracking-[0.35em] text-xs sm:text-sm mb-4">HSN CEMENT AND STEEL</p>
        <h1 className="font-extrabold leading-none text-[clamp(2.5rem,11vw,7rem)] tracking-tight">
          SYSTEM UNDER
          <span className="block text-brand-400">MAINTENANCE</span>
        </h1>
        <p className="mt-5 text-silver text-sm sm:text-base max-w-md">{text}</p>
        <p className="mt-6 text-xs text-silver">Kalikiri, Andhra Pradesh</p>

        {isAdmin && (
          <div className="mt-10 bg-brand-500/10 border border-brand-500/30 rounded-3xl p-5 max-w-md w-full pointer-events-auto">
            <p className="text-xs font-bold text-brand-300 mb-3">You are signed in as admin — only you see this button.</p>
            <button
              type="button"
              onClick={onTurnOff}
              className="w-full bg-brand-500 text-obsidian font-extrabold px-6 py-3.5 rounded-2xl hover:brightness-110 transition"
            >
              Turn maintenance off — open the website
            </button>
            <p className="text-[11px] text-silver mt-3">Turning it off opens the site for everyone. You can turn it back on in Admin → Security &amp; Settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
