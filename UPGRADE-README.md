# Setup reference

Payment setup has been replaced. Follow PAYPAL-SETUP.md for current instructions.

# Godavari Basket Abroad — Account, Catalog, Checkout Upgrade

## Included
- Premium responsive account page with unified Manrope/Cormorant Garamond typography, editable profile and order list.
- Redesigned secure checkout and WhatsApp checkout buttons with hover motion and reduced-motion support.
- Visible catalog category filters, in-stock filter, sorting, ranked on-device search, and live product suggestions.
- Coupon field in checkout summary; discount is only on product subtotal and excluded from transport.
- Prominent total payable, product weight, packaging weight, and shipment weight.
- Packaging adjusted to 0.5 kg, matching server-side checkout calculation.

## Setup (required)
1. In your existing Supabase project's SQL editor, run `supabase/abroad-coupons-upgrade.sql` **once**.
2. Configure the same environment variables that your existing Abroad V3 uses. Do not put service-role keys in `NEXT_PUBLIC_` variables.
3. Run `npm install && npm run build` and deploy the project to your hosting account.
4. Test a coupon using `WELCOME5` (5% off product subtotal), then disable it or create actual marketing coupons in `abroad_coupons`.

## Notes
- Search works over the loaded catalog on the client; it uses relevance scoring and suggestions without external paid search infrastructure.
- Prices and applied coupons are recalculated on the server; a client cannot set its own discount amount.
- The shipping rate remains $8/kg because this is the rate configured in the uploaded V3 code.
- Coupon usage limits are checked, but *not atomically reserved*. Do not use strictly limited redemption campaigns without adding an atomic redemption step to the final payment/order confirmation flow.
- This workspace does not have installed node dependencies or network package installation, so a full Next.js build was not available during preparation. Run the build and payment tests as described above before production deployment.