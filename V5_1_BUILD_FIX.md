# Godavari Basket Abroad V5.1 — Next.js production build fix

Fixes build errors for `/auth/callback` and `/checkout/return` caused by `useSearchParams` without a Suspense boundary. The existing authorization and payment verification logic remains inside client components wrapped in `Suspense`. No SQL changes required.

To test: `npm install && npm run build`.
