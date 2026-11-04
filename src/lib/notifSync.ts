import type { Notification } from '../types';

/**
 * Notifications / alerts — cross-device sync helpers.
 *
 * Notifications are admin-owned shared content: publishing, editing,
 * hiding, deleting and marking-read must land on every device and every
 * browser, not just the one that made the change. Each mutation stamps
 * `updatedAt`, so a merge can tell which copy is newer. Deletions are
 * tombstoned (like orders) so a stale copy on another device can never
 * resurrect an alert the admin removed.
 */

export function notifTime(n: Notification): number {
  return Date.parse(n.updatedAt || n.createdAt || '') || 0;
}

export function notifSignature(n: Notification): string {
  return [n.id, n.updatedAt || '', n.read ? 1 : 0, n.active === false ? 0 : 1, n.type, n.title, n.content].join('\u0001');
}

/** True when both lists hold exactly the same alerts (order-insensitive). */
export function sameNotifications(a: Notification[], b: Notification[]): boolean {
  if (a.length !== b.length) return false;
  const byId = new Map(b.map(n => [n.id, notifSignature(n)]));
  return a.every(n => byId.get(n.id) === notifSignature(n));
}

/** Union of local + cloud alerts: tombstones win, newest `updatedAt` wins per id. */
export function mergeNotifications(local: Notification[], cloud: Notification[], deleted: Set<string>): Notification[] {
  const byId = new Map<string, Notification>();
  for (const n of cloud) {
    if (n && n.id && !deleted.has(n.id)) byId.set(n.id, n);
  }
  for (const n of local) {
    if (!n || !n.id || deleted.has(n.id)) continue;
    const remote = byId.get(n.id);
    if (!remote) { byId.set(n.id, n); continue; }
    // Newest edit wins the content; "read" is a separate flag that sticks
    // once any device has read the alert (there is no un-read action).
    const newer = notifTime(n) > notifTime(remote) ? n : remote;
    const read = n.read === true || remote.read === true;
    byId.set(n.id, read === (newer.read === true) ? newer : { ...newer, read });
  }
  const merged = [...byId.values()].sort((a, b) => {
    const ca = Date.parse(a.createdAt || '') || 0;
    const cb = Date.parse(b.createdAt || '') || 0;
    return cb - ca || notifTime(b) - notifTime(a);
  });
  // Return the SAME array when nothing changed: that keeps React from
  // re-rendering and, more importantly, stops two open tabs from bouncing
  // identical lists back and forth through localStorage forever.
  return sameNotifications(merged, local) ? local : merged;
}

/** Per-device "seen" key: an edited alert (new updatedAt) pops again. */
export function notifSeenKey(n: Notification): string {
  return `${n.id}@${n.updatedAt || n.createdAt || ''}`;
}
