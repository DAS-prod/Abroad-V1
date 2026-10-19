"use client";
import {Suspense,useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import {supabase} from "@/lib/supabase";
import Link from "next/link";
import {useBox} from "@/components/BoxProvider";
function ReturnPageContent(){const {clearBox}=useBox();const params=useSearchParams();const id=params.get("order_id");const [message,setMessage]=useState("Verifying your payment…");const [attempt,setAttempt]=useState(0);
 useEffect(()=>{if(params.get("cancelled")==="1" && attempt===0){setMessage("PayPal checkout was cancelled. Your cart is saved and no payment has been confirmed.");return;}if(!id){setMessage("Missing order reference");return;}let active=true;async function check(){try{const {data}=await supabase.auth.getSession();if(!data.session){setMessage("Please sign in again to verify your payment.");return;}const result=await fetch("/api/abroad/verify",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({orderId:id})});const json=await result.json();if(active && result.ok && json.paid) clearBox();if(active)setMessage(result.ok?(json.paid?"Payment confirmed. Thank you for your order!":"Payment not yet confirmed. Please check again shortly."):(json.error||"Verification unavailable"));}catch{if(active)setMessage("Verification unavailable. Your order is saved; please retry shortly.");}}check();return()=>{active=false};},[id,clearBox,attempt]);
 return <main className="subPage checkoutPage"><section className="section shell"><h1>Order status</h1><p>{message}</p><button className="goldButton" onClick={()=>setAttempt(n=>n+1)}>Check payment again</button><p>Order reference: {id}</p><Link className="goldButton" href="/checkout">Back to checkout</Link></section></main>}


export default function ReturnPage(){
  return (
    <Suspense fallback={<main className="subPage"><section className="section shell"><p>Loading…</p></section></main>}>
      <ReturnPageContent />
    </Suspense>
  );
}
