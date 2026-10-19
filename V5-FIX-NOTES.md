# Setup reference

Payment setup has been replaced. Follow PAYPAL-SETUP.md for current instructions.

# Godavari Basket Abroad V5 — checkout hardening

## Changes
- Coupon previews bypass the 5 kg minimum only for preview; actual checkout still enforces it.
- Coupon eligibility/discount always calculated server-side from live catalog prices, excluding shipping.
- Improved invalid-cart error descriptions, making outdated catalog IDs easier to identify.
- WhatsApp checkout clears the local cart after an order is successfully saved and a WhatsApp link is returned.

## Requirements and checks
- Already created `abroad_coupons` and `abroad_orders` columns need no migration.
- A saved WhatsApp order is not a confirmed WhatsApp message or payment.
- For coupons with `usage_limit`, implement a transactional redemption strategy before enabling a limited-use promotion.