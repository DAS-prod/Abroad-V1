# Godavari Basket Abroad

Premium mobile-first Next.js storefront for building a Godavari Basket box for customers abroad.

## Production behavior
- Catalog comes from the Google Sheet configured with `ABROAD_GOOGLE_SHEET_URL`.
- Categories are derived from the live Sheet; there is no hard-coded demo category/product catalog.
- Add-to-box uses a non-blocking toast; it does not open the cart drawer.
- 5 kg is the minimum checkout shipment weight.
- Packaging weight is calculated automatically and is shown only in the final checkout/order summary.
- The visible box target selector has been removed. The 5 kg minimum remains in the checkout flow.
- Final order continuation is through WhatsApp with the complete order summary and customer details.
- Footer contact details come from environment variables.
- Branding is Godavari Basket Abroad and links back to the parent Godavari Basket India storefront.

## Run
```bash
npm install
npm run dev
```

## Environment
Copy `.env.example` to `.env.local` and set the live values.

## Editorial UI update (27 September 2026)

- The homepage has three in-place ordering views: ready-made combos, custom bundles and the live product catalog. All three use the existing catalog provider and shared box provider.
- Product cards open the existing quick view. The catalog route and cart drawer also open that view without changing add, remove, weight or checkout calculations.
- The original Godavari Basket horizontal logo is served from `public/images/brand/logo.webp` in the forest-green Abroad header.
- One floating WhatsApp button remains active. The duplicated control was removed from the provider tree.
- The existing packing calculation and checkout flow remain unchanged. Set the original environment values in `.env.local` when running this archive; the private `.env` file is intentionally not included.

## Option C revision

- The compact forest-green ordering navigation stays at the top as shoppers browse the three homepage collections. It has a gold active indicator and category icons.
- Header branding uses the previous Abroad layout and the original Godavari Basket logo asset.
- The box target selector was removed from the homepage and builder. The 5 kg checkout minimum and existing cart, ingredient quick view, quantity, shipping, and WhatsApp order logic remain.
- Prices and quantities use Manrope tabular numerals. Transitions and entry motion respect reduced-motion settings.
- The full application reads the configured Google Sheet and contact environment variables. The hosted review is a static preview containing a catalog snapshot from those configured sheets.
