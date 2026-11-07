/**
 * Visitor Intelligence — admin reads.
 *
 * Visits are read straight from Postgres with the admin's own Supabase
 * Auth session (the same client the admin sign-in uses). The table's RLS
 * allows SELECT to authenticated users only, so a visitor holding the
 * public anon key can never read another visitor's city or browsing.
 *
 * Returns the rows newest-first, or null when the table is missing, the
 * read is blocked, or the admin is offline — the admin page shows its
 * setup notice in that case instead of crashing.
 */
import { getSupabaseClient } from './remoteContent';

export const VISITS_TABLE = 'hsn_visits';

function rowToVisit(row) {
  return {
    id: row.id,
    visitorId: row.visitor_id || '',
    visitedAt: row.visited_at || '',
    page: row.page || '',
    city: row.city || 'Unknown',
    region: row.region || 'Unknown',
    country: row.country || 'Unknown',
    device: row.device || 'Unknown',
    browser: row.browser || 'Unknown',
    os: row.os || 'Unknown',
    referrer: row.referrer || '',
    utmSource: row.utm_source || '',
    utmMedium: row.utm_medium || '',
    utmCampaign: row.utm_campaign || '',
    isReturning: Boolean(row.is_returning),
    isBot: Boolean(row.is_bot),
  };
}

/**
 * All visits in the range, newest first. days = 0 means all time.
 * Null = table missing / blocked / offline.
 */
export async function fetchVisits(days) {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    let query = client
      .from(VISITS_TABLE)
      .select('*')
      .order('visited_at', { ascending: false })
      .limit(2000);
    if (days && days > 0) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('visited_at', since);
    }
    const { data, error } = await query;
    if (error || !Array.isArray(data)) return null;
    return data.map(rowToVisit);
  } catch {
    return null;
  }
}
