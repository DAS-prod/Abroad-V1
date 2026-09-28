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
  const [selectedSize, setSelectedSize] = useState(bundle.variants?.find(v => v.size === "250g")?.size || bundle.variants?.[0]?.size || bundle.sizeLabel || "");
  const [requestedQuantity, setRequestedQuantity] = useState(1);

  const quantity = getQuantity(bundle.id);
  const isIndividualProduct = bundle.catalogType === "product";
  const selectedVariant = bundle.variants?.find(v => v.size === selectedSize);
  const selectedPrice = selectedVariant?.priceInr || bundle.priceInr;
  const selectedWeight = selectedVariant?.size || bundle.sizeLabel || `${bundle.weightKg} kg`;
  const selectedId = selectedVariant?.id || bundle.id;

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
          <span className="eyebrow">{isIndividualProduct ? "GODAVARI ADD-ON" : `${bundle.items.length} ITEMS · ${bundle.weightKg.toFixed(1)} KG BUNDLE`}</span>

          <h2>{bundle.name}</h2>

          <p className="quickViewSubtitle">
            {bundle.subtitle}
          </p>

          {isIndividualProduct && bundle.variants && (
            <div className="catalogQuickSelector">
              <h3>Select weight</h3>
              <div className="catalogQuickWeights" role="group" aria-label="Select weight">
                {bundle.variants.map(variant => (
                  <button key={variant.id} type="button"
                    aria-pressed={selectedSize === variant.size}
                    className={selectedSize === variant.size ? "selected" : ""}
                    onClick={() => setSelectedSize(variant.size)}>{variant.size}</button>
                ))}
              </div>
              <div className="catalogQuickPrice"><Price inr={selectedPrice} /> <span>/ {selectedWeight}</span></div>
              <h3>Quantity</h3>
              <div className="catalogQuickQuantity" role="group" aria-label="Quantity">
                <button type="button" onClick={() => setRequestedQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span>{requestedQuantity}</span>
                <button type="button" onClick={() => setRequestedQuantity(q => Math.min(99, q + 1))} aria-label="Increase quantity">+</button>
              </div>
            </div>
          )}

          {!isIndividualProduct && <div className="quickViewPriceRow">
            <strong
              style={
                isIndividualProduct
                  ? {
                      fontSize: 13,
                      lineHeight: 1.35,
                      fontWeight: 600,
                    }
                  : undefined
              }
            >
              <Price inr={selectedPrice} />
            </strong>

            <span>
              {bundle.sizeLabel || `${bundle.weightKg.toFixed(1)} kg products`}
            </span>
          </div>}

          {(!isIndividualProduct ||
            bundle.items.some((item) => item !== bundle.name)) && (
            <div className="quickViewInside">
              <div className="quickViewSectionHead">
                <div>
                  <span className="eyebrow">
                    {isIndividualProduct
                      ? "PRODUCT DETAILS"
                      : "WHAT'S INSIDE"}
                  </span>

                  <h3>
                    {isIndividualProduct
                      ? "About this product"
                      : "Curated in this bundle"}
                  </h3>
                </div>

                <small>
                  {bundle.items.length} products
                </small>
              </div>

              <div className="quickViewItems">
                {bundle.items.map((item, index) => {
                  const { name, weight } = getItemParts(item);

                  return (
                    <div key={`${item}-${index}`}>
                      <span>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <b>
                        {name}
                        {weight && (
                          <small
                            style={{
                              display: "block",
                              marginTop: 3,
                              fontSize: 10,
                              color: "#89754b",
                              fontWeight: 700,
                            }}
                          >
                            {weight}
                          </small>
                        )}
                      </b>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="quickViewAction">
          {!isIndividualProduct && <div>
            <small>
              {isIndividualProduct
                ? "Product price"
                : "Bundle price"}
            </small>

            <strong
              style={
                isIndividualProduct
                  ? {
                      fontSize: 12,
                      lineHeight: 1.35,
                      fontWeight: 600,
                    }
                  : undefined
              }
            >
              <Price inr={bundle.priceInr} />
            </strong>
          </div>}

          {isIndividualProduct ? (
            <button type="button" className="goldButton quickAdd" onClick={() => {
              for (let i = 0; i < requestedQuantity; i += 1) addBundle(selectedId);
              onClose();
            }}>Add {requestedQuantity} to Cart <span>→</span></button>
          ) : quantity > 0 ? (
            <div
              className="cardQty large"
              aria-label={`${bundle.name} quantity`}
            >
              <button
                type="button"
                onClick={() => decrementBundle(bundle.id)}
                aria-label={`Decrease ${bundle.name}`}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() => addBundle(bundle.id)}
                aria-label={`Increase ${bundle.name}`}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="goldButton quickAdd"
              onClick={() => addBundle(bundle.id)}
            >
              Add bundle to box <span>→</span>
            </button>
          )}
        </div>
      </section>
    </div>,
    document.body
  );
}
