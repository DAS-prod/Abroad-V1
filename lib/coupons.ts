import "server-only";
import { createServiceSupabase } from "./supabase-server";

export type AppliedCoupon = {code:string;discount_usd:number;percent:number};
export async function evaluateCoupon(codeInput:unknown, subtotal:number):Promise<AppliedCoupon|null>{
 const code=String(codeInput || "").trim().toUpperCase();
 if(!code)return null;
 if(!/^[A-Z0-9_-]{3,32}$/.test(code))throw new Error("Invalid coupon code");
 const {data,error}=await createServiceSupabase().from("abroad_coupons")
  .select("code,percent_off,min_subtotal_usd,max_discount_usd,active,starts_at,expires_at,usage_limit,used_count")
  .eq("code",code).maybeSingle();
 if(error)throw new Error("Coupon service unavailable. Check the coupon SQL setup.");
 if(!data || !data.active)throw new Error("Coupon not found or inactive");
 const now=Date.now();
 if(data.starts_at && Date.parse(data.starts_at)>now)throw new Error("Coupon is not yet active");
 if(data.expires_at && Date.parse(data.expires_at)<now)throw new Error("Coupon has expired");
 if(data.usage_limit !== null && data.used_count >= data.usage_limit)throw new Error("Coupon redemption limit reached");
 if(subtotal < Number(data.min_subtotal_usd))throw new Error(`Minimum product subtotal is $${Number(data.min_subtotal_usd).toFixed(2)}`);
 const percent=Number(data.percent_off);
 const raw=subtotal*percent/100;
 const discount=Math.min(raw,data.max_discount_usd === null ? raw : Number(data.max_discount_usd),subtotal);
 return {code,percent,discount_usd:Math.round(discount*100)/100};
}
