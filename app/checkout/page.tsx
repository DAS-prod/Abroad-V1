"use client";

import Link from "next/link";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import Footer from "@/components/Footer";
import Price from "@/components/Price";
import { useBox } from "@/components/BoxProvider";

export default function CheckoutPage() {
  const {
    lines,
    getBundle,

    totalProductWeight,
    packagingWeight,
    totalWeight,

    totalInr,

    minimumReached,
    remainingToMinimum,

    selectedCountry,
    giftMode,
  } = useBox();

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

  /* ======================================================
     SUBMIT TO WHATSAPP
  ====================================================== */

  const submit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    /* EMPTY CART */

    if (
      !orderLines.length
    ) {
      setError(
        "Your box is empty. Please add bundles before continuing."
      );

      return;
    }

    /* 5 KG MINIMUM */

    if (
      !minimumReached
    ) {
      setError(
        `Please add ${remainingToMinimum.toFixed(
          1
        )} kg more to reach the 5 kg minimum.`
      );

      return;
    }

    const formElement =
      event.currentTarget;

    /*
     * Let browser handle
     * required-field validation.
     */

    if (
      !formElement.checkValidity()
    ) {
      formElement.reportValidity();

      return;
    }

    setSending(true);

    const form =
      new FormData(
        formElement
      );

    /* ====================================================
       CUSTOMER DETAILS
    ==================================================== */

    const details = {
      name: String(
        form.get("name") ||
          ""
      ).trim(),

      phone: String(
        form.get("phone") ||
          ""
      ).trim(),

      email: String(
        form.get("email") ||
          ""
      ).trim(),

      country: String(
        form.get("country") ||
          selectedCountry.name
      ).trim(),

      address1: String(
        form.get("address1") ||
          ""
      ).trim(),

      address2: String(
        form.get("address2") ||
          ""
      ).trim(),

      city: String(
        form.get("city") ||
          ""
      ).trim(),

      state: String(
        form.get("state") ||
          ""
      ).trim(),

      postal: String(
        form.get("postal") ||
          ""
      ).trim(),

      notes: String(
        form.get("notes") ||
          ""
      ).trim(),
    };

    /* ====================================================
       ITEMS FOR WHATSAPP
    ==================================================== */

    const itemsText =
      orderLines
        .map(
          (
            line,
            index
          ) => {
            const bundle =
              line.bundle!;

            const lineWeight =
              bundle.weightKg *
              line.quantity;

            const lineTotal =
              bundle.priceInr *
              line.quantity;

            return [
              `${index + 1}. ${bundle.name}`,

              `Quantity: ${line.quantity}`,

              `Weight: ${lineWeight.toFixed(
                1
              )} kg`,

              `Amount: INR ${lineTotal}`,

              `Includes: ${
                bundle.items.join(
                  ", "
                ) ||
                "As listed in catalog"
              }`,
            ].join(
              "\n"
            );
          }
        )
        .join(
          "\n\n"
        );

    /* ====================================================
       WHATSAPP ORDER MESSAGE
    ==================================================== */

    const message = [
      "Hi Godavari Basket! 👋",

      "",

      "I would like to continue with this Godavari Basket Abroad order.",

      "",

      "🧺 ORDER DETAILS",

      "",

      itemsText,

      "",

      "──────────────",

      "",

      `Product weight: ${totalProductWeight.toFixed(
        1
      )} kg`,

      `Packaging weight: ${packagingWeight.toFixed(
        1
      )} kg`,

      `Total shipment weight: ${totalWeight.toFixed(
        1
      )} kg`,

      "",

      `Bundle subtotal: INR ${Math.round(
        totalInr
      ).toLocaleString()}`,

      "Transport: Please confirm on WhatsApp",

      "Final total: Please confirm on WhatsApp",

      "",

      `Gift order: ${
        giftMode
          ? "Yes"
          : "No"
      }`,

      "",

      "👤 CUSTOMER DETAILS",

      "",

      `Name: ${details.name}`,

      `WhatsApp / Mobile: ${details.phone}`,

      `Email: ${
        details.email ||
        "-"
      }`,

      `Country: ${details.country}`,

      "",

      "📍 DELIVERY ADDRESS",

      "",

      [
        details.address1,
        details.address2,
        details.city,
        details.state,
        details.postal,
      ]
        .filter(
          Boolean
        )
        .join(
          ", "
        ),

      "",

      `Notes: ${
        details.notes ||
        "-"
      }`,

      "",

      "Please confirm availability, final packing and payment details.",

      "",

      "Thank you.",
    ].join(
      "\n"
    );

    /* ====================================================
       WHATSAPP NUMBER
    ==================================================== */

    const rawNumber =
      process.env
        .NEXT_PUBLIC_WHATSAPP_NUMBER ||
      "919618851406";

    const whatsappNumber =
      rawNumber.replace(
        /\D/g,
        ""
      );

    if (
      !whatsappNumber
    ) {
      setSending(
        false
      );

      setError(
        "WhatsApp checkout is temporarily unavailable. Please contact Godavari Basket directly."
      );

      return;
    }

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}` +
      `?text=${encodeURIComponent(
        message
      )}`;

    /*
     * Reliable mobile handoff.
     */

    window.location.href =
      whatsappUrl;
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
            then continue securely
            with our team on
            WhatsApp.
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
                        <Price
                          inr={
                            bundle.priceInr *
                            line.quantity
                          }
                        />
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
                We'll use these
                details to continue
                the order with you
                on WhatsApp.
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
                  Email
                </span>

                <input
                  name="email"
                  type="email"
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

            {/* =============================================
                WHATSAPP CHECKOUT
            ============================================= */}

            <button
              className="whatsappCheckout"
              type="submit"
              disabled={
                !minimumReached ||
                !orderLines.length ||
                sending
              }
            >

              <span>
                {sending
                  ? "Opening WhatsApp…"
                  : "Continue order on WhatsApp"}
              </span>

              <b>
                →
              </b>

            </button>

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
                Bundle subtotal
              </span>

              <b>
                <Price
                  inr={
                    totalInr
                  }
                />
              </b>
            </p>

            {orderLines.length > 0 && (
              <p>
                <span>Transport</span>
                <b>Confirmed on WhatsApp</b>
              </p>
            )}

          </div>

          {/* ===============================================
              TRANSPORT NOTE
          =============================================== */}

          <p className="checkoutNote">
            Transport charges, final packing, availability and payment
            will be confirmed with you on WhatsApp.
          </p>

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
