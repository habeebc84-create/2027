-- HSN Cement & Steel — Visitor Intelligence (BUILD 89)
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- It is safe to run twice (IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- What it stores: ONE ROW PER PAGE VIEW, anonymous. No names, no phone
-- numbers, no email addresses, no IP addresses. Each visitor's browser
-- gets a random id (localStorage) so repeat visits can be counted; the
-- server records the visitor's city from Vercel's geo headers, plus
-- device / browser / operating system from the user-agent string, the
-- page viewed, and the referrer / UTM campaign that brought them.
--
-- Writes go ONLY through the Node backend (POST /api/visit) using the
-- service-role key, which bypasses RLS. Reads go ONLY to a signed-in
-- admin (the site's Supabase Auth session). Visitors can neither read
-- nor write this table with the public anon key.
--
-- Run this file together with supabase/hsn_orders_auth.sql if you have
-- not run that one yet — both are needed to switch the backend on.
create table if not exists public.hsn_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  visited_at timestamptz not null default now(),
  page text not null,
  city text not null default 'Unknown',
  region text not null default 'Unknown',
  country text not null default 'Unknown',
  device text not null default 'Unknown',
  browser text not null default 'Unknown',
  os text not null default 'Unknown',
  referrer text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  is_returning boolean not null default false,
  is_bot boolean not null default false
);

create index if not exists hsn_visits_visited_at_idx on public.hsn_visits (visited_at desc);
create index if not exists hsn_visits_visitor_idx on public.hsn_visits (visitor_id);

alter table public.hsn_visits enable row level security;

-- SELECT: signed-in admin ONLY. No anon read — a visitor's city and
-- browsing must never be visible to other visitors.
drop policy if exists "hsn_visits_select_admin" on public.hsn_visits;
create policy "hsn_visits_select_admin" on public.hsn_visits
  for select to authenticated using (true);

-- No INSERT / UPDATE / DELETE policies for anon or authenticated: only
-- the service-role key (server) writes. Do NOT add an open insert
-- policy — it would let anyone forge visit rows.
grant select on public.hsn_visits to authenticated;

-- Verification (run after the table is created):
--   select count(*) as visits_in_postgres from public.hsn_visits;
--   select policyname, roles, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'hsn_visits';
-- Expected: one select policy, authenticated only.
