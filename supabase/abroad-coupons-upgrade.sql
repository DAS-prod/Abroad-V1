-- Run this in Supabase SQL editor before deploying checkout coupons.
create table if not exists public.abroad_coupons (
 code text primary key, percent_off numeric(5,2) not null check(percent_off>0 and percent_off<=100),
 min_subtotal_usd numeric(12,2) not null default 0,
 max_discount_usd numeric(12,2), active boolean not null default true,
 starts_at timestamptz,expires_at timestamptz,
 usage_limit integer,used_count integer not null default 0
);
alter table public.abroad_coupons enable row level security;
-- Intentionally no client policies: read coupons using service role on server only.
alter table public.abroad_orders add column if not exists coupon_code text;
alter table public.abroad_orders add column if not exists discount_usd numeric(12,2) not null default 0;
-- Sample test coupon: delete or disable before launch if unwanted.
insert into public.abroad_coupons(code,percent_off,min_subtotal_usd,active)
 values('WELCOME5',5,0,true) on conflict(code) do nothing;
-- IMPORTANT: usage_limit enforcement requires an atomic redemption procedure before enabling limited-use coupons.
