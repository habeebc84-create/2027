-- HSN Cement & Steel — real Postgres table for orders
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- It is safe to run twice (IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- How the site uses it (src/lib/ordersDb.ts, wired in src/context/AppContext.tsx):
--   * placeOrder          -> INSERT (upsert on order_id)
--   * updateOrderStatus   -> UPSERT the full order (status + timeline in `data`)
--   * setOrderFinalDeliveryCharge -> UPSERT the full order
--   * deleteOrder         -> DELETE by order_id
--   * every device        -> SELECT all rows, merged with the local copy
--                           (a longer/newer timeline wins, same rule as the
--                           JSON cloud sync). Orders already on a device are
--                           upserted into this table on the next load, so
--                           existing orders migrate themselves.
-- The full order (items, customer, timeline, charges) is kept in `data` as
-- jsonb so nothing is lost by splitting it into columns; `status`, `total`
-- and `placed_at` are also real columns so the admin counts/filters can be
-- answered by SQL later without reading every row.

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

-- Openness note: these policies match the openness the site already has
-- today — the shared site-content.json file is public, and anyone holding
-- the published anon key can already read/overwrite it. The anon key is
-- NOT a secret and must never be treated as one. To lock writes down to
-- the owner only, the next step is Supabase Auth for the admin (sign-in
-- with email/password, then policies that allow writes only to that
-- admin user). Until then, do not put the service_role key anywhere in
-- the site code or in Vercel env vars — it bypasses RLS entirely.
drop policy if exists "hsn_orders_select" on public.hsn_orders;
create policy "hsn_orders_select" on public.hsn_orders
  for select to anon, authenticated using (true);

drop policy if exists "hsn_orders_insert" on public.hsn_orders;
create policy "hsn_orders_insert" on public.hsn_orders
  for insert to anon, authenticated with check (true);

drop policy if exists "hsn_orders_update" on public.hsn_orders;
create policy "hsn_orders_update" on public.hsn_orders
  for update to anon, authenticated using (true) with check (true);

drop policy if exists "hsn_orders_delete" on public.hsn_orders;
create policy "hsn_orders_delete" on public.hsn_orders
  for delete to anon, authenticated using (true);

grant select, insert, update, delete on public.hsn_orders to anon, authenticated;

-- Verification (run after the table is created):
--   select count(*) as orders_in_postgres from public.hsn_orders;
--   select order_id, status, total, placed_at from public.hsn_orders order by placed_at desc limit 10;
