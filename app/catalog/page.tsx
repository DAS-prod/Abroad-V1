"use client";

import Footer from "@/components/Footer";
import BundleQuickView from "@/components/BundleQuickView";
import { useCatalog } from "@/components/CatalogProvider";
import type { Bundle } from "@/data/catalog";
import Price from "@/components/Price";
import { useMemo, useState } from "react";

function CatalogCard({ item }: { item: Bundle }) {
  const [quickView, setQuickView] = useState(false);
  const defaultPack = item.variants?.find(v => v.size === "250g") || item.variants?.[0];

  return (
    <>
      <article className="productCatalogCard">
        <button
          type="button"
          className="productCatalogImage"
          onClick={() => setQuickView(true)}
          aria-label={`View ${item.name} details`}
        >
          <img
            src={item.image || "/images/brand/logo.webp"}
            alt={item.name}
            loading="lazy"
          />
          {item.popular && (
            <span className="productCatalogBadge">Popular</span>
          )}
        </button>

        <div className="productCatalogBody">
          <span className="productCatalogCategory">
            {item.categoryName || item.category.replace(/-/g, " ")}
          </span>

          <button
            type="button"
            className="catalogTitleButton"
            onClick={() => setQuickView(true)}
          >
            <h2>{item.name}</h2>
          </button>

          {item.subtitle && <p>{item.subtitle}</p>}

          {item.items.length > 0 && (
            <p className="productCatalogContents">
              {item.items.slice(0, 4).join(" · ")}
              {item.items.length > 4
                ? ` +${item.items.length - 4} more`
                : ""}
            </p>
          )}

          <div className="productCatalogMeta">
            <span>{defaultPack?.size || item.sizeLabel || `${item.weightKg} kg`}</span>
            <strong><Price inr={defaultPack?.priceInr || item.priceInr} /></strong>
          </div>

          <button type="button" onClick={() => setQuickView(true)}>
            Add to Cart
          </button>
        </div>
      </article>

      {quickView && (
        <BundleQuickView
          bundle={item}
          onClose={() => setQuickView(false)}
        />
      )}
    </>
  );
}

export default function CatalogPage() {
  const { products, loading, error, source, refreshCatalog } = useCatalog();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const values = new Map<string, string>();
    products.forEach((item) => {
      values.set(
        item.category,
        item.categoryName || item.category.replace(/-/g, " ")
      );
    });
    return Array.from(values, ([key, name]) => ({ key, name }));
  }, [products]);

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return products.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;

      const searchable = [
        item.name,
        item.subtitle,
        item.categoryName,
        item.subcategory,
        ...(item.items || []),
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!needle || searchable.includes(needle));
    });
  }, [activeCategory, products, query]);

  return (
    <main className="subPage productCatalogPage">
      <section className="productCatalogHero">
        <div className="shell productCatalogHeroInner">
          <span className="eyebrow">GODAVARI BASKET ABROAD</span>
          <h1>Explore Our Add-ons</h1>
          <p>
            Authentic Godavari favourites, ready to become part of your
            custom box. Choose a size to see its price. Availability and
            final order details are confirmed on WhatsApp.
          </p>
          <a className="goldButton" href="/build">
            Build Your Custom Box <span>→</span>
          </a>
        </div>
      </section>

      <section className="shell productCatalogSection">
        <div className="productCatalogTools">
          <label className="productCatalogSearch">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search add-ons"
            />
          </label>

          <div
            className="productCatalogFilters"
            aria-label="Catalog categories"
          >
            <button
              type="button"
              className={activeCategory === "all" ? "active" : ""}
              onClick={() => setActiveCategory("all")}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category.key}
                className={
                  activeCategory === category.key ? "active" : ""
                }
                onClick={() => setActiveCategory(category.key)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {!loading && products.length > 0 && (
          <p className="productCatalogCount">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "product" : "products"}{" "}
            available
          </p>
        )}

        {loading && products.length === 0 ? (
          <div className="productCatalogState">
            <span className="productCatalogSpinner" />
            <h2>Loading our Godavari collection…</h2>
            <p>
              Bringing the latest add-ons directly from our live product
              sheet.
            </p>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="productCatalogGrid">
            {visibleProducts.map((item) => (
              <CatalogCard
                item={item}
                key={`${item.catalogType || "bundle"}-${item.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="productCatalogState">
            <h2>
              {query
                ? "No matching products"
                : "Add-ons are being updated"}
            </h2>
            <p>
              {query
                ? "Try another product name or select a different category."
                : error ||
                  "Please check back shortly for our latest collection."}
            </p>

            {source === "error" && (
              <button
                type="button"
                className="goldButton"
                onClick={() => void refreshCatalog()}
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
