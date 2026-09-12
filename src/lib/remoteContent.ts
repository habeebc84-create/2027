import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared cloud copy of site content (hero/splash images, gallery, texts).
 *
 * Why: the admin uploads on their phone/browser, but other visitors' browsers
 * have their own localStorage. The only way an image change appears instantly
 * in ALL browsers, mobiles and laptops is a single shared copy in the cloud.
 * Every visitor pulls the latest version on load; the admin pushes on save.
 *
 * Storage layout (public bucket "site-content"):
 *   site-content.json  — full SiteContent JSON (incl. base64 images)
 *
 * Env vars (from Freebuff Keys/API keys tab, Vite-prefixed):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const BUCKET = 'site-content';
const FILE = 'site-content.json';
/** in-memory bust so repeated fetches within one session never hit the HTTP cache */
let bustCounter = 0;

export function isCloudConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

/** Public CDN URL for the shared JSON (cache-busted so we always get fresh bytes). */
export function remoteContentUrl(): string {
  const url = SUPABASE_URL || '';
  bustCounter += 1;
  // cache-max-age=0 asks the Supabase CDN to revalidate instead of serving stale
  return `${url}/storage/v1/object/public/${BUCKET}/${FILE}?cache-max-age=0&bust=${Date.now()}_${bustCounter}`;
}

export interface PullResult {
  content: Record<string, unknown> | null;
  /** true when data came from the cloud (not cache/fallback) */
  fromCloud: boolean;
}

/** Pull the latest shared content JSON from the cloud. Never throws. */
export async function pullRemoteContent(): Promise<PullResult> {
  if (!isCloudConfigured()) return { content: null, fromCloud: false };
  try {
    const res = await fetch(remoteContentUrl(), { cache: 'no-store' });
    if (!res.ok) return { content: null, fromCloud: false };
    const json = (await res.json()) as Record<string, unknown>;
    return { content: json, fromCloud: true };
  } catch {
    return { content: null, fromCloud: false };
  }
}

/**
 * Admin-side push: overwrite the shared JSON in the cloud so every device
 * sees the new images on its next page load. Returns false if offline/unconfigured.
 */
export async function pushRemoteContent(value: unknown): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  try {
    const body = JSON.stringify(value);
    const { error } = await c.storage
      .from(BUCKET)
      .upload(FILE, body, {
        contentType: 'application/json',
        upsert: true,
        cacheControl: '0',
      });
    if (error) {
      console.error('[remoteContent] push failed', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[remoteContent] push threw', e);
    return false;
  }
}
