# Godavari Basket Abroad — PayPal setup

## Required credentials
In https://developer.paypal.com/dashboard/ log in with your PayPal Business account, open Apps & Credentials, choose Sandbox, and create/select a REST app. Copy its Client ID and Secret into PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET. These are server-only variables; this redirect checkout does not need a public client ID or a browser SDK.

Create a webhook on the SAME app for https://abroad.godavaribasket.com/api/abroad/webhook and subscribe to CHECKOUT.ORDER.APPROVED and PAYMENT.CAPTURE.COMPLETED. Copy its webhook ID into PAYPAL_WEBHOOK_ID. Sandbox and Live have separate credentials AND webhook IDs.

Set PAYPAL_ENV=sandbox for tests. Set APP_URL=http://localhost:3000 locally, or your exact HTTPS website origin on Vercel (no trailing slash). For webhook tests, use an HTTPS staging deployment and its matching APP_URL. Keep all existing Supabase, Sheets, Google login and WhatsApp settings.

## Database
Existing installation: run supabase/abroad-paypal-migration.sql in Supabase SQL Editor. It adds PayPal order/capture IDs and indexes without deleting historical payment data or changing old checkout_method values. Keep earlier migrations already applied.
New installation: run supabase/abroad.sql, supabase/abroad-coupons-upgrade.sql, then supabase/abroad-paypal-migration.sql. Keep the same Supabase project used for shared login.

## Local launch
```bash
cp .env.example .env.local
# Fill .env.local with your own credentials and existing settings.
npm ci
npm run dev
```
For Vercel, enter those environment variables in Project Settings, then redeploy. Delete obsolete CASHFREE_* environment variables. No new payment SDK dependency is required.

## Payment flow
Pay with PayPal saves a PENDING order using server-calculated USD prices, redirects to PayPal, and captures approved payments on the server after return. Verified signed webhooks also capture approved orders and reconcile completed captures if the buyer closes the tab. Payment status changes to PAID only after checking the linked PayPal order, custom reference, completed capture, currency and exact amount. The capture request uses an idempotency key. Successful browser confirmation clears the cart; cancellation and unconfirmed payments preserve it. A retry button can recheck the same saved order. WhatsApp checkout remains a separate PENDING order flow.
Shipping address entered on the site is passed to PayPal as the provided shipping address. Catalog, shipping rates, coupons and login remain as in the supplied project.

## Sandbox validation before live
Use a Sandbox Personal buyer account distinct from the seller. Check successful payment, cancellation, retry after a lost connection, both webhook subscriptions, repeated webhook delivery, pending captures, wrong amounts/currency, and WhatsApp checkout. Check the Supabase order and capture IDs and payment_status. Code-level mocked checks cannot substitute for a real sandbox payment.

## Go live
Complete PayPal Business verification and receiving eligibility. For India, PayPal lists email/identity verification, PAN, an Indian bank account, purpose code and a valid IEC for goods exporters. See https://www.paypal.com/in/cshelp/article/how-do-i-receive-payments-through-paypal-help667 . Replace all three credentials with Live app values, register the Live webhook, set PAYPAL_ENV=production and APP_URL=https://abroad.godavaribasket.com, and redeploy. Do a small real international order before announcing checkout.
Guest card checkout availability depends on PayPal account/buyer eligibility; this implementation uses PayPal-hosted checkout, not embedded card fields. PayPal processing and conversion fees still apply. Refunds/disputes are managed in PayPal; this change does not implement automated refund status synchronization.

## Changed files
lib/paypal-abroad.ts; app/api/abroad/create-order/route.ts; app/api/abroad/verify/route.ts; app/api/abroad/webhook/route.ts; app/checkout/page.tsx; app/checkout/return/page.tsx; supabase/abroad.sql; supabase/abroad-whatsapp-migration.sql; supabase/abroad-paypal-migration.sql; .env.example. Removed lib/cashfree-abroad.ts. Legacy setup notes now point here. tests/paypal.test.cjs supplies mocked payment verification tests.
