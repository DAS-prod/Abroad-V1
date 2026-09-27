"use client";

import { Bundle } from "@/data/catalog";
import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useBox } from "./BoxProvider";
import { useCatalog } from "./CatalogProvider";
import Price from "./Price";
import BundleQuickView from "./BundleQuickView";
import styles from "./BundleCard.module.css";

type BundleCardProps = {
  bundle: Bundle;
  compact?: boolean;
  revealIndex?: number;
  immediateReveal?: boolean;
  syncTargetToBundleWeight?: boolean;
};

export default function BundleCard({
  bundle,
  compact = false,
  revealIndex = 0,
  immediateReveal = false,
  syncTargetToBundleWeight = false,
}: BundleCardProps) {
  const {
    addBundle,
    decrementBundle,
    getQuantity,
    setSelectedBoxKg,
  } = useBox();
  const { bundles } = useCatalog();
  const [quickView, setQuickView] = useState(false);
  const itemsRailRef = useRef<HTMLDivElement | null>(null);
  const quantity = getQuantity(bundle.id);

  const pairing = useMemo(() => {
    return (
      bundles.find(
        (candidate) =>
          candidate.id !== bundle.id && candidate.category !== bundle.category
      ) || bundles.find((candidate) => candidate.id !== bundle.id)
    );
  }, [bundles, bundle.id, bundle.category]);

  const scrollItems = (direction: "left" | "right") => {
    const rail = itemsRailRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction === "right" ? Math.max(130, rail.clientWidth * 0.72) : -Math.max(130, rail.clientWidth * 0.72),
      behavior: "smooth",
    });
  };

  const addSelectedBundle = () => {
    if (syncTargetToBundleWeight) {
      setSelectedBoxKg(bundle.weightKg);
    }
    addBundle(bundle.id);
  };

  return (
    <>
      <article
        className={`${compact ? "bundleCard compact" : "bundleCard"} ${
          immediateReveal ? "catalogCardEnter" : "premiumReveal"
        }`}
        {...(!immediateReveal ? { "data-reveal": "" } : {})}
        style={{ "--reveal-order": revealIndex } as CSSProperties}
      >
        <button
          className="bundleImageButton"
          onClick={() => setQuickView(true)}
          aria-label={`View ${bundle.name} details`}
        >
          <div className="bundleImageWrap">
            <img
              src={bundle.image}
              alt={bundle.name}
              className="bundleImage"
              loading="lazy"
            />
            {bundle.popular && <span className="pill">Most loved</span>}
            <span className="weightBadge">{bundle.weightKg} kg</span>
            <span className="imageViewCue">
              View bundle <b>↗</b>
            </span>
            <div className="imageGlow" />
          </div>
        </button>

        <div className="bundleBody">
          <div>
            <p className="eyebrow">{bundle.items.length} curated favourites</p>
            <button
              className="bundleTitleButton"
              onClick={() => setQuickView(true)}
            >
              <h3>{bundle.name}</h3>
            </button>
            <p className="bundleSubtitle">{bundle.subtitle}</p>
          </div>

          {!compact && bundle.items.length > 0 && (
            <div className={styles.itemsArea} aria-label={`${bundle.name} included items`}>
              <button
                type="button"
                className={styles.scrollButton}
                onClick={() => scrollItems("left")}
                aria-label={`Scroll ${bundle.name} items left`}
              >
                ‹
              </button>

              <div className={styles.itemsRail} ref={itemsRailRef}>
                {bundle.items.map((item, index) => (
                  <span
                    className={styles.itemChip}
                    key={`${bundle.id}-${item}-${index}`}
                    title={item}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <button
                type="button"
                className={styles.scrollButton}
                onClick={() => scrollItems("right")}
                aria-label={`Scroll ${bundle.name} items right`}
              >
                ›
              </button>

              <small className={styles.scrollHint}>Swipe items ↔</small>
            </div>
          )}

          {!compact && pairing && (
            <button className="pairingHint" onClick={() => setQuickView(true)}>
              <span>Pairs well with</span>
              <b>{pairing.name}</b>
              <i>→</i>
            </button>
          )}

          <div className="bundleFooter">
            <strong>
              <Price inr={bundle.priceInr} />
            </strong>

            {quantity > 0 ? (
              <div className="cardQty" aria-label={`${bundle.name} quantity`}>
                <button
                  onClick={() => decrementBundle(bundle.id)}
                  aria-label={`Decrease ${bundle.name}`}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={addSelectedBundle}
                  aria-label={`Increase ${bundle.name}`}
                >
                  +
                </button>
              </div>
            ) : (
              <button className="addBundleButton" onClick={addSelectedBundle}>
                Add to box <span>＋</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {quickView && (
        <BundleQuickView bundle={bundle} onClose={() => setQuickView(false)} />
      )}
    </>
  );
}
