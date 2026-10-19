"use client";

import Link from "next/link";
import BundleCard from "@/components/BundleCard";
import Footer from "@/components/Footer";
import { useCatalog } from "@/components/CatalogProvider";
import styles from "./Combos.module.css";

const COMBO_SIZES = [5, 10, 15] as const;

export default function CombosPage() {
  const { combos, loading, source } = useCatalog();

  const groups = COMBO_SIZES.map((size) => ({
    size,
    items: combos.filter(
      (combo) =>
        Math.abs(combo.weightKg - size) < 0.05
    ),
  }));

  const visibleCombos = groups.reduce(
    (sum, group) => sum + group.items.length,
    0
  );

  return (
    <main className="subPage">
      {/* HERO */}
      <section className={styles.hero}>
        <div className={`shell ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>
              READY-MADE GODAVARI COMBOS
            </span>

            <h1>
              Pick the box size.
              <br />
              <em>We have built the combo.</em>
            </h1>

            <p>
              Explore ready-to-order 5 kg, 10 kg and 15 kg
              Godavari combo packs pulled directly from our
              live Google Sheet catalog. See every item,
              choose the mix you like, and add the complete
              combo to your box.
            </p>

            <div className={styles.heroActions}>
              <a
                className="goldButton"
                href="#combo-5kg"
              >
                Explore combos <span>↓</span>
              </a>

              <Link
                className={styles.heroSecondary}
                href="/build"
              >
                Build a custom box instead →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* COMBOS */}
      <section className="shell">
        {loading && !combos.length ? (
          <div className="catalogState">
            <span className="catalogSpinner" />

            <h3>
              Loading combo packs…
            </h3>
          </div>
        ) : visibleCombos > 0 ? (
          groups.map((group) =>
            group.items.length ? (
              <section
                className={styles.comboSection}
                id={`combo-${group.size}kg`}
                key={group.size}
              >
                {/* SECTION TITLE */}
                <div className={styles.sectionHead}>
                  <div>
                    <small>
                      {group.size} KG READY COMBOS
                    </small>

                    <h2>
                      {group.size === 5
                        ? "A compact taste of home."
                        : group.size === 10
                        ? "More favourites, one complete box."
                        : "A fuller Godavari stock-up."}
                    </h2>
                  </div>
                </div>

                {/* COMBO CARDS */}
                <div className={styles.comboGrid}>
                  {group.items.map(
                    (combo, index) => (
                      <BundleCard
                        bundle={combo}
                        key={combo.id}
                        revealIndex={index}
                      />
                    )
                  )}
                </div>
              </section>
            ) : null
          )
        ) : (
          <div className={styles.emptyState}>
            <span>
              COMBOS ARE READY FOR THE SHEET
            </span>

            <h2>
              No 5 kg, 10 kg or 15 kg combo
              rows are live yet.
            </h2>

            <p>
              Add your combo rows to the dedicated
              Combos Google Sheet with{" "}
              <b>weight_kg</b> as 5, 10 or 15 and
              set <b>active = TRUE</b>. They will
              appear here automatically.
            </p>

            {source === "error" ? (
              <p>
                The combo catalog request is
                currently failing, so refresh once
                the Google Sheet is reachable.
              </p>
            ) : null}
          </div>
        )}

        {/* CUSTOM BOX CTA */}
        <section className={styles.customBand}>
          <div className={styles.customCard}>
            <div>
              <small>
                WANT TO CHOOSE EVERY BUNDLE YOURSELF?
              </small>

              <h2>
                Build your own Godavari box.
              </h2>

              <p>
                Ready-made combos are faster. The
                custom builder is still available
                when you want to mix pickles,
                snacks, sweets, podis and other
                bundles exactly the way you want.
              </p>
            </div>

            <Link
              className="creamButton"
              href="/build"
            >
              Build custom box <span>→</span>
            </Link>
          </div>
        </section>
      </section>

      <Footer />
    </main>
  );
}
