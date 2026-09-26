/**
 * Deep-link helpers for order QR codes.
 *
 * QR codes encode the pretty order link (/order-success/<orderId>) — the same
 * per-order URL shown in the browser after checkout. The order page pulls the
 * order from local storage and, if it is a fresh device (QR scan on another
 * phone), auto-fetches it from the cloud store before showing results.
 *
 * Legacy query links (?track=<orderId>) from older invoices remain supported
 * by App.tsx and still open the live tracking page for that order.
 */
export function orderTrackingUrl(orderId: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/order-success/${encodeURIComponent(orderId)}`;
}
