/** Fixed additional checkout charge, in USD, applied only to PayPal.
 * Set enabled=false to remove the fee from both checkout and the order API.
 * Rebuild/redeploy after changing this setting. Do not delete this module.
 * IMPORTANT: PayPal India prohibits payment-method surcharges. This setting
 * is enabled at the merchant's explicit request; obtain applicable written
 * approval before deploying it live. This is not PayPal's processing rate.
 */
export const PAYPAL_CHECKOUT_FEE = Object.freeze({ enabled: true, amountUsd: 3 });
export function getPayPalCheckoutFeeUsd(): number {
  return PAYPAL_CHECKOUT_FEE.enabled ? PAYPAL_CHECKOUT_FEE.amountUsd : 0;
}
export function getPayPalCheckoutTotalUsd(baseTotalUsd: number): number {
  return Math.round((baseTotalUsd + getPayPalCheckoutFeeUsd()) * 100) / 100;
}
