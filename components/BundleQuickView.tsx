"use client";

import { Bundle } from "@/data/catalog";
import { useEffect } from "react";
import Price from "./Price";
import { useBox } from "./BoxProvider";

export default function BundleQuickView({ bundle, onClose }: { bundle: Bundle; onClose: () => void }) {
  const { addBundle, decrementBundle, getQuantity } = useBox();
  const quantity = getQuantity(bundle.id);
  const isIndividualProduct = bundle.catalogType === "product";

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="quickViewLayer" role="dialog" aria-modal="true" aria-label={`${bundle.name} details`}>
      <button className="quickViewBackdrop" onClick={onClose} aria-label="Close bundle details" />
      <section className="quickViewPanel">
        <div className="quickViewImageWrap">
          <img src={bundle.image} alt={bundle.name} />
          {bundle.popular && <span className="pill">Most loved</span>}
          <button className="quickViewClose" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="quickViewBody">
          <span className="eyebrow">{bundle.items.length} ITEMS · {bundle.weightKg.toFixed(1)} KG BUNDLE</span>
          <h2>{bundle.name}</h2>
          <p className="quickViewSubtitle">{bundle.subtitle}</p>

          <div className="quickViewPriceRow">
            <strong><Price inr={bundle.priceInr} /></strong>
            <span>{bundle.weightKg.toFixed(1)} kg products</span>
          </div>

          {(!isIndividualProduct || bundle.items.some((item) => item !== bundle.name)) && <div className="quickViewInside">
            <div className="quickViewSectionHead">
              <div><span className="eyebrow">{isIndividualProduct ? "PRODUCT DETAILS" : "WHAT'S INSIDE"}</span><h3>{isIndividualProduct ? "About this product" : "Curated in this bundle"}</h3></div>
              <small>{bundle.items.length} products</small>
            </div>
            <div className="quickViewItems">
              {bundle.items.map((item, index) => (
                <div key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></div>
              ))}
            </div>
          </div>}
        </div>

        <div className="quickViewAction">
          <div><small>Bundle price</small><strong><Price inr={bundle.priceInr} /></strong></div>
          {quantity > 0 ? (
            <div className="cardQty large" aria-label={`${bundle.name} quantity`}>
              <button onClick={() => decrementBundle(bundle.id)} aria-label={`Decrease ${bundle.name}`}>−</button>
              <span>{quantity}</span>
              <button onClick={() => addBundle(bundle.id)} aria-label={`Increase ${bundle.name}`}>+</button>
            </div>
          ) : (
            <button className="goldButton quickAdd" onClick={() => addBundle(bundle.id)}>Add bundle to box <span>→</span></button>
          )}
        </div>
      </section>
    </div>
  );
}
