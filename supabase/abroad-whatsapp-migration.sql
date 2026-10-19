-- Add checkout method for older installations. Existing values are preserved.
alter table public.abroad_orders add column if not exists checkout_method text not null default 'PAYPAL';
