-- Run once in Supabase SQL Editor before deploying this update.
-- Existing orders and WhatsApp orders retain a zero checkout fee.
ALTER TABLE public.abroad_orders
  ADD COLUMN IF NOT EXISTS payment_fee_usd numeric(12,2) NOT NULL DEFAULT 0;
COMMENT ON COLUMN public.abroad_orders.payment_fee_usd IS
  'Fixed additional checkout charge included in total_usd; zero for WhatsApp orders.';
