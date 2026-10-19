# Setup reference

Payment setup has been replaced. Follow PAYPAL-SETUP.md for current instructions.

# Abroad Login Popup and Account Fix

## Updated behavior
- Clicking Checkout in the cart checks Supabase authentication first. Logged-out customers see an in-place modal (Google, email/password, create account, reset link). No redirect to the domestic website.
- Logged-in customers continue directly to `/checkout`. Opening `/checkout` without a session also opens the modal on that page.
- Google OAuth necessarily visits Google's consent page; after approval, it returns to the **abroad domain** at `/auth/callback`, then resumes `/checkout` (or `/account`).
- Header account link opens `/account` for customer details, abroad order history, and sign-out.
- Same Supabase project and Google provider as domestic. `auth.users` identities are shared. Abroad customer profile and order data stay in `abroad_customers` and `abroad_orders`.

## Setup
1. Execute the updated `supabase/abroad.sql` (safe for already-created tables, but if previous policies already exist note the original SELECT policies were not written with DROP IF EXISTS; run just the new policies at the end if schema already exists).
2. In Supabase dashboard, **Authentication → URL Configuration → Redirect URLs**, allow `https://abroad.godavaribasket.com/auth/callback` and `http://localhost:3000/auth/callback` during local testing. Keep the existing domestic URLs.
3. In Supabase **Authentication → Providers → Google**, reuse the existing provider configuration. Google's Authorized redirect URI should remain your Supabase `/auth/v1/callback` URL; add abroad URLs in Supabase, NOT as Google's redirect URI.
5. Test checkout signed-out and signed-in, Google OAuth from both localhost and abroad production domain, email signup, profile update, order history and logout.

## Limits
Source JSX was syntax checked but `npm install` and a full Next production build were not completed in this environment. Test before deploying to production.