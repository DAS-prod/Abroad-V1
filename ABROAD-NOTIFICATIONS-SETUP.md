# Abroad Firebase admin notifications — rollout

The existing Firebase project and admin devices are reused. No new Firebase project is needed and no Firebase secret is added to the storefront.

1. Run supabase/abroad-notifications-migration.sql ONCE in the shared Supabase SQL Editor. Identical copies are supplied in both projects. It creates only abroad_notification_logs and a service-role-only claim function; domestic notification tables are unchanged. Run the earlier abroad-admin-migration.sql if it has not been applied.
2. Deploy the updated Admin project to https://admin-gb.vercel.app. Keep all existing Supabase and Firebase variables. Keep ADMIN_PUSH_WEBHOOK_SECRET at its existing value so domestic integration still matches. If it is absent, generate a strong random secret and configure every caller consistently.
3. In the Abroad Vercel project, add these SERVER-ONLY variables:
   ADMIN_PUSH_WEBHOOK_URL=https://admin-gb.vercel.app/api/admin/push/abroad-order
   ADMIN_PUSH_WEBHOOK_SECRET=<the identical secret from the admin project>
   Keep existing PayPal/Supabase/catalog variables and the actual storefront APP_URL.
4. Deploy the updated Abroad project. Keep its existing PayPal webhook registered for CHECKOUT.ORDER.APPROVED and PAYMENT.CAPTURE.COMPLETED.
5. On each phone/browser, open https://admin-gb.vercel.app/admin, sign in, choose Abroad > Notifications and click Enable on this device. Allow notifications and send a test. Devices already enabled on this admin domain can be reused. Desktop Chrome/Android support web push; iPhone/iPad generally require the site added to the Home Screen and opened there before enabling notifications.
6. Test a PayPal Sandbox payment and a WhatsApp checkout before relying on alerts. The payment test sends a real alert to registered admin devices even when PayPal is Sandbox.

Expected events:
- PayPal: alert only after server-confirmed PAID status, displaying USD.
- WhatsApp: alert after the saved order, clearly saying Payment pending. This does not prove the customer sent the WhatsApp message or paid.
- Opening a notification selects Abroad in the admin dashboard. Foreground events show a toast and refresh data, and show an OS notification when browser permission is granted. Background delivery is handled by the existing Firebase worker.

Reliability:
Notification failures do not reverse successful payment or stop WhatsApp checkout. Events are queued before the remote call. PayPal retries a webhook that returns an error after notification failure; pending WhatsApp/other events can be retried with the admin button Retry pending abroad alerts (20 events per click). There is no scheduled dispatcher in this change. An atomic lease prevents concurrent sends; successful device IDs are recorded so retries normally skip devices already notified. Exactly-once delivery is not guaranteed if a process crashes between Firebase accepting a message and recording delivery. Notifications sent before all devices were registered are not replayed to newly registered devices.

Troubleshooting:
- 401 on the new push endpoint: secrets differ.
- missing table/function: notification SQL has not been run.
- no devices: enable notifications on the admin domain and verify Firebase public/VAPID values.
- FCM credential errors: check the ADMIN project's existing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.
- Do not remove or expose Firebase service-account secrets or Supabase service-role keys.
