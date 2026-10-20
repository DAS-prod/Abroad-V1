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
          </span>

          <h1>
            Your Godavari Box,
            <br />

            <em>
              ready to continue.
            </em>
          </h1>

          <p>
            Review your bundles,
            add delivery details,
            then pay securely or continue on WhatsApp.
          </p>

        </div>
      </section>

      {/* ==================================================
          CHECKOUT AREA
      ================================================== */}

      <section className="section shell checkoutLayout">

        {/* =================================================
            LEFT
        ================================================= */}

        <div className="checkoutMain">

          {/* ===============================================
              CART REVIEW
          =============================================== */}

          <div className="checkoutSectionHead">

            <span className="eyebrow">
              YOUR BOX
            </span>

            <h2>
              Review your selection
            </h2>

          </div>

          {!orderLines.length ? (
            <div className="checkoutEmpty">

              <h3>
                Your box is empty.
              </h3>

              <p>
                Choose your
                Godavari bundles
                before checkout.
              </p>

              <Link
                className="goldButton"
                href="/build"
              >
                Build your box

                <span>
                  →
                </span>
              </Link>

            </div>
          ) : (
            <div className="checkoutItems">

              {orderLines.map(
                (line) => {
                  const bundle =
                    line.bundle!;

                  return (
                    <article
                      key={
                        line.bundleId
                      }
                    >

                      <img
                        src={
                          bundle.image
                        }
                        alt={
                          bundle.name
                        }
                      />

                      <div>

                        <h3>
                          {
                            bundle.name
                          }
                        </h3>

                        <p>
                          {bundle.items
                            .slice(
                              0,
                              4
                            )
                            .join(
                              " · "
                            )}
                        </p>

                        <small>
                          {
                            bundle.weightKg
                          }{" "}
                          kg ×{" "}
                          {
                            line.quantity
                          }{" "}
                          ={" "}
                          {(
                            bundle.weightKg *
                            line.quantity
                          ).toFixed(
                            1
                          )}{" "}
                          kg
                        </small>

                      </div>

                      <strong>
                        {formatUsd(bundle.priceUsd * line.quantity)}
                      </strong>

                    </article>
                  );
                }
              )}

            </div>
          )}

          {/* ===============================================
              CUSTOMER DETAILS FORM
          =============================================== */}

          <form
            className="checkoutForm"
            onSubmit={submit}
          >

            <div className="checkoutSectionHead">

              <span className="eyebrow">
                YOUR DETAILS
              </span>

              <h2>
                Where is this box
                going?
              </h2>

              <p>
                We'll use these details for delivery and payment confirmation.
              </p>

            </div>

            <div className="formGrid">

              {/* NAME */}

              <label>

                <span>
                  Full name *
                </span>

                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                />

              </label>

              {/* PHONE */}

              <label>

                <span>
                  WhatsApp /
                  Mobile *
                </span>

                <input
                  name="phone"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="Country code + number"
                />

              </label>

              {/* EMAIL */}

              <label className="full">

                <span>
                  Email *
                </span>

                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />

              </label>

              {/* COUNTRY */}

              <label>

                <span>
                  Country *
                </span>

                <input
                  name="country"
                  required
                  defaultValue={
                    selectedCountry.name
                  }
                  autoComplete="country-name"
                />

              </label>

              {/* POSTAL */}

              <label>

                <span>
                  Postal / ZIP code *
                </span>

                <input
                  name="postal"
                  required
                  autoComplete="postal-code"
                />

              </label>

              {/* ADDRESS 1 */}

              <label className="full">

                <span>
                  Address line 1 *
                </span>

                <input
                  name="address1"
                  required
                  autoComplete="address-line1"
                />

              </label>

              {/* ADDRESS 2 */}

              <label className="full">

                <span>
                  Address line 2
                </span>

                <input
                  name="address2"
                  autoComplete="address-line2"
                />

              </label>

              {/* CITY */}

              <label>

                <span>
                  City *
                </span>

                <input
                  name="city"
                  required
                  autoComplete="address-level2"
                />

              </label>

              {/* STATE */}

              <label>

                <span>
                  State / Region *
                </span>

                <input
                  name="state"
                  required
                  autoComplete="address-level1"
                />

              </label>

              {/* NOTES */}

              <label className="full">

                <span>
                  Order notes
                </span>

                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Anything we should know about this order?"
                />

              </label>

            </div>

            {/* =============================================
                ERROR
            ============================================= */}

            {error && (
              <p className="checkoutWarning">
                {error}
              </p>
            )}

            <div className="abroadCheckoutActions" aria-label="Choose checkout method">
              <button className="whatsappCheckout" type="submit" value="paypal"
                disabled={!minimumReached || !orderLines.length || sending}>
                <span className="checkoutButtonText"><strong>{sending ? "Preparing your order…" : "Pay with PayPal"}</strong><small>{paypalFeeUsd > 0 ? `Includes a ${formatUsd(paypalFeeUsd)} checkout charge` : "Secure online payment"}</small></span><b>↗</b>
              </button>
              <button className="abroadWhatsAppCheckout" type="submit" value="whatsapp"
                disabled={!minimumReached || !orderLines.length || sending}>
                <span className="checkoutButtonText"><strong>Continue with WhatsApp</strong><small>No extra checkout charge</small></span><b>↗</b>
              </button>

            </div>

            {!minimumReached &&
              orderLines.length >
                0 && (
                <p className="checkoutWarning">

                  Add{" "}

                  {remainingToMinimum.toFixed(
                    1
                  )}{" "}

                  kg more to reach
                  the 5 kg minimum.

                </p>
              )}

          </form>

        </div>

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <aside className="checkoutSummary">

          <span className="eyebrow">
            ORDER SUMMARY
          </span>

          <h3>
            Your Godavari Box
          </h3>

          <div className="summaryRows">

            {/* BUNDLE COUNT */}

            <p>
              <span>
                Bundles
              </span>

              <b>
                {lines.reduce(
                  (
                    sum,
                    line
                  ) =>
                    sum +
                    line.quantity,
                  0
                )}
              </b>
            </p>

            {/* PRODUCT WEIGHT */}

            <p>
              <span>
                Products
              </span>

              <b>
                {totalProductWeight.toFixed(
                  1
                )}{" "}
                kg
              </b>
            </p>

            {/* PACKAGING */}

            <p>
              <span>
                Packaging
              </span>

              <b>
                {packagingWeight.toFixed(
                  1
                )}{" "}
                kg
              </b>
            </p>

            {/* SHIPMENT WEIGHT */}

            <p>
              <span>
                Shipment weight
              </span>

              <b>
                {totalWeight.toFixed(
                  1
                )}{" "}
                kg
              </b>
            </p>

            {/*
              MINIMUM / REACHED ROW
              REMOVED FROM SUMMARY
            */}

            {/* BUNDLE SUBTOTAL */}

            <p>
              <span>
                Product subtotal
              </span>

              <b>
                {formatUsd(totalUsd)}
              </b>
            </p>

            {appliedCoupon && <p className="couponSaving"><span>Coupon ({appliedCoupon})</span><b>−{formatUsd(couponDiscount)}</b></p>}
            {orderLines.length > 0 && (
              <p>
                <span>Transport</span>
                <b>{formatUsd(transportUsd)}</b>
              </p>
            )}

          </div>

          {/* ===============================================
              TRANSPORT NOTE
          =============================================== */}

          <div className="couponPanel"><label htmlFor="abroad-coupon">Have a coupon?</label>
            <div className="couponInputRow"><input id="abroad-coupon" value={couponInput} placeholder="Enter coupon code" maxLength={32} onChange={e=>setCouponInput(e.target.value.toUpperCase())}/>
              <button type="button" disabled={couponLoading||!couponInput.trim()||!orderLines.length} onClick={()=>void applyCoupon()}>{couponLoading?"Checking…":"Apply"}</button></div>
            {couponError&&<p role="alert" className="couponError">{couponError}</p>}
            {appliedCoupon&&<p className="couponSuccess">{appliedCoupon} applied to products only. <button type="button" onClick={()=>{setAppliedCoupon("");setCouponDiscount(0);setCouponInput("")}}>Remove</button></p>}
          </div>
          <p className="checkoutWeightTotal">Total shipping weight <strong>{totalWeight.toFixed(2)} kg</strong></p>

          {/* ===============================================
              CONTINUE SHOPPING
          =============================================== */}

          <Link
            className="checkoutEdit"
            href="/build"
          >
            ← Continue shopping
          </Link>

        </aside>

      </section>

      <Footer />

    </main>
  );
}
