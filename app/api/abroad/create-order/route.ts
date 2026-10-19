import { NextRequest,NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentUser,service,validateCart } from "@/lib/abroad-order";
import { countries } from "@/data/catalog";
import { paypal } from "@/lib/paypal-abroad";
import { getPayPalCheckoutFeeUsd, getPayPalCheckoutTotalUsd } from "@/lib/paypal-checkout-fee";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try {
 const user=await currentUser(request);
 if(!user) return NextResponse.json({error:"Please sign in before checkout"},{status:401});
 const body=await request.json();const address=body.address || {};
 for(const key of ["name","phone","email","country","address1","city","state","postal"]){if(!String(address[key]||"").trim())return NextResponse.json({error:`Missing ${key}`},{status:400});}
 if(String(address.email).toLowerCase() !== String(user.email||"").toLowerCase()) return NextResponse.json({error:"Use your signed-in email for checkout"},{status:400});
 const country=countries.find(c=>c.name===address.country || c.code===address.country);
 if(!country)return NextResponse.json({error:"Unsupported destination country"},{status:400});
 const totals=await validateCart(body.lines,body.couponCode);
 const paymentFeeUsd = getPayPalCheckoutFeeUsd();
 totals.total_usd = getPayPalCheckoutTotalUsd(totals.total_usd);
 const orderId=`GBA-${randomUUID().replace(/-/g,"").slice(0,20).toUpperCase()}`;
 const db=service();
 const {error:profileError}=await db.from("abroad_customers").upsert({user_id:user.id,email:user.email,full_name:String(address.name),phone:String(address.phone),updated_at:new Date().toISOString()},{onConflict:"user_id"});
 if(profileError)throw new Error(`Customer save failed: ${profileError.message}`);
 const {error:insertError}=await db.from("abroad_orders").insert({id:orderId,user_id:user.id,email:user.email,address,items:totals.items,country:address.country,subtotal_usd:totals.subtotal_usd,discount_usd:totals.discount_usd,coupon_code:totals.coupon_code,transport_usd:totals.transport_usd,payment_fee_usd:paymentFeeUsd,total_usd:totals.total_usd,shipment_weight_kg:totals.shipment_weight_kg,payment_status:"PENDING",checkout_method:"PAYPAL",gift_mode:!!body.giftMode});
 if(insertError)throw new Error(`Order save failed: ${insertError.message}`);
 const origin=process.env.APP_URL || request.nextUrl.origin;
 const payment=await paypal("/v2/checkout/orders",{method:"POST",headers:{"PayPal-Request-Id":`create-${orderId}`},body:JSON.stringify({intent:"CAPTURE",purchase_units:[{reference_id:orderId,custom_id:orderId,invoice_id:orderId,description:"Godavari Basket Abroad",shipping:{name:{full_name:address.name},address:{address_line_1:address.address1,...(address.address2?{address_line_2:address.address2}:{}),admin_area_2:address.city,admin_area_1:address.state,postal_code:address.postal,country_code:country.code}},amount:{currency_code:"USD",value:totals.total_usd.toFixed(2)}}],payment_source:{paypal:{experience_context:{brand_name:"Godavari Basket",user_action:"PAY_NOW",shipping_preference:"SET_PROVIDED_ADDRESS",return_url:`${origin}/checkout/return?order_id=${encodeURIComponent(orderId)}`,cancel_url:`${origin}/checkout/return?order_id=${encodeURIComponent(orderId)}&cancelled=1`}}}})});
 const approval=payment.links?.find((link:any)=>link.rel==="payer-action" || link.rel==="approve")?.href;
 if(!payment.id || !approval)throw new Error("PayPal did not return an approval link");
 const {error:updateError}=await db.from("abroad_orders").update({paypal_order_id:payment.id}).eq("id",orderId);
 if(updateError)throw new Error(`PayPal reference save failed: ${updateError.message}`);
 return NextResponse.json({orderId,approvalUrl:approval});
 }catch(error){console.error("Abroad payment creation failed",error);return NextResponse.json({error:error instanceof Error?error.message:"Unable to initiate payment"},{status:500});}
}
