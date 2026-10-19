-- Run once in the SAME Supabase project as India. Shared auth.users, separate business records.
create table if not exists public.abroad_customers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text,full_name text,phone text,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.abroad_orders (
 id text primary key,user_id uuid not null references auth.users(id),email text not null,
 country text not null,address jsonb not null,items jsonb not null,
 subtotal_usd numeric(12,2) not null,transport_usd numeric(12,2) not null,
 total_usd numeric(12,2) not null,shipment_weight_kg numeric(10,2) not null,
 gift_mode boolean not null default false,checkout_method text not null default 'PAYPAL',payment_status text not null default 'PENDING',
 paypal_order_id text,paypal_capture_id text,created_at timestamptz not null default now(),paid_at timestamptz,
 constraint abroad_status_check check (payment_status in ('PENDING','PAID','FAILED','CANCELLED'))
);
create index if not exists abroad_orders_user_created on public.abroad_orders(user_id,created_at desc);
alter table public.abroad_customers enable row level security;
alter table public.abroad_orders enable row level security;
drop policy if exists "abroad customer can read own profile" on public.abroad_customers;
create policy "abroad customer can read own profile" on public.abroad_customers for select to authenticated using (auth.uid()=user_id);
drop policy if exists "abroad customer can read own orders" on public.abroad_orders;
create policy "abroad customer can read own orders" on public.abroad_orders for select to authenticated using (auth.uid()=user_id);
-- No client INSERT/UPDATE on orders: trusted server controls payment status and prices.
-- Run these policies even if you previously executed this file.
drop policy if exists "abroad customer can insert own profile" on public.abroad_customers;
create policy "abroad customer can insert own profile" on public.abroad_customers for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "abroad customer can update own profile" on public.abroad_customers;
create policy "abroad customer can update own profile" on public.abroad_customers for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
