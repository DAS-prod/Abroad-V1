"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {useAbroadAuth} from "@/components/AuthProvider";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import Footer from "@/components/Footer";
import { useBox } from "@/components/BoxProvider";
import { formatUsd } from "@/data/usd";

import { getPayPalCheckoutFeeUsd } from "@/lib/paypal-checkout-fee";

export default function CheckoutPage() {
  const {
    lines,
    getBundle,
    clearBox,

    totalProductWeight,
    packagingWeight,
    totalWeight,

    totalUsd,

    minimumReached,
    remainingToMinimum,

    selectedCountry,
    giftMode,
  } = useBox();

  const router = useRouter();
  const {requireLogin,loading:userLoading}=useAbroadAuth();
  useEffect(()=>{if(!userLoading)void requireLogin('/checkout')},[userLoading,requireLogin]);
  const transportUsd = Math.round(totalWeight * 6 * 100) / 100;
  const [couponInput,setCouponInput]=useState("");
  const [appliedCoupon,setAppliedCoupon]=useState("");
  const [couponDiscount,setCouponDiscount]=useState(0);
  const [couponError,setCouponError]=useState("");
  const [couponLoading,setCouponLoading]=useState(false);
  const paypalFeeUsd = getPayPalCheckoutFeeUsd();
  useEffect(()=>{setAppliedCoupon("");setCouponDiscount(0);setCouponError("");},[lines,totalUsd]);
  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ======================================================
     ORDER LINES
  ====================================================== */

  const orderLines =
    useMemo(() => {
      return lines
        .map((line) => ({
          ...line,

          bundle:
            getBundle(
              line.bundleId
            ),
        }))
        .filter(
          (line) =>
            Boolean(
              line.bundle
            )
        );
    }, [
      lines,
      getBundle,
    ]);


  const applyCoupon=async()=>{
    setCouponError("");setCouponLoading(true);
    try{
      const {data}=await supabase.auth.getSession();
      const response=await fetch("/api/abroad/coupon",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session?.access_token||""}`},body:JSON.stringify({lines:lines.map(l=>({bundleId:l.bundleId,quantity:l.quantity})),couponCode:couponInput})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||"Coupon not valid");
      setAppliedCoupon(result.couponCode||"");setCouponDiscount(result.discountUsd||0);
    }catch(e){setAppliedCoupon("");setCouponDiscount(0);setCouponError(e instanceof Error?e.message:"Could not apply coupon");}
    finally{setCouponLoading(false)}
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    const method = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === "whatsapp" ? "whatsapp" : "paypal";
    event.preventDefault();setError("");
    if (!orderLines.length || !minimumReached) {setError("Please reach the 5 kg minimum before checkout.");return;}
    const form=new FormData(event.currentTarget);
    const address=Object.fromEntries(["name","phone","email","country","address1","address2","city","state","postal","notes"].map(key=>[key,String(form.get(key)||"").trim()]));
    if(!address.country)address.country=selectedCountry.name;
    setSending(true);
    try {
      const {data}=await supabase.auth.getSession();
      if(!data.session){await requireLogin('/checkout');setSending(false);return;}
      const response=await fetch(method === "whatsapp" ? "/api/abroad/whatsapp-order" : "/api/abroad/create-order",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({lines:lines.map(line=>({bundleId:line.bundleId,quantity:line.quantity})),address,giftMode,couponCode:appliedCoupon})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||"Unable to start checkout");
      if(method === "whatsapp") {
        if(!result.whatsappUrl)throw new Error("WhatsApp checkout could not be prepared");
        clearBox();
        window.location.assign(result.whatsappUrl);
        return;
      }
      if(!result.approvalUrl)throw new Error("PayPal checkout could not be prepared");
      window.location.assign(result.approvalUrl);
    } catch(err){setError(err instanceof Error?err.message:"Unable to start payment");setSending(false);}
  };

  return (
    <main className="subPage checkoutPage">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="checkoutHero">
        <div className="shell">

          <span className="eyebrow light">
            FINAL STEP
