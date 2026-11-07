/**
 * Visitor Intelligence — browser-side tracker.
 *
 * Anonymous only: each browser gets a random visitor id stored in its own
 * localStorage, so repeat visits can be counted without ever knowing who
 * the visitor is. No name, phone, email or IP address is collected here.
 * The server adds city / device / browser from the request itself.
 *
 * Tracking is skipped when the visitor has Do Not Track on, and any
 * failure (server not configured yet, offline, blocked) is swallowed —
 * analytics must never break the shop.
 */
const VISITOR_KEY = 'hsn_visitor_id';

function getVisitorId() {
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

// Referrer + UTM campaign are captured once per session (the landing
// visit), so later page views are not re-attributed to the wrong source.
let sessionAttribution = null;
function getSessionAttribution() {
  if (sessionAttribution) return sessionAttribution;
  let params = null;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    params = null;
  }
  sessionAttribution = {
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    utm_source: params ? params.get('utm_source') || '' : '',
    utm_medium: params ? params.get('utm_medium') || '' : '',
    utm_campaign: params ? params.get('utm_campaign') || '' : '',
  };
  return sessionAttribution;
}

export function trackVisit(page) {
  try {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') return;
    if (typeof page !== 'string' || !page) return;
    const visitorId = getVisitorId();
    if (!visitorId) return;
    const attr = getSessionAttribution();
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, page, ...attr }),
      signal: AbortSignal.timeout(8000),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics never breaks the shop.
  }
}
