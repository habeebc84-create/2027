-- HSN Cement & Steel — BUILD 96 security lockdown
-- Run in Supabase Dashboard -> SQL Editor AFTER supabase/hsn_orders_auth.sql
-- and supabase/hsn_visits.sql, and AFTER adding SUPABASE_SERVICE_ROLE_KEY in
-- Vercel (Project Settings -> Environment Variables). Safe to run twice.
--
-- Why: today anyone holding the public (publishable) key can
--   * read every order (names, phones, addresses) — orders SELECT is open;
--   * insert orders with any price, skipping the server re-pricing;
--   * overwrite site-content.json (prices, products, maintenance switch).
-- After this file, customers order through /api/orders and track through
-- /api/track (both server-side with the service-role key), and only the
-- signed-in admin can read orders or change site content.

-- 1) Orders: admin-only read/update/delete; no direct anon insert.
drop policy if exists "hsn_orders_select" on public.hsn_orders;
create policy "hsn_orders_select" on public.hsn_orders
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

drop policy if exists "hsn_orders_insert" on public.hsn_orders;
create policy "hsn_orders_insert" on public.hsn_orders
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

drop policy if exists "hsn_orders_update" on public.hsn_orders;
create policy "hsn_orders_update" on public.hsn_orders
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'habeebc84@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

drop policy if exists "hsn_orders_delete" on public.hsn_orders;
create policy "hsn_orders_delete" on public.hsn_orders
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

revoke all on public.hsn_orders from anon;
grant select, insert, update, delete on public.hsn_orders to authenticated;

-- 2) Visits: admin email only (was: any authenticated user).
drop policy if exists "hsn_visits_select_admin" on public.hsn_visits;
create policy "hsn_visits_select_admin" on public.hsn_visits
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

-- 3) Storage bucket site-content: public read, admin-only write.
-- Review existing policies first:
--   select policyname, roles, cmd from pg_policies
--   where schemaname = 'storage' and tablename = 'objects';
-- then DROP any policy that lets anon/public INSERT, UPDATE or DELETE
-- in bucket 'site-content' (names differ per project), and add:
drop policy if exists "hsn_site_content_admin_insert" on storage.objects;
create policy "hsn_site_content_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-content'
    and (auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

drop policy if exists "hsn_site_content_admin_update" on storage.objects;
create policy "hsn_site_content_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-content'
    and (auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

drop policy if exists "hsn_site_content_admin_delete" on storage.objects;
create policy "hsn_site_content_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-content'
    and (auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

-- IMPORTANT: only run step 3 once /api/orders answers 201 on the live site
-- (service key + tables live). Until then customer devices still deliver
-- new orders to the owner through site-content.json (legacy path).
