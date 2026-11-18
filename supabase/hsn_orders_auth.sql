-- Run in the Supabase SQL editor before deploying the API changes.
-- Re-runnable for existing databases. Retains all order rows.
begin;

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

-- Customer checkout and tracking use the server's service role.
-- Match the existing application administrator using the signed JWT claim.
-- Remove old permissive policies, including policies created in the dashboard.
do $$
declare existing record;
begin
  for existing in select policyname from pg_policies
    where schemaname = 'public' and tablename = 'hsn_orders'
  loop
    execute format('drop policy %I on public.hsn_orders', existing.policyname);
  end loop;
end $$;

create policy hsn_orders_admin on public.hsn_orders
  for all to authenticated
  using (auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com')
  with check (auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

revoke all on public.hsn_orders from anon;
grant select, insert, update, delete on public.hsn_orders to authenticated, service_role;

-- Nullable columns preserve orders created before checkout retry protection.
alter table public.hsn_orders add column if not exists checkout_key uuid;
alter table public.hsn_orders add column if not exists checkout_hash text;
create unique index if not exists hsn_orders_checkout_key_idx
  on public.hsn_orders (checkout_key) where checkout_key is not null;

-- Private order alerts and customer inquiries are visible only to the administrator.
create table if not exists public.hsn_private_notifications (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.hsn_private_notifications enable row level security;
drop policy if exists hsn_private_notifications_admin on public.hsn_private_notifications;
create policy hsn_private_notifications_admin on public.hsn_private_notifications
  for all to authenticated
  using (auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com')
  with check (auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com');
revoke all on public.hsn_private_notifications from anon;
grant select, insert, update, delete on public.hsn_private_notifications to authenticated, service_role;

-- Restrictive guards also constrain any older permissive storage policies.
-- Other buckets retain their current policy behavior.
drop policy if exists site_content_write_guard_insert on storage.objects;
create policy site_content_write_guard_insert on storage.objects as restrictive
  for insert to anon, authenticated
  with check (bucket_id <> 'site-content' or (auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com'));
drop policy if exists site_content_write_guard_update on storage.objects;
create policy site_content_write_guard_update on storage.objects as restrictive
  for update to anon, authenticated
  using (bucket_id <> 'site-content' or (auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com'))
  with check (bucket_id <> 'site-content' or (auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com'));
drop policy if exists site_content_write_guard_delete on storage.objects;
create policy site_content_write_guard_delete on storage.objects as restrictive
  for delete to anon, authenticated
  using (bucket_id <> 'site-content' or (auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com'));
drop policy if exists site_content_admin on storage.objects;
create policy site_content_admin on storage.objects for all to authenticated
  using (bucket_id = 'site-content' and auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com')
  with check (bucket_id = 'site-content' and auth.uid() is not null and lower(auth.jwt() ->> 'email') = 'habeebc84@gmail.com');

commit;
