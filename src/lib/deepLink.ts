/**
 * Deep-link helpers for order tracking QR codes.
 *
 * QR codes use a query-parameter link (?track=<orderId>) instead of the pretty
 * path (/track-order/<orderId>): query strings are always served to the app's
 * index.html, even on static hosts without SPA rewrites, so scanning the QR
 * opens the tracking page directly and fetches that order's information.
 * The app upgrades the URL to the pretty path right after load.
 */
export function orderTrackingUrl(orderId: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/?track=${encodeURIComponent(orderId)}`;
}
