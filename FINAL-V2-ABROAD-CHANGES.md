# V2 Final — Godavari Basket Abroad

This build keeps the approved V2 UI/animations and applies only the requested production corrections.

- Live catalog only: products/bundles and categories are derived from `ABROAD_GOOGLE_SHEET_URL`.
- No hard-coded demo category/product catalog remains in `data/catalog.ts`.
- Build For Me uses the live Sheet categories rather than fixed demo interests.
- The 0.5 kg packing allowance counts once per shipment and is shown only in the final checkout/order summary.
- Footer uses the parent Godavari Basket identity and supports WhatsApp, Instagram and support email through environment variables.
- Checkout/address layout is unchanged; its typography is normalized to the site premium font system.
- Visible branding and metadata use **Godavari Basket Abroad** and `abroad.godavaribasket.com`.
- Build For Me mobile scroll/body-lock handling is kept scroll-safe without changing the V2 look.

See `.env.example` and `GOOGLE_SHEET_ABROAD_CATALOG.md` before deployment.
