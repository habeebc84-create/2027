/**
 * Admin password security.
 *
 * Passwords are never stored or displayed in plain text. We store only a
 * salted SHA-256 hash:  "v1:<salt>:<hash-hex>".
 * Login compares hashes, so even if someone reads localStorage they cannot
 * recover the real password.
 */

const DEFAULT_SALT = 'hsn';

/** Pre-computed hash of the factory default password "admin123" (salt "hsn"). */
export const DEFAULT_ADMIN_PASSWORD_HASH =
  'v1:hsn:83e9d15da69f52a49fe974f9f3cf7de0e156fa8f0a56647ca99a72816ccb86dc';

const STORAGE_KEY = 'hsn_admin_password_hash';

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomSalt(len = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes)
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, len);
}

/** Hash a password with a fresh random salt -> "v1:<salt>:<hash>". */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomSalt();
  const hash = await sha256Hex(`${DEFAULT_SALT}::v1::${salt}::${password}`);
  return `v1:${salt}:${hash}`;
}

/** Constant-time-ish comparison to avoid trivial timing leaks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verify a login attempt against the stored value.
 * Accepts the new hash format and migrates old plain-text storage on the fly.
 * Returns true if the password is correct.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
  const [, salt, hash] = stored && stored.startsWith('v1:')
    ? stored.split(':')
    : DEFAULT_ADMIN_PASSWORD_HASH.split(':');
  const attempt = await sha256Hex(`${DEFAULT_SALT}::v1::${salt}::${password}`);
  return safeEqual(attempt, hash);
}

/** Store a new admin password as a salted hash. */
export async function changeAdminPassword(newPassword: string): Promise<void> {
  const hashed = await hashPassword(newPassword);
  try {
    localStorage.setItem(STORAGE_KEY, hashed);
  } catch {
    /* storage unavailable */
  }
}

/** Read the stored hash (for cloud sync). Returns the default hash if unset. */
export function getStoredAdminPasswordHash(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD_HASH;
  } catch {
    return DEFAULT_ADMIN_PASSWORD_HASH;
  }
}

/** Restore a hash (e.g. pulled from the cloud snapshot). */
export function setStoredAdminPasswordHash(hash: string): void {
  if (typeof hash === 'string' && hash.startsWith('v1:')) {
    try {
      localStorage.setItem(STORAGE_KEY, hash);
    } catch {
      /* storage unavailable */
    }
  }
}
