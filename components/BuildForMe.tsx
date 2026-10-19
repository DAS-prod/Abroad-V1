"use client";

import {
  CategoryKey,
  PACKAGING_WEIGHT_KG,
} from "@/data/catalog";

import { useBox } from "./BoxProvider";
import { useCatalog } from "./CatalogProvider";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

export default function BuildForMe() {
  const { bundles, categories } = useCatalog();

  const {
    replaceBox,
  } = useBox();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const [vegOnly, setVegOnly] =
    useState(true);

  const [chosen, setChosen] =
    useState<CategoryKey[]>([]);

  const [buildError, setBuildError] =
    useState("");

  const modalLayerRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * Portal can only be rendered after
   * the browser has mounted.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Keep selected categories valid when
   * Google Sheet catalog changes.
   */
  useEffect(() => {
    if (!categories.length) {
      return;
    }

    setChosen((current) => {
      const valid = current.filter((key) =>
        categories.some(
          (category) =>
            category.key === key
        )
      );

      if (valid.length) {
        return valid;
      }

      return categories
        .slice(0, 3)
        .map(
          (category) =>
            category.key
        );
    });
  }, [categories]);

  /*
   * MOBILE MODAL SCROLL FIX
   *
   * Only the modal layer scrolls.
   * The page behind it stays locked.
   *
   * We intentionally DO NOT use:
   * position: fixed on body
   *
   * because that causes scroll/freezing
   * issues on iPhone and some Android
   * browsers.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const body = document.body;
    const html =
      document.documentElement;

    const oldBodyOverflow =
      body.style.overflow;

    const oldHtmlOverflow =
      html.style.overflow;

    const oldBodyOverscroll =
      body.style.overscrollBehavior;

    const oldHtmlOverscroll =
      html.style.overscrollBehavior;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    body.style.overscrollBehavior =
      "none";

    html.style.overscrollBehavior =
      "none";

    /*
     * Always start concierge from top.
     */
    requestAnimationFrame(() => {
      if (modalLayerRef.current) {
        modalLayerRef.current.scrollTop =
          0;
      }
    });

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      body.style.overflow =
        oldBodyOverflow;

      html.style.overflow =
        oldHtmlOverflow;

      body.style.overscrollBehavior =
        oldBodyOverscroll;

      html.style.overscrollBehavior =
        oldHtmlOverscroll;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  const openConcierge = () => {
    setBuildError("");
    setOpen(true);
  };

  const closeConcierge = () => {
    setBuildError("");
    setOpen(false);
  };

  const toggle = (
    key: CategoryKey
  ) => {
    setChosen((current) => {
      if (current.includes(key)) {
        return current.filter(
          (item) =>
            item !== key
        );
      }

      return [
        ...current,
        key,
      ];
    });
  };

  const build = () => {
    setBuildError("");

    /*
     * Detect non-veg products using
     * Google Sheet category/tag data.
     */
    const isNonVeg = (
      bundle: (typeof bundles)[number]
    ) => {
      const searchable = [
        bundle.name,
        bundle.categoryName,
        bundle.parentCategory,
        bundle.subcategory,
        ...(bundle.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

      return (
        searchable.includes(
          "nonveg"
        ) ||
        searchable.includes(
          "nonvegetarian"
        )
      );
    };

    /*
     * Only bundles matching customer's
     * preferences are considered.
     */
    const pool = bundles.filter(
      (bundle) =>
        chosen.includes(
          bundle.category
        ) &&
        (
          !vegOnly ||
          !isNonVeg(bundle)
        ) &&
        Number.isFinite(
          bundle.weightKg
        ) &&
        bundle.weightKg > 0
    );

    if (!pool.length) {
      setBuildError(
        vegOnly
          ? "No vegetarian bundles match those categories yet. Try Mixed or choose another category."
          : "No bundles match those categories yet. Please choose another category."
      );

      /*
       * Scroll error into view inside
       * modal instead of appearing stuck.
       */
      window.setTimeout(() => {
        modalLayerRef.current?.scrollTo({
          top:
            modalLayerRef.current
              .scrollHeight,
          behavior: "smooth",
        });
      }, 50);

      return;
    }

    /*
     * 500 g packaging is included in
     * shipment target internally.
     *
     * Example:
     *
     * 5 KG box
     * product weight plus the configured packing allowance
     * reaches the 5 kg minimum
     *
     * Packaging is NOT displayed here.
     */
    const shipmentTarget = 5;

    const productTarget =
      Math.max(
        0,
        shipmentTarget -
          PACKAGING_WEIGHT_KG
      );

    /*
     * Create groups by selected
     * category.
     */
    const grouped = chosen
      .map((category) =>
        pool.filter(
          (bundle) =>
            bundle.category ===
            category
        )
      )
      .filter(
        (group) =>
          group.length > 0
      );

    const picked: string[] = [];

    let productWeight = 0;
    let round = 0;

    /*
     * Safety limit so malformed Sheet
     * data can never create an
     * infinite loop.
     */
    const MAX_LINES = 48;

    while (
      productWeight <
        productTarget &&
      picked.length <
        MAX_LINES
    ) {
      let addedThisRound = false;

      for (
        const group of grouped
      ) {
        if (
          productWeight >=
            productTarget ||
          picked.length >=
            MAX_LINES
        ) {
          break;
        }

        const candidate =
          group[
            round %
              group.length
          ];

        if (!candidate) {
          continue;
        }

        picked.push(
          candidate.id
        );

        productWeight +=
          candidate.weightKg;

        addedThisRound = true;
      }

      if (!addedThisRound) {
        break;
      }

      round += 1;
    }

    if (!picked.length) {
      setBuildError(
        "We couldn't create a box from those preferences. Please try another combination."
      );

      return;
    }

    /*
     * Replace existing box with the
     * automatically selected bundles.
     */
    replaceBox(picked);

    closeConcierge();

    /*
     * After modal closes, move customer
     * to the real catalog.
     */
    window.setTimeout(() => {
      const catalog =
        document.getElementById(
          "catalog"
        );

      catalog?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 250);
  };

  /*
   * MODAL CONTENT
   *
   * Important:
   * This is rendered through a portal
   * below instead of inside the hero.
   */
  const modal =
    open && mounted ? (
      <div
        ref={modalLayerRef}
        className="modalLayer"
        role="dialog"
        aria-modal="true"
        aria-label="Godavari Concierge"

        /*
         * These scrolling rules are
         * intentionally inline.
         *
         * They protect the modal even if
         * an older CSS rule elsewhere
         * accidentally overrides it.
         */
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,

          height: "100dvh",
          width: "100%",

          overflowY: "auto",
          overflowX: "hidden",

          WebkitOverflowScrolling:
            "touch",

          overscrollBehaviorY:
            "contain",

          touchAction: "pan-y",
        }}

        onClick={
          closeConcierge
        }
      >
        <div
          className="quizModal"

          /*
           * The card itself must NOT have
           * its own scroll.
           *
           * One scroll container only.
           */
          style={{
            maxHeight: "none",
            overflow: "visible",
          }}

          onClick={(event) =>
            event.stopPropagation()
          }
        >
          {/* CLOSE */}
          <button
            className="modalClose"
            type="button"
            aria-label="Close concierge"
            onClick={
              closeConcierge
            }
          >
            ×
          </button>

          <span className="eyebrow">
            GODAVARI CONCIERGE
          </span>

          <h2>
            Tell us what feels
            like home.
          </h2>

          <p>
            We'll create a balanced
            starting box. You can
            change every bundle
            afterwards.
          </p>

          {/* FOOD PREFERENCE */}
          <div className="quizSection">
            <label>
              Preference
            </label>

            <div className="segmented two">
              <button
                type="button"
                className={
                  vegOnly
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setVegOnly(true)
                }
              >
                Vegetarian
              </button>

              <button
                type="button"
                className={
                  !vegOnly
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setVegOnly(false)
                }
              >
                Mixed
              </button>
            </div>
          </div>

          {/* GOOGLE SHEET CATEGORIES */}
          <div className="quizSection">
            <label>
              What do you miss most?
            </label>

            <div className="chips">
              {categories.map(
                (item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={
                      chosen.includes(
                        item.key
                      )
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      toggle(
                        item.key
                      )
                    }
                  >
                    {item.name}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ERROR */}
          {buildError ? (
            <p
              className="conciergeError"
              role="alert"
            >
              {buildError}
            </p>
          ) : null}

          {/* ACTION */}
          <div className="quizAction">
            <button
              className="goldButton full"
              type="button"
              onClick={build}
              disabled={
                !chosen.length ||
                !bundles.length
              }
            >
              Create my box
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        className="outlineButton"
        type="button"
        onClick={
          openConcierge
        }
      >
        ✦ Build for me
      </button>

      {mounted &&
      modal
        ? createPortal(
            modal,
            document.body
          )
        : null}
    </>
  );
}
