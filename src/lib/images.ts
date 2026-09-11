/**
 * Image helpers: cache-busting for uploaded images and client-side compression
 * so large photos never blow the localStorage quota.
 */

const BUST_KEY = 'hsn_img_bust_v1';

function readBustMap(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BUST_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Returns a cache-busted URL for a local public/ image path (e.g. "/hero.png").
 * Every time `markImageUpdated` is called for that path, the returned URL
 * changes, so no browser (any cache) can keep serving the old file.
 */
export function bustedImageSrc(path: string | undefined | null): string {
  if (!path) return '';
  // External URLs (unsplash, data URIs) are already unique; leave untouched.
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  const map = readBustMap();
  const v = map[path];
  return v ? `${path}?v=${v}` : path;
}

/** Remember that an image file changed, forcing all browsers to re-fetch it. */
export function markImageUpdated(path: string) {
  try {
    const map = readBustMap();
    map[path] = Date.now();
    localStorage.setItem(BUST_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/**
 * Compress an uploaded image to a data URL that fits comfortably in
 * localStorage (max ~600KB output, ~1600px on the long edge, JPEG q0.82).
 * Returns null if the browser cannot decode the file.
 */
export function compressImageFile(file: File, maxEdge = 1600, quality = 0.82): Promise<string | null> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof reader.result === 'string' ? reader.result : null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () =>
        resolve(typeof reader.result === 'string' ? reader.result : null);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Save site content to localStorage without throwing when the quota is hit:
 * images are stripped (they are the largest payloads) so text settings survive.
 */
export function safeSaveSiteContent(value: unknown): boolean {
  try {
    localStorage.setItem('hsn_siteContent', JSON.stringify(value));
    return true;
  } catch {
    try {
      const stripped = { ...(value as Record<string, unknown>) };
      for (const k of ['frontPageImages', 'galleryImages']) {
        if (Array.isArray(stripped[k])) (stripped as Record<string, unknown>)[k] = [];
      }
      localStorage.setItem('hsn_siteContent', JSON.stringify(stripped));
      return false;
    } catch {
      return false;
    }
  }
}
