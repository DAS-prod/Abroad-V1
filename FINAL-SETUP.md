# Final checkout and catalog update

## Included changes
- PayPal: adds a fixed US$3 checkout charge on the server, saves it separately, and includes it in the amount sent to PayPal.
- Under PayPal: “Includes a $3.00 checkout charge”.
- Under WhatsApp: “No extra checkout charge”. Products and transport remain payable.
- Removed the “Need help completing your order?” paragraph.
- Summary shows both WhatsApp and PayPal totals before checkout. Coupons reduce products only; the fee is added afterwards.
- Account outline icon, header search, and home Full Catalog categories/search/stock filter/sort/reset are included.
- Uses your live catalog, authentication and checkout integrations. No preview data or mock checkout is included.

## Important merchant terms
The $3 setting is ENABLED as explicitly requested. PayPal India's agreement prohibits a surcharge for using PayPal and requires equal prominence for payment options. Obtain applicable written permission before using the enabled setting live. The $3 is your fixed additional charge; it is not a statement that PayPal charges a flat $3 or always 4%.
Agreement: https://www.paypal.com/in/legalhub/paypal/useragreement-full

## Existing Vercel/Supabase website: deploy steps
1. Back up your current code. Replace the application files with this folder's contents. Keep your existing environment variables in Vercel; credentials are deliberately excluded from this ZIP.
2. In Supabase SQL Editor, run `supabase/20261019_paypal_checkout_fee.sql` BEFORE deploying. This adds `payment_fee_usd` to `abroad_orders`, defaulting to 0 for existing/WhatsApp orders. No other database migration is needed for an existing installation that already runs PayPal, coupons and WhatsApp checkout.
3. If running locally, copy `.env.example` to `.env.local` and fill in your existing values. Never put server secrets in variables beginning `NEXT_PUBLIC_`.
4. In a terminal in this folder, run:

```bash
npm ci
npm run test:checkout
npx tsc --noEmit
npm run build
npm run dev
```

`npm run dev` is for local testing; Vercel runs the build and hosts the production application. Use `npm start` to serve an existing production build locally.
5. Keep Vercel Framework Preset as Next.js. Redeploy after importing the files. Keep `APP_URL` set to your actual abroad website origin, without a trailing slash.
6. Keep your existing PayPal webhook URL: `https://YOUR-ABROAD-DOMAIN/api/abroad/webhook`. Keep its matching webhook ID, client ID and secret. Sandbox credentials require `PAYPAL_ENV=sandbox`; live credentials require `PAYPAL_ENV=production`.
7. Test with PayPal sandbox before switching to live credentials. Ensure the Supabase migration has completed.

For a completely new database, follow the included original setup documents for the base schema, PayPal, WhatsApp, coupon and notification migrations, then run the new checkout-fee migration. Existing database data must be preserved.

## Change or remove the $3 charge
Open `lib/paypal-checkout-fee.ts`:

```ts
export const PAYPAL_CHECKOUT_FEE = Object.freeze({ enabled: true, amountUsd: 3 });
```

- Remove the charge: change `enabled: true` to `enabled: false`.
- Change its amount: change `amountUsd: 3` to your desired USD amount.
- Rebuild/redeploy afterwards. Do not delete the file or its imports.

That single switch updates the displayed PayPal subtitle, removes the extra summary rows, and stops adding the fee in the server order API. Existing orders keep their originally recorded amount and fee, which is necessary for payment verification. WhatsApp's API never adds this fee.

## Expected checks
- Example: a base checkout total of $100 (products after discount plus transport) costs $100 with WhatsApp and $103 with PayPal.
- Refresh checkout after changing cart or coupons: both totals should update and the fee stays $3 per order.
- PayPal capture validation compares the amount paid with the saved total including the fee.
- Test login and the required matching email, both checkout buttons, catalog filters, header search and the account icon on mobile and desktop.
- WhatsApp orders remain pending until you confirm payment through your existing workflow.

Shipping calculation is preserved from the uploaded code: $8/kg including 0.5kg packaging. This update does not change shipping rates or catalog prices.

## Environment configuration
`.env.example` lists the required values. Reuse your current Google Sheets URLs, Supabase credentials, business WhatsApp number and admin push configuration. Optional footer settings are listed there too. The original setup documents remain included for reference.
