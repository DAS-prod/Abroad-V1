-- Run for existing installations. Preserve historical provider columns and orders.
alter table public.abroad_orders add column if not exists checkout_method text not null default 'PAYPAL';
alter table public.abroad_orders alter column checkout_method set default 'PAYPAL';
alter table public.abroad_orders add column if not exists paypal_order_id text;
alter table public.abroad_orders add column if not exists paypal_capture_id text;
create unique index if not exists abroad_orders_paypal_order_unique on public.abroad_orders(paypal_order_id) where paypal_order_id is not null;
create unique index if not exists abroad_orders_paypal_capture_unique on public.abroad_orders(paypal_capture_id) where paypal_capture_id is not null;
