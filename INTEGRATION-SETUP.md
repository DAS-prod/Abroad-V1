# Setup reference

Payment setup has been replaced. Follow PAYPAL-SETUP.md for current instructions.

# Godavari Basket Abroad – integration setup

1. Run `supabase/abroad.sql` in the SAME Supabase project used by India. Authentication is shared; `abroad_customers` and `abroad_orders` are separate. Do not run the domestic SQL migrations again.
4. In Supabase Auth → URL Configuration allow `https://abroad.godavaribasket.com/account` as a redirect URL. The same Google OAuth credentials can remain configured on the same Supabase project (Google Cloud redirect points to Supabase callback). Confirm the project OAuth settings.
6. `npm install && npm run build`; test Google login, cart, min weight, shipping calculation, failed payment, successful payment and refresh /checkout/return.

Shipping = total shipment weight (products + existing 0.5 kg packaging) × $8. No shipping line in cart drawer. Server recalculates catalog prices and shipping and never trusts client totals.

