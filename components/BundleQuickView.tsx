"use client";

import { Bundle } from "@/data/catalog";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Price from "./Price";
import { useBox } from "./BoxProvider";

function getItemParts(item: string) {
  const match = item.match(
    /^(.*?)\s*\((\d+(?:\.\d+)?\s*(?:kg|g|gm|pieces?|pcs))\)\s*$/i
  );

  return {
    name: match ? match[1].trim() : item,
    weight: match ? match[2].replace(/\s+/g, "") : "",
  };
}

export default function BundleQuickView({
  bundle,
  onClose,
}: {
  bundle: Bundle;
  onClose: () => void;
}) {
  const { addBundle, decrementBundle, getQuantity } = useBox();
  const [mounted, setMounted] = useState(false);

  const quantity = getQuantity(bundle.id);
  const isIndividualProduct = bundle.catalogType === "product";

  useEffect(() => {
    setMounted(true);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="quickViewLayer"
      role="dialog"
      aria-modal="true"
      aria-label={`${bundle.name} details`}
      style={{ zIndex: 10000 }}
    >
      <button
        type="button"
        className="quickViewBackdrop"
        onClick={onClose}
        aria-label="Close product details"
      />

      <section className="quickViewPanel">
        <div className="quickViewImageWrap">
          <img src={bundle.image} alt={bundle.name} />

          {bundle.popular && (
            <span className="pill">Most loved</span>
          )}

          <button
            type="button"
            className="quickViewClose"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="quickViewBody">
          <span className="eyebrow">
            {bundle.items.length} ITEMS ·{" "}
            {bundle.weightKg.toFixed(1)} KG BUNDLE
          </span>

          <h2>{bundle.name}</h2>

          <p className="quickViewSubtitle">
            {bundle.subtitle}
          </p>
