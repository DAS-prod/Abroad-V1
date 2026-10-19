"use client";

import BundleCard from "@/components/BundleCard";
import BuildForMe from "@/components/BuildForMe";
import Footer from "@/components/Footer";
import { CategoryKey } from "@/data/catalog";
import { useBox } from "@/components/BoxProvider";
import { useCatalog } from "@/components/CatalogProvider";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

function WhatsAppIcon({
  size = 22,
}: {
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12.04 2a9.84 9.84 0 0 0-8.4 14.96L2 22l5.18-1.61A9.94 9.94 0 1 0 12.04 2Zm0 17.87a8.04 8.04 0 0 1-4.1-1.12l-.29-.17-3.07.95.98-2.99-.19-.31a8.02 8.02 0 1 1 6.67 3.64Zm4.4-6.01c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.58 1.63-1.15.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z"
      />
    </svg>
  );
}

function BuildPageContent() {
  const searchParams = useSearchParams();

  const [active, setActive] =
    useState<CategoryKey | "all">("all");

  const {
    bundles,
    categories,
    loading,
    source,
  } = useCatalog();

  const {
    totalWeight,
    minimumReached,
    remainingToMinimum,
    setDrawerOpen,
  } = useBox();

  const list = useMemo(() => {
    if (active === "all") {
      return bundles;
    }

    return bundles.filter(
      (bundle) =>
        bundle.category === active
    );
  }, [active, bundles]);

  const progress = Math.min(
    100,
    (totalWeight / 5) * 100
  );

  /*
   * Scroll to catalog after Google Sheet
   * data has actually rendered.
   */
  useEffect(() => {
    const shouldScroll =
      searchParams.get("catalog") ===
      "1";

    if (!shouldScroll) {
      return;
    }

    if (
      loading &&
      bundles.length === 0
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        document
          .getElementById("catalog")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    searchParams,
    loading,
    bundles.length,
  ]);

  /*
   * WhatsApp number comes from ENV.
   *
   * Example:
   * NEXT_PUBLIC_WHATSAPP_NUMBER=919618851406
   */
  const whatsappNumber =
    process.env
      .NEXT_PUBLIC_WHATSAPP_NUMBER
      ?.trim() || "";

  /*
   * This message intentionally does NOT
   * include cart or customer details.
   */
  const customizeMessage =
    encodeURIComponent(
      "Hi Godavari Basket! I would like some help customizing my Godavari Basket Abroad box."
    );

  return (
    <main className="subPage buildPage">
      {/* =========================
          HERO
      ========================== */}

      <section className="subHero buildHero">
        <div className="subHeroBackdrop" />

        <div className="heroAmbient heroAmbientOne" />
        <div className="heroAmbient heroAmbientTwo" />

        <div className="shell subHeroInner buildHeroInner">
          <div className="buildHeroCopy">
            <span className="eyebrow light heroLine heroLine1">
              BUILD YOUR GODAVARI BOX
            </span>

            <h1 className="heroLine heroLine2">
              Choose what feels
              <br />
              <em>most like home.</em>
            </h1>

            <p className="heroLine heroLine3">
              Pick curated bundles from
              across the Godavari pantry
              and combine them into one
              box for delivery abroad.
            </p>
          </div>

          <div className="heroLine heroLine4">
            <BuildForMe />
          </div>
        </div>
      </section>

      {/* Live progress toward the 5 kg minimum. */}

      <section
        className="builderControl shell"
        data-reveal
      >
        <button
          type="button"
          className="builderProgress"
          onClick={() =>
            setDrawerOpen(true)
          }
        >
          <span>
            <b>
              {totalWeight.toFixed(1)} kg
            </b>

            <small>5 kg minimum order</small>
          </span>

          <i className="animatedProgress">
            <em
              style={{
                width: `${progress}%`,
              }}
            />
          </i>

          <strong>
            {minimumReached
              ? "Minimum reached · keep building if you like"
              : `${remainingToMinimum.toFixed(
                  1
                )} kg more to checkout`}
          </strong>

          <small className="weightBreakdown">
            Live shipment weight
          </small>

          <span>
            View box →
          </span>
        </button>
      </section>

      {/* =========================
          GOOGLE SHEET CATALOG
      ========================== */}

      <section
        id="catalog"
        className="section shell buildCatalog"
      >
        <div className="catalogUtilityRow">
          <div
            className="categoryTabs"
            aria-label="Bundle categories"
          >
            <button
              type="button"
              className={
                active === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActive("all")
              }
            >
              All{" "}
              <small>
                {bundles.length}
              </small>
            </button>

            {categories.map((cat) => {
              const count =
                bundles.filter(
                  (bundle) =>
                    bundle.category ===
                    cat.key
                ).length;

              return (
                <button
                  type="button"
                  key={cat.key}
                  className={
                    active === cat.key
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActive(
                      cat.key
                    )
                  }
                >
                  {cat.name}{" "}
                  <small>
                    {count}
                  </small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="catalogHeading">
          <div>
            <span className="eyebrow">
              CURATED BUNDLES · MIX &
              MATCH
            </span>

            <h2>
              {active === "all"
                ? "Build across the whole pantry"
                : categories.find(
                    (category) =>
                      category.key ===
                      active
                  )?.name}
            </h2>
          </div>

          <p>
            Each card is a ready bundle.
            Add several bundles together
            to create your larger
            Godavari Box.
          </p>
        </div>

        {/* LOADING */}

        {loading &&
        bundles.length === 0 ? (
          <div
            className="catalogGrid catalogSkeletonGrid"
            aria-label="Loading bundles"
          >
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                className="bundleCard catalogSkeleton"
                key={index}
                aria-hidden="true"
              >
                <div className="skeletonImage" />

                <div className="skeletonBody">
                  <i />
                  <b />
                  <span />
                  <span />

                  <button
                    type="button"
                    tabIndex={-1}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : list.length > 0 ? (
          /*
           * REAL BUNDLES FROM
           * GOOGLE SHEET
           */
          <div className="catalogGrid">
            {list.map(
              (bundle, index) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  revealIndex={
                    index % 8
                  }
                  immediateReveal
                />
              )
            )}
          </div>
        ) : (
          <div className="catalogState">
            <h3>
              {source ===
              "google-sheet"
                ? "No bundles are available here yet."
                : "We couldn't load the catalog."}
            </h3>

            <p>
              Please refresh the page or
              contact us on WhatsApp and
              we'll help you build your
              box.
            </p>
          </div>
        )}
      </section>

      {/* =========================
          YOUR BOX YOUR WAY
      ========================== */}

      <section
        className="shell customBuildSection"
        data-reveal
      >
        <div className="customBuildGlow" />

        <div className="customBuildIcon">
          <WhatsAppIcon size={29} />
        </div>

        <div className="customBuildCopy">
          <span className="eyebrow light">
            YOUR BOX, YOUR WAY
          </span>

          <h2>
            Want a combination that
            isn't in the catalog?
          </h2>

          <p>
            Tell us what you're looking
            for and we'll help you
            create a Godavari Box around
            your preferences.
          </p>
        </div>

        {whatsappNumber ? (
          <a
            className="customBuildButton whatsappCustomButton"
            href={`https://wa.me/${whatsappNumber}?text=${customizeMessage}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Customize your box on WhatsApp"
          >
            <WhatsAppIcon
              size={21}
            />

            <span>
              Customize on WhatsApp
            </span>

            <b>→</b>
          </a>
        ) : null}
      </section>

      <Footer />
    </main>
  );
}

/*
 * Required by Next.js 14 because
 * BuildPageContent uses useSearchParams().
 */
export default function BuildPage() {
  return (
    <Suspense
      fallback={
        <BuildPageLoading />
      }
    >
      <BuildPageContent />
    </Suspense>
  );
}

function BuildPageLoading() {
  return (
    <main className="subPage buildPage">
      <section className="subHero buildHero">
        <div className="subHeroBackdrop" />

        <div className="heroAmbient heroAmbientOne" />
        <div className="heroAmbient heroAmbientTwo" />

        <div className="shell subHeroInner buildHeroInner">
          <div className="buildHeroCopy">
            <span className="eyebrow light">
              BUILD YOUR GODAVARI BOX
            </span>

            <h1>
              Choose what feels
              <br />
              <em>most like home.</em>
            </h1>

            <p>
              Curating your Godavari
              favourites…
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
