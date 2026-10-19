import {NextRequest,NextResponse} from "next/server";
import {paypal,settlePayPalOrder} from "@/lib/paypal-abroad";
import {service} from "@/lib/abroad-order";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try{
 const webhookId=process.env.PAYPAL_WEBHOOK_ID;
 if(!webhookId)return NextResponse.json({error:"Webhook is not configured"},{status:503});
 const body=await request.json();
 const names=["paypal-auth-algo","paypal-cert-url","paypal-transmission-id","paypal-transmission-sig","paypal-transmission-time"];
 if(names.some(name=>!request.headers.get(name)))return NextResponse.json({error:"Missing signature"},{status:401});
 const verification=await paypal("/v1/notifications/verify-webhook-signature",{method:"POST",body:JSON.stringify({auth_algo:request.headers.get(names[0]),cert_url:request.headers.get(names[1]),transmission_id:request.headers.get(names[2]),transmission_sig:request.headers.get(names[3]),transmission_time:request.headers.get(names[4]),webhook_id:webhookId,webhook_event:body})});
 if(verification.verification_status!=="SUCCESS")return NextResponse.json({error:"Invalid signature"},{status:401});
 if(!["CHECKOUT.ORDER.APPROVED","PAYMENT.CAPTURE.COMPLETED"].includes(body.event_type))return NextResponse.json({ok:true});
 const paypalId=body.event_type==="CHECKOUT.ORDER.APPROVED"?body.resource?.id:body.resource?.supplementary_data?.related_ids?.order_id;
 if(!paypalId)return NextResponse.json({error:"Missing payment reference"},{status:400});
 const db=service();const {data:order,error}=await db.from("abroad_orders").select("id,total_usd,payment_status,paid_at,paypal_order_id").eq("paypal_order_id",paypalId).eq("checkout_method","PAYPAL").maybeSingle();
 if(error)throw error;
 if(order){const result=await settlePayPalOrder(db,order,body.event_type==="CHECKOUT.ORDER.APPROVED");if(result.notificationPending)return NextResponse.json({error:"Payment confirmed; notification delivery needs retry"},{status:503});}
 return NextResponse.json({ok:true});
 }catch(error){console.error("PayPal webhook failed",error);return NextResponse.json({error:"Webhook processing failed"},{status:500});}
}
