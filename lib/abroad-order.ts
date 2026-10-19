import "server-only";
import {evaluateCoupon} from "./coupons";
import { createServerSupabase, createServiceSupabase } from "./supabase-server";
import { NextRequest } from "next/server";
export const service = createServiceSupabase;
export async function currentUser(req: NextRequest) {
 const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
 if (!token) return null;
 const {data, error} = await createServerSupabase(token).auth.getUser();
 return error ? null : data.user;
}
type CatalogItem = {id:string;name:string;priceUsd:number;weightKg:number;variants?:Array<{id:string;priceUsd:number;weightKg:number}>};
export async function validateCart(lines: Array<{bundleId:string;quantity:number}>, couponCode?:unknown, options?: { enforceMinimum?: boolean }) {
 if (!Array.isArray(lines) || !lines.length || lines.length > 100) throw new Error("Invalid cart");
 // Re-fetch the live server catalog. Never trust client-side prices or weights.
 const {GET} = await import("@/app/api/catalog/route");
 const response = await GET();
 if (!response.ok) throw new Error("Product catalog temporarily unavailable");
 const catalog = await response.json();
 const index = new Map<string,CatalogItem>();
 for (const item of [...(catalog.products || []), ...(catalog.bundles || []), ...(catalog.combos || [])] as CatalogItem[]) {
  index.set(item.id, item);
  for (const variant of item.variants || []) index.set(variant.id, {...item,id:variant.id,priceUsd:variant.priceUsd,weightKg:variant.weightKg});
 }
 let subtotal=0,weight=0;
 const items=lines.map(line=>{
  const q=Number(line.quantity), item=index.get(String(line.bundleId || "").trim());
  if (!item) throw new Error(`Product ${String(line.bundleId || "").slice(0,80)} is not in the current catalog. Please remove and re-add it to your cart.`);
  if (!Number.isSafeInteger(q) || q < 1 || q > 100) throw new Error("Product quantity must be between 1 and 100");
  if (!Number.isFinite(Number(item.priceUsd)) || Number(item.priceUsd) <= 0 || !Number.isFinite(Number(item.weightKg)) || Number(item.weightKg) <= 0) throw new Error(`Product ${item.name} has an invalid price or weight in the catalog`);
  subtotal+=Number(item.priceUsd)*q;weight+=Number(item.weightKg)*q;
  return {id:item.id,name:item.name,quantity:q,unit_price_usd:item.priceUsd,unit_weight_kg:item.weightKg};
 });
 const shipmentWeight=Math.round((weight+0.5)*100)/100;
 if (options?.enforceMinimum !== false && shipmentWeight < 5) throw new Error("Minimum shipment weight is 5 kg");
 const shipping=Math.round(shipmentWeight*6*100)/100;
 subtotal=Math.round(subtotal*100)/100;
 const coupon=await evaluateCoupon(couponCode,subtotal);
 const discount=coupon?.discount_usd || 0;
 return {items,weight_kg:weight,shipment_weight_kg:shipmentWeight,subtotal_usd:subtotal,transport_usd:shipping,discount_usd:discount,coupon_code:coupon?.code || null,total_usd:Math.round((subtotal-discount+shipping)*100)/100};
}
