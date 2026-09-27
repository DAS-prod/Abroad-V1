"use client";

import { useBox } from "./BoxProvider";

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3a8.5 8.5 0 1 1 15.6-4.6Z"/><path d="M8.2 7.7c.2-.5.5-.5.8-.5h.6c.2 0 .4 0 .6.5l.8 1.9c.1.3.1.5-.1.8l-.6.8c-.2.2-.2.4 0 .7.7 1.2 1.7 2.1 2.9 2.8.3.2.5.1.7-.1l.9-1.1c.2-.3.5-.3.8-.2l1.8.9c.3.1.5.3.5.5 0 .3-.1 1.5-1 2.2-.7.6-1.6.8-2.6.6-1.1-.2-2.5-.7-4.2-2.2-1.4-1.2-2.4-2.7-2.8-3.4-.4-.7-1.7-3.1-.1-5.2Z"/></svg>;
}

export default function WhatsAppButton() {
  const { lines, getBundle, totalProductWeight, totalWeight, selectedBoxKg, selectedCountry } = useBox();
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (!number) return null;

  const bundleList = lines.map((line) => {
    const bundle = getBundle(line.bundleId);
    return bundle ? `${bundle.name} x${line.quantity}` : null;
  }).filter(Boolean).join(", ");

  const text = encodeURIComponent([
    "Hi Godavari Basket, I need help customizing my Godavari Basket Abroad box.",
    `Destination: ${selectedCountry.name}`,
    `Target: ${selectedBoxKg} kg`,
    `Current bundles: ${bundleList || "Not selected yet"}`,
    `Products: ${totalProductWeight.toFixed(1)} kg`,
    `Shipment weight: ${totalWeight.toFixed(1)} kg`,
    "Please confirm transport charges on WhatsApp"
  ].join("\n"));

  return <a className="whatsapp" href={`https://wa.me/${number}?text=${text}`} target="_blank" rel="noreferrer"><b className="whatsappMark"><WhatsAppIcon /></b><span><small>Need a custom mix?</small>Godavari Concierge</span></a>;
}
