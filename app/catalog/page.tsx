"use client";

import Footer from "@/components/Footer";
import BundleQuickView from "@/components/BundleQuickView";
import { useCatalog } from "@/components/CatalogProvider";
import type { Bundle } from "@/data/catalog";
import Price from "@/components/Price";
import { useEffect, useMemo, useState } from "react";

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
            <strong><Price usd={defaultPack?.priceUsd || item.priceUsd} /></strong>
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
  useEffect(() => { setQuery(new URLSearchParams(window.location.search).get("q") || ""); }, []);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort,setSort]=useState("relevance");
  const [availabilityOnly,setAvailabilityOnly]=useState(false);
  const [suggestionsOpen,setSuggestionsOpen]=useState(false);

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

  const normalizedQuery=query.trim().toLowerCase();
  const scored=useMemo(()=>products.map(item=>{
    const name=item.name.toLowerCase();const category=(item.categoryName||item.category).toLowerCase();
    const terms=[item.subtitle,category,item.subcategory,...(item.items||[]),...(item.tags||[])].filter(Boolean).join(" ").toLowerCase();
    const tokens=normalizedQuery.split(/\s+/).filter(Boolean);
    const score=!tokens.length?1:tokens.reduce((sum,token)=>{
      if(name===token)return sum+100;
      if(name.startsWith(token))return sum+55;
      if(name.includes(token))return sum+35;
      if(category.includes(token))return sum+20;
      if(terms.includes(token))return sum+10;
      return -1000;
    },0);
    return {item,score};
  }),[products,normalizedQuery]);
  const visibleProducts=useMemo(()=>scored.filter(({item,score})=>score>0 &&
    (activeCategory==="all" || item.category===activeCategory) &&
    (!availabilityOnly || item.stock===undefined || item.stock>0))
    .sort((a,b)=>sort==="priceAsc"?a.item.priceUsd-b.item.priceUsd:
      sort==="priceDesc"?b.item.priceUsd-a.item.priceUsd:
      sort==="name"?a.item.name.localeCompare(b.item.name):b.score-a.score)
    .map(({item})=>item),[scored,activeCategory,availabilityOnly,sort]);
  const suggestions=useMemo(()=>normalizedQuery?scored.filter(v=>v.score>0).sort((a,b)=>b.score-a.score).slice(0,6).map(v=>v.item):[],[scored,normalizedQuery]);

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
          <div className="catalogSearchWrap"><label className="productCatalogSearch">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search pickles, sweets, cashews…"
              value={query}
              onChange={(event) => {setQuery(event.target.value);setSuggestionsOpen(true)}}
              onFocus={()=>setSuggestionsOpen(true)}
              onKeyDown={e=>{if(e.key==="Escape")setSuggestionsOpen(false)}}
              aria-label="Search add-ons"
            />
          </label>
          {suggestionsOpen&&suggestions.length>0&&<div className="catalogSuggestions" role="listbox" aria-label="Suggested products">
            {suggestions.map(item=><button type="button" key={item.id} role="option" aria-selected={false} onClick={()=>{setQuery(item.name);setSuggestionsOpen(false)}}><img src={item.image} alt=""/><span><strong>{item.name}</strong><small>{item.categoryName||item.category}</small></span><span>↗</span></button>)}
          </div>}
          </div>
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

        <div className="catalogAdvancedFilters"><span>Refine your selection</span>
          <label className="catalogStock"><input type="checkbox" checked={availabilityOnly} onChange={e=>setAvailabilityOnly(e.target.checked)}/> In stock only</label>
          <label className="catalogSort">Sort by <select value={sort} onChange={e=>setSort(e.target.value)}><option value="relevance">Best match</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option><option value="name">Name A–Z</option></select></label>
          {(query||activeCategory!=="all"||availabilityOnly)&&<button className="catalogClear" type="button" onClick={()=>{setQuery("");setActiveCategory("all");setAvailabilityOnly(false);setSuggestionsOpen(false)}}>Clear filters ×</button>}
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
