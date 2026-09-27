"use client";

import BundleCard from "@/components/BundleCard";
import Footer from "@/components/Footer";
import { CategoryKey } from "@/data/catalog";
import { useCatalog } from "@/components/CatalogProvider";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function BundleBrowser() {
  const { bundles, categories, loading, source } = useCatalog();
  const params = useSearchParams();
  const requestedCategory = params.get("category");
  const [active, setActive] = useState<CategoryKey | "all">("all");

  useEffect(() => {
    if (!requestedCategory || !categories.length) return;
    if (categories.some((category) => category.key === requestedCategory)) {
      setActive(requestedCategory);
    }
  }, [requestedCategory, categories]);

  const list = useMemo(
    () => active === "all" ? bundles : bundles.filter((bundle) => bundle.category === active),
    [active, bundles]
  );

  return <>
    <section className="subHero bundlesHero"><div className="subHeroBackdrop" /><div className="shell subHeroInner"><div><span className="eyebrow light">CURATED COLLECTIONS</span><h1>Small bundles.<br /><em>One big Godavari box.</em></h1><p>Choose from the live Godavari Basket catalog and combine the bundles you love into one box.</p></div></div></section>
    <section className="section shell"><div className="categoryTabs centered"><button className={active === "all" ? "active" : ""} onClick={() => setActive("all")}>Everything</button>{categories.map((category) => <button className={active === category.key ? "active" : ""} key={category.key} onClick={() => setActive(category.key)}>{category.name}</button>)}</div><div className="catalogHeading"><div><span className="eyebrow">{active === "all" ? "THE GODAVARI PANTRY" : "CURATED IN THIS CATEGORY"}</span><h2>{active === "all" ? "Choose the bundles that feel like home" : categories.find((category) => category.key === active)?.name}</h2></div><p>Mix categories freely. Your box keeps track of the total weight while you shop.</p></div>{loading && !bundles.length ? <div className="catalogState"><span className="catalogSpinner" /><h3>Loading collections…</h3></div> : list.length ? <div className="catalogGrid">{list.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} />)}</div> : <div className="catalogState"><h3>{source === "google-sheet" ? "No catalog items are available here yet." : "We couldn't load the catalog."}</h3><p>Please refresh or contact us on WhatsApp.</p></div>}</section>
  </>;
}

export default function BundlesPage() { return <main className="subPage"><Suspense fallback={<div className="pageLoader">Loading collections…</div>}><BundleBrowser /></Suspense><Footer /></main>; }
