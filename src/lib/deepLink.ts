/**
 * Deep-link helpers for order QR codes.
 *
 * QR codes encode the order tracking link (/track-order/<orderId>) so a scan
 * opens that order's live tracking page directly. The tracking page pulls the
 * order from local storage and, on a fresh device (QR scan on another phone),
 * auto-fetches it from the cloud store before showing results.
 *
 * Legacy query links (?track=<orderId>) from older invoices remain supported
 * by App.tsx and open the same tracking page.
 */
export function orderTrackingUrl(orderId: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/track-order/${encodeURIComponent(orderId)}`;
}
