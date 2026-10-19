import "server-only";
import {notifyAbroadOrder} from "./abroad-notifications";
const base = () => process.env.PAYPAL_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
export async function paypal(path: string, options: RequestInit = {}) {
 const id=process.env.PAYPAL_CLIENT_ID, secret=process.env.PAYPAL_CLIENT_SECRET;
 if(!id || !secret) throw new Error("PayPal merchant credentials are not configured");
 const tokenResponse=await fetch(base()+"/v1/oauth2/token",{method:"POST",cache:"no-store",headers:{Authorization:`Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials"});
 const token=await tokenResponse.json();
 if(!tokenResponse.ok || !token.access_token)throw new Error("Unable to authenticate with PayPal. Check your credentials and environment.");
 const response=await fetch(base()+path,{...options,cache:"no-store",headers:{Authorization:`Bearer ${token.access_token}`,"Content-Type":"application/json",...options.headers}});
 const result=await response.json();
 if(!response.ok)throw new Error(`PayPal request failed (${response.status}): ${result.details?.[0]?.issue || result.name || "unknown error"}`);
 return result;
}
export function confirmedCapture(payment:any, order:any) {
 const units=payment.purchase_units;
 if(payment.id!==order.paypal_order_id || payment.status!=="COMPLETED" || !Array.isArray(units) || units.length!==1)return null;
 const unit=units[0], captures=unit.payments?.captures;
 if(unit.custom_id!==order.id || !Array.isArray(captures) || captures.length!==1)return null;
 const capture=captures[0];
 return capture.status==="COMPLETED" && capture.amount?.currency_code==="USD" && Math.round(Number(capture.amount.value)*100)===Math.round(Number(order.total_usd)*100) ? capture : null;
}
export async function settlePayPalOrder(db:any, order:any, captureApproved=false) {
 if(!order.paypal_order_id)throw new Error("No PayPal payment is linked to this order");
 let payment=await paypal(`/v2/checkout/orders/${encodeURIComponent(order.paypal_order_id)}`);
 if(captureApproved && payment.status==="APPROVED") {
  try {payment=await paypal(`/v2/checkout/orders/${encodeURIComponent(order.paypal_order_id)}/capture`,{method:"POST",headers:{"PayPal-Request-Id":`capture-${order.id}`},body:"{}"});}
  catch(error){payment=await paypal(`/v2/checkout/orders/${encodeURIComponent(order.paypal_order_id)}`);if(payment.status!=="COMPLETED")throw error;}
 }
 if(payment.status==="COMPLETED")payment=await paypal(`/v2/checkout/orders/${encodeURIComponent(order.paypal_order_id)}`);
 const capture=confirmedCapture(payment,order);
 if(capture){const {error}=await db.from("abroad_orders").update({payment_status:"PAID",paypal_capture_id:capture.id,paid_at:order.paid_at || new Date().toISOString()}).eq("id",order.id).eq("paypal_order_id",order.paypal_order_id).eq("payment_status","PENDING");if(error)throw error;}
 const notificationPending=capture ? !(await notifyAbroadOrder(order.id,"abroad_order_paid")) : false;
 return {paid:!!capture,status:capture?"PAID":payment.status,notificationPending};
}
