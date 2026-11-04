-- HSN Cement & Steel — Supabase Auth admin + tightened orders RLS (BUILD 66)
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- It is safe to run twice (IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- STEP 0 (do this FIRST, in the dashboard, not in SQL):
--   Authentication -> Users -> Add user
--     Email:    habeebc84@gmail.com
--     Password: choose a strong password (this becomes the admin login)
--     Tick "Auto Confirm User" so sign-in works immediately.
--   If you do not create this user, NO ONE can sign in as admin after
--   BUILD 66 — that is the fix, not a bug. Visitors, checkout and
--   tracking keep working without any admin session.
--
-- STEP 1: this file creates the orders table if it is not there yet
-- (it replaces supabase/hsn_orders.sql — run this file instead of that
-- one if you have not run it yet; if you already ran it, the table
-- creation below is a no-op and only the policies change).
create table if not exists public.hsn_orders (
  id text primary key,
  order_id text not null unique,
  status text not null
    check (status in ('placed','confirmed','processing','ready_dispatch','out_delivery','delivered','cancelled','returned')),
  total numeric not null default 0,
  placed_at timestamptz not null default now(),
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hsn_orders_status_idx on public.hsn_orders (status);
create index if not exists hsn_orders_placed_at_idx on public.hsn_orders (placed_at desc);

alter table public.hsn_orders enable row level security;

-- STEP 2: tightened policies.
--   * SELECT: anyone (customers track via the site; the site shows no
--     customer list to visitors, and order ids are needed to look one up).
--   * INSERT: anyone (customers place orders without an account — this
--     must stay open, otherwise checkout breaks).
--   * UPDATE / DELETE: authenticated admin ONLY. An attacker holding the
--     published anon key can no longer change an order status, change a
--     delivery charge, or delete an order. The admin's Supabase Auth
--     session is the "authenticated" role, so admin edits in the site
--     keep working once signed in.
-- The old open policies from hsn_orders.sql are dropped first.
drop policy if exists "hsn_orders_select" on public.hsn_orders;
create policy "hsn_orders_select" on public.hsn_orders
  for select to anon, authenticated using (true);

drop policy if exists "hsn_orders_insert" on public.hsn_orders;
create policy "hsn_orders_insert" on public.hsn_orders
  for insert to anon, authenticated with check (true);

drop policy if exists "hsn_orders_update" on public.hsn_orders;
create policy "hsn_orders_update" on public.hsn_orders
  for update to authenticated using (true) with check (true);

drop policy if exists "hsn_orders_delete" on public.hsn_orders;
create policy "hsn_orders_delete" on public.hsn_orders
  for delete to authenticated using (true);

grant select, insert, update, delete on public.hsn_orders to anon, authenticated;

-- STEP 3 (dashboard UI, not SQL — bucket policies are managed per bucket):
--   Storage -> site-content -> Policies
--   Delete any policy that allows INSERT / UPDATE / DELETE to "anon"
--   (public), and make sure there is a policy allowing INSERT / UPDATE /
--   DELETE to "authenticated" and SELECT to public. After that, only a
--   signed-in admin can overwrite site-content.json; visitors can only
--   read it. Until you do this step, the JSON file can still be
--   overwritten with the anon key — the Postgres orders above are
--   already protected by this SQL file alone.
--   To see the current bucket policies, run:
--     select policyname, roles, cmd from pg_policies
--     where schemaname = 'storage' and tablename = 'objects';

-- Verification (run after the table is created):
--   select count(*) as orders_in_postgres from public.hsn_orders;
--   select policyname, roles, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'hsn_orders';
-- Expected: select + insert for anon/authenticated, update + delete
-- for authenticated only.
