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
export function isAdminEmail(email) {
    return Boolean(email) && email.trim().toLowerCase() === ADMIN_EMAIL;
}
/** Current admin session user email, or null. Never throws. */
export async function getAdminSessionEmail() {
    const client = getSupabaseClient();
    if (!client)
        return null;
    try {
        const { data, error } = await client.auth.getSession();
        if (error || !data.session?.user?.email)
            return null;
        return isAdminEmail(data.session.user.email) ? data.session.user.email : null;
    }
    catch {
        return null;
    }
}
/**
 * Sign in as admin with Supabase Auth. Returns null on success, or the real
 * Supabase error message on failure. BUILD 67: the old version swallowed
 * every failure as "Invalid credentials", so the owner could not tell
 * "Email not confirmed" (Auto Confirm not ticked) from a wrong password
 * from a user that does not exist at all. Showing Supabase's own message
 * here is what Supabase itself shows — it does not reveal the password.
 */
export async function signInAdmin(email, password) {
    // BUILD 80 security fix: do not print the admin email in the sign-in
    // error — anyone opening the admin login page could read it from
    // there. The check itself is unchanged.
    if (!isAdminEmail(email))
        return 'Only the admin account can sign in here.';
    const client = getSupabaseClient();
    if (!client)
        return 'Supabase is not configured. Please try again later.';
    try {
        const { data, error } = await client.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });
        if (error)
            return error.message;
        if (!data.session)
            return 'Sign-in did not return a session. Please try again.';
        if (!isAdminEmail(data.session.user.email))
            return 'This account is not the admin account.';
        return null;
    }
    catch {
        return 'Sign-in failed. Check your connection and try again.';
    }
}
/**
 * Send a password-reset email to the admin email only (BUILD 68).
 * Returns null on success, or the real Supabase error message on failure.
 * The link in the mail points back to /manage-portal-9f3a: clicking it
 * sets a recovery session, which routes to the admin dashboard, where
 * Security & Settings > Change sets the new password. It is sent only
 * to ADMIN_EMAIL, never to an arbitrary typed address, so the link
 * cannot be used to spam or enumerate other accounts. Note: if
 * Supabase rejects the redirect, add
 * https://hsncementandsteel-sigma.vercel.app/manage-portal-9f3a to
 * Supabase Dashboard > Authentication > URL Configuration > Redirect URLs.
 */
export async function requestAdminPasswordReset() {
    const client = getSupabaseClient();
    if (!client)
        return 'Supabase is not configured. Please try again later.';
    try {
        const { error } = await client.auth.resetPasswordForEmail(ADMIN_EMAIL, {
            redirectTo: `${window.location.origin}/manage-portal-9f3a`,
        });
        if (error)
            return error.message;
        return null;
    }
    catch {
        return 'Could not send the reset email. Check your connection and try again.';
    }
}
/** Sign out the admin session. */
export async function signOutAdmin() {
    const client = getSupabaseClient();
    if (!client)
        return;
    try {
        await client.auth.signOut();
    }
    catch {
        /* sign-out must never block the UI */
    }
}
/**
 * Change the admin's Supabase Auth password (signed-in admin only).
 * This replaces the old local-hash password change, which only changed
 * the password on one device and never protected anything.
 */
export async function changeAdminAuthPassword(newPassword) {
    const client = getSupabaseClient();
    if (!client)
        throw new Error('Supabase is not configured');
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error)
        throw new Error(error.message);
}
