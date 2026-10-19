import {NextRequest,NextResponse} from "next/server";
import {currentUser,service} from "@/lib/abroad-order";
import {settlePayPalOrder} from "@/lib/paypal-abroad";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try {
 const user=await currentUser(request);if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
 const {orderId}=await request.json();if(!/^GBA-[A-Z0-9]{20}$/.test(String(orderId||"")))return NextResponse.json({error:"Invalid order"},{status:400});
 const db=service();const {data:order,error}=await db.from("abroad_orders").select("id,user_id,total_usd,payment_status,paid_at,paypal_order_id,checkout_method").eq("id",orderId).eq("user_id",user.id).single();
 if(error||!order)return NextResponse.json({error:"Order not found"},{status:404});
 if(order.checkout_method!=="PAYPAL")return NextResponse.json({error:"This is not a PayPal order"},{status:400});
 return NextResponse.json(await settlePayPalOrder(db,order,true));
 }catch(error){console.error("PayPal verification failed",error);return NextResponse.json({error:"Unable to confirm payment. Retry to check your saved order."},{status:500});}
}
