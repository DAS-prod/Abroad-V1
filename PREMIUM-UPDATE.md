# Premium mobile builder update

This build applies the approved mobile-first direction to the real Next.js project.

## Included

- 500 g packaging is counted once per non-empty order in shipment weight.
- Build Your Box selection now navigates and scrolls reliably to the catalog.
- Mobile catalog keeps two bundle cards side by side while making text and controls readable.
- Bundle cards show contents, weight, price, quantity controls, a pairing cue, and a bundle quick-view sheet.
- Cart drawer has one scrollable middle region so suggestions can never trap the remove/close controls.
- Custom WhatsApp message includes destination, target box, selected bundles, product weight, packaging, and total shipment weight.
- Checkout separates product weight, packaging weight, and final shipment weight.
- Real Godavari Basket logo is used in the header.
- Premium motion pass: staggered card reveals, cinematic hero entrance, selection sweep, animated progress, bottom-sheet drawer/quick view, quantity pop, toast motion, and subtle CTA microinteractions.
- Reduced-motion accessibility is respected.

## Recommended final bundle image filenames

Place final 1:1 bundle photography in `public/images/bundles/` and point the Google Sheet/image column to these paths or their deployed equivalents:

- `pickle-classics.webp`
- `nonveg-pickle-selection.webp`
- `traditional-sweets.webp`
- `tea-time-snacks.webp`
- `podi-essentials.webp`
- `premium-cashews.webp`
- `pantry-essentials.webp`
- `90s-memories-box.webp`

Optional build-page imagery:

- `public/images/abroad/build-box-hero.webp`
- `public/images/abroad/custom-box-whatsapp.webp`
- `public/images/abroad/godavari-box-open.webp`

The current code continues to work with the existing catalog images until those final assets are supplied.

## Build-page catalog bug fix
- Box-size clicks now navigate to `/build?box=...&catalog=1` instead of jumping directly to a hash before the async catalog is rendered.
- The Build page waits until the catalog UI exists before smoothly scrolling to it.
- The selected 5/10/15/20 kg value is restored from the query string.
- The critical catalog section is no longer hidden behind the global intersection-observer reveal state.
- Bundle cards on the Build page use a reliable premium entrance animation that cannot remain invisible.
- Added premium skeleton bundle cards while Google Sheet data is loading.
- Added last-known catalog caching so a temporary Google Sheet/API refresh does not leave the Build page blank on mobile.
- The public production Google Sheet URL is used as a server fallback if the deployment environment variable is missing.
