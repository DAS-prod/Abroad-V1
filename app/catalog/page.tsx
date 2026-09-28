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
