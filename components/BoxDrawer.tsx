"use client";

import Link from "next/link";
import { useCatalog } from "./CatalogProvider";
import { useBox } from "./BoxProvider";
import Price from "./Price";
import BundleQuickView from "./BundleQuickView";
import { useState } from "react";
import type { Bundle } from "@/data/catalog";

export default function BoxDrawer() {
  const [selectedDetail, setSelectedDetail] = useState<Bundle | null>(null);
  const { bundles } = useCatalog();
  const {
    lines,
    drawerOpen,
    setDrawerOpen,
    totalWeight,
    totalInr,
    minimumReached,
    remainingToMinimum,
    addBundle,
    decrementBundle,
    removeBundle,
    clearBox,
    getBundle,
    giftMode,
    setGiftMode,
  } = useBox();

  const progress = Math.min(100, (totalWeight / 5) * 100);

  const suggested = bundles
    .filter((bundle) => !lines.some((line) => line.bundleId === bundle.id))
    .sort(
      (a, b) =>
        Math.abs(a.weightKg - remainingToMinimum) -
        Math.abs(b.weightKg - remainingToMinimum)
    )
    .slice(0, 2);

  return (
    <>
      <button
        aria-label="Close box drawer"
        className={drawerOpen ? "drawerBackdrop show" : "drawerBackdrop"}
        onClick={() => setDrawerOpen(false)}
      />

      <aside
        className={drawerOpen ? "boxDrawer open" : "boxDrawer"}
        aria-hidden={!drawerOpen}
      >
        <div className="drawerTop">
          <div>
            <span className="eyebrow light">YOUR SELECTION</span>
            <h2>Your Godavari Box</h2>
          </div>
          <button
            className="drawerClose"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="drawerScroll">
          <div className="weightPanel">
            <div className="weightRow">
              <strong>{totalWeight.toFixed(1)} kg</strong>
              <span>5 kg minimum</span>
            </div>
            <div className="progressTrack animatedProgress">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="weightMeta">
              <span>
                {minimumReached
                  ? "✓ Minimum reached"
                  : `${remainingToMinimum.toFixed(1)} kg more to minimum`}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="giftSwitch">
            <div>
              <b>Sending as a gift?</b>
              <small>We'll note this for your final order.</small>
            </div>
            <button
              aria-label="Toggle gift mode"
              className={giftMode ? "switch on" : "switch"}
              onClick={() => setGiftMode(!giftMode)}
            >
              <i />
            </button>
          </div>

          {lines.length > 0 && (
            <div className="drawerListHead">
              <b>
                Your bundles (
                {lines.reduce((sum, line) => sum + line.quantity, 0)})
              </b>
              <button onClick={clearBox}>Clear all</button>
            </div>
          )}

          <div className="drawerLines">
            {lines.length === 0 ? (
              <div className="emptyBox">
                <span>◇</span>
                <h3>Your box is waiting.</h3>
                <p>Choose curated bundles and build a shipment of at least 5 kg.</p>
                <Link href="/build" onClick={() => setDrawerOpen(false)}>
                  Start building →
                </Link>
              </div>
            ) : (
              lines.map((line) => {
                const bundle = getBundle(line.bundleId);
                if (!bundle) return null;

                return (
                  <div className="drawerLine" key={line.bundleId}>
                    <button className="drawerDetailImage" type="button" onClick={() => setSelectedDetail(bundle)} aria-label={`View ${bundle.name} details`}><img src={bundle.image} alt="" /></button>
                    <div className="lineCopy">
                      <button type="button" className="drawerDetailTitle" onClick={() => setSelectedDetail(bundle)}>{bundle.name}</button>
                      <small>
                        {bundle.items.slice(0, 3).join(" · ")}
                        {bundle.items.length > 3 ? " + more" : ""}
                      </small>
                      <small>
                        {bundle.sizeLabel || `${bundle.weightKg} kg`} each · <Price inr={bundle.priceInr} />
                      </small>
                      <div className="qty">
                        <button
                          onClick={() => decrementBundle(bundle.id)}
                          aria-label={`Decrease ${bundle.name}`}
                        >
                          −
                        </button>
                        <span>{line.quantity}</span>
                        <button
                          onClick={() => addBundle(bundle.id)}
                          aria-label={`Increase ${bundle.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="remove"
                      onClick={() => removeBundle(bundle.id)}
                      aria-label={`Remove ${bundle.name}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {!minimumReached && lines.length > 0 && (
            <div className="topUp">
              <div className="topUpHead">
                <p>
                  <b>Almost there.</b> Add around {remainingToMinimum.toFixed(1)} kg
                  to reach the 5 kg minimum.
                </p>
                <span>Suggested</span>
              </div>
              <div className="miniSuggestions">
                {suggested.map((bundle) => (
                  <button key={bundle.id} onClick={() => addBundle(bundle.id)}>
                    <img src={bundle.image} alt="" />
                    <span>
                      <b>{bundle.name}</b>
                      <small>+ {bundle.weightKg} kg</small>
                    </span>
                    <em>＋</em>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="drawerBottom">
          <div className="totalLine">
            <span>Bundle subtotal</span>
            <strong>
              <Price inr={totalInr} />
            </strong>
          </div>

          {lines.length > 0 && (
            <div className="totalLine">
              <span>
                Transport
              </span>
              <strong>Confirmed on WhatsApp</strong>
            </div>
          )}

          <div className="drawerActions">
            <Link
              className="drawerSecondary"
              href="/build"
              onClick={() => setDrawerOpen(false)}
            >
              Continue shopping
            </Link>

            {minimumReached ? (
              <Link
                className="goldButton drawerCheckout"
                href="/checkout"
                onClick={() => setDrawerOpen(false)}
              >
                Checkout <span>→</span>
              </Link>
            ) : (
              <button className="goldButton drawerCheckout disabled" disabled>
                Checkout <span>→</span>
              </button>
            )}
          </div>

          {!minimumReached && lines.length > 0 && (
            <small>
              Add {remainingToMinimum.toFixed(1)} kg more to unlock checkout.
            </small>
          )}
        </div>
      </aside>
      {selectedDetail && <BundleQuickView bundle={selectedDetail} onClose={() => setSelectedDetail(null)} />}
    </>
  );
}
