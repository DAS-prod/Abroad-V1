"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useBox } from "./BoxProvider";

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="26"
      height="26"
      aria-hidden="true"
      style={{
        display: "block",
        fill: "currentColor",
      }}
    >
      <path d="M16.04 3C9.39 3 4 8.28 4 14.79c0 2.3.68 4.55 1.97 6.47L4 28l7.02-1.82a12.22 12.22 0 0 0 5.01 1.07h.01c6.64 0 12.04-5.28 12.04-11.78C28.08 8.96 22.68 3 16.04 3Zm0 21.99a9.95 9.95 0 0 1-5.07-1.39l-.36-.21-4.17 1.08 1.11-4.05-.24-.38a9.46 9.46 0 0 1-1.54-5.17c0-5.24 4.36-9.5 9.72-9.5s9.72 4.26 9.72 9.5-4.36 10.12-9.17 10.12Zm5.33-7.57c-.29-.14-1.72-.83-1.99-.93-.27-.09-.46-.14-.66.14-.19.28-.75.93-.92 1.12-.17.19-.34.21-.63.07-.29-.14-1.23-.44-2.34-1.42a8.61 8.61 0 0 1-1.62-1.98c-.17-.28-.02-.43.13-.57.13-.13.29-.33.44-.5.14-.16.19-.28.29-.47.1-.19.05-.35-.02-.5-.07-.14-.66-1.55-.9-2.12-.24-.57-.48-.49-.66-.5h-.56c-.19 0-.51.07-.78.35-.27.28-1.02.98-1.02 2.38 0 1.4 1.04 2.76 1.18 2.95.15.19 2.05 3.07 4.97 4.31.69.29 1.23.46 1.65.59.69.21 1.32.18 1.82.11.56-.08 1.72-.69 1.96-1.35.24-.66.24-1.23.17-1.35-.07-.12-.27-.19-.56-.33Z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const { drawerOpen } = useBox();

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
    "919618851406";

  const number = rawNumber.replace(/\D/g, "");

  const message =
    "Hi Godavari Basket, I would like to know more about your abroad orders.";

  const whatsappUrl =
    `https://wa.me/${number}` +
    `?text=${encodeURIComponent(message)}`;

  /*
   * Hide WhatsApp when:
   *
   * 1. Cart drawer is open
   * 2. Customer is on checkout page
   * 3. Customer is on /cart page if you add one later
   */
  const hideWhatsApp =
    drawerOpen ||
    pathname === "/checkout" ||
    pathname?.startsWith("/checkout/") ||
    pathname === "/cart" ||
    pathname?.startsWith("/cart/");

  if (!mounted || hideWhatsApp) {
    return null;
  }

  return createPortal(
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Godavari Basket on WhatsApp"
      title="Chat on WhatsApp"
      style={{
        position: "fixed",

        right: "18px",
        bottom: "92px",

        width: "46px",
        height: "46px",

        borderRadius: "50%",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        background: "#122519",
        color: "#ffffff",

        border: "1px solid rgba(255,255,255,0.14)",

        textDecoration: "none",

        boxShadow: "0 8px 20px rgba(0,0,0,0.20)",

        zIndex: 9998,

        opacity: 1,
        visibility: "visible",
        pointerEvents: "auto",

        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          "translateY(-2px) scale(1.04)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          "translateY(0) scale(1)";
      }}
    >
      <WhatsAppIcon />
    </a>,
    document.body
  );
}
