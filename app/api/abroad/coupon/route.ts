import {NextRequest,NextResponse} from "next/server";
import {currentUser,validateCart} from "@/lib/abroad-order";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 try{
  if(!await currentUser(request))return NextResponse.json({error:"Please sign in to apply a coupon"},{status:401});
  const body=await request.json();
  const totals=await validateCart(body.lines,body.couponCode,{enforceMinimum:false});
  return NextResponse.json({couponCode:totals.coupon_code,discountUsd:totals.discount_usd,subtotalUsd:totals.subtotal_usd,transportUsd:totals.transport_usd,totalUsd:totals.total_usd,shipmentWeightKg:totals.shipment_weight_kg});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid coupon"},{status:400})}
}
