import { getSupabaseClient } from './remoteContent';

/**
 * Admin authentication — Supabase Auth (BUILD 66).
 *
 * Before BUILD 66, admin access was a localStorage flag (`hsn_admin=true`).
 * Anyone who typed that in the browser console became "admin" on their own
 * device and could push edits to the shared cloud copy with the public
 * anon key. That flag is now ignored completely.
 *
 * Now: admin access requires a real Supabase Auth session whose user email
 * is the admin email. Supabase stores that session as a signed JWT
 * (sb-...-auth-token in localStorage); it cannot be forged by typing a
 * flag in the console, and it is the same session the Supabase client
 * sends with Postgres and Storage requests, so the tightened RLS / bucket
 * policies in supabase/hsn_orders_auth.sql actually apply to it.
 *
 * The admin user must be created in the Supabase Dashboard first:
 *   Authentication -> Users -> Add user -> habeebc84@gmail.com + password
 * (email confirmation can be left on; the user must confirm, or the admin
 * can tick "Auto Confirm User" in the dashboard when creating it).
 * Until that user exists, no one can sign in as admin — that is the fix,
 * not a bug. Visitors, checkout and tracking never need an admin session.
 */
export const ADMIN_EMAIL = 'habeebc84@gmail.com';

export function isAdminEmail(email: string | undefined | null): boolean {
  return Boolean(email) && email!.trim().toLowerCase() === ADMIN_EMAIL;
}

/** Current admin session user email, or null. Never throws. */
export async function getAdminSessionEmail(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getSession();
    if (error || !data.session?.user?.email) return null;
    return isAdminEmail(data.session.user.email) ? data.session.user.email : null;
  } catch {
    return null;
  }
}

/** Sign in as admin with Supabase Auth. Returns true only on a real session. */
export async function signInAdmin(email: string, password: string): Promise<boolean> {
  if (!isAdminEmail(email)) return false;
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error || !data.session) return false;
    return isAdminEmail(data.session.user.email);
  } catch {
    return false;
  }
}

/** Sign out the admin session. */
export async function signOutAdmin(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.auth.signOut();
  } catch {
    /* sign-out must never block the UI */
  }
}

/**
 * Change the admin's Supabase Auth password (signed-in admin only).
 * This replaces the old local-hash password change, which only changed
 * the password on one device and never protected anything.
 */
export async function changeAdminAuthPassword(newPassword: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
