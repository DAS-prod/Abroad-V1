"use client";

import { useState } from "react";
import BundleCard from "@/components/BundleCard";
import Footer from "@/components/Footer";
import { useCatalog } from "@/components/CatalogProvider";
import { useBox } from "@/components/BoxProvider";

type OrderView = "combos" | "custom" | "catalog";

const orderViews: { id: OrderView; title: string }[] = [
  { id: "combos", title: "Ready-Made Combos" },
  { id: "custom", title: "Build Your Box" },
  { id: "catalog", title: "Full Catalog" },
];

function OrderIcon({ type }: { type: OrderView }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.65, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (type === "combos") return <svg {...common}><path d="M3.5 9h17l-1.4 10.5H4.9L3.5 9Z"/><path d="m7.5 9 3-5m6 5-3-5M9 13v3m6-3v3"/></svg>;
  if (type === "custom") return <svg {...common}><path d="M4 8.5 12 4l8 4.5v10L12 23l-8-4.5v-10Z"/><path d="m4 8.5 8 4.5 8-4.5M12 13v10M8 6.2l8 4.5"/></svg>;
  return <svg {...common}><path d="M4.5 5.5c2.7-.9 5.2-.7 7.5.6 2.3-1.3 4.8-1.5 7.5-.6v13c-2.7-.9-5.2-.7-7.5.6-2.3-1.3-4.8-1.5-7.5-.6v-13ZM12 6.1v13M7 9h2.5M14.5 9H17M7 12h2.5m5 0H17"/></svg>;
}

export default function Home() {
  const { combos, bundles, products, loading, error, refreshCatalog } = useCatalog();
  const { totalWeight, setDrawerOpen, itemCount } = useBox();
  const [activeView, setActiveView] = useState<OrderView>("combos");

  const catalogItems = activeView === "combos" ? combos : activeView === "custom" ? bundles : products;
  const active = orderViews.find((view) => view.id === activeView)!;

  const chooseView = (view: OrderView) => {
    setActiveView(view);
    document.getElementById("order-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="editorialHome">
      <section className="editorialHero" aria-labelledby="home-title">
        <picture>
          <source media="(max-width: 600px)" srcSet="/images/abroad/hero-mobile.webp" />
          <img className="editorialHeroImage" src="/images/abroad/hero-desktop.webp" alt="Godavari food prepared for delivery abroad" />
        </picture>
        <div className="editorialHeroShade" />
        <div className="shell editorialHeroInner">
          <div className="editorialHeroCopy">
            <span className="editorialKicker">GODAVARI BASKET ABROAD</span>
            <h1 id="home-title">Authentic flavours<br /><em>from Godavari.</em></h1>
            <p>Traditional favourites, freshly prepared and shared with you across the miles.</p>
            <div className="editorialHeroActions">
              <button type="button" onClick={() => chooseView("combos")}>Explore combos <span aria-hidden="true">↗</span></button>
              <button type="button" className="secondary" onClick={() => chooseView("custom")}>Build your box</button>
            </div>
          </div>
          <div className="editorialSignature">From Godavari,<br />With Love. <span>♡</span></div>
        </div>
      </section>

      <section className="shell editorialOrdering" id="order-section" aria-label="Ways to order">
        <div className="editorialTabs" role="tablist" aria-label="Choose how to shop">
          {orderViews.map((view) => (
            <button type="button" key={view.id} role="tab" id={`order-tab-${view.id}`} aria-controls="order-panel" aria-selected={activeView === view.id} className={activeView === view.id ? "editorialTab active" : "editorialTab"} onClick={() => chooseView(view.id)}>
              <span className="editorialTabIcon"><OrderIcon type={view.id} /></span>
              <span className="editorialTabTitle">{view.title}</span>
            </button>
          ))}
        </div>
        <div className="editorialPromise"><span>Minimum order: 5 kg</span><i /><span>Fresh batch dispatched every Monday</span><i /><span>Shipping confirmed on WhatsApp</span></div>

        <div className="editorialSelection" role="tabpanel" id="order-panel" aria-labelledby={`order-tab-${activeView}`}>
          <div className="editorialSectionHeading">
            <div><span className="editorialKicker">FROM OUR GODAVARI PANTRY</span><h2>{active.title}</h2><p>{activeView === "combos" ? "Carefully curated collections of the flavours you love." : activeView === "custom" ? "Select bundles across categories to make a box that feels like home." : "Explore the live catalog, view product details, and add your favourites to the same box."}</p></div>
          </div>

          {loading && !catalogItems.length ? <div className="editorialState">Gathering our Godavari collection…</div> : catalogItems.length ? <div className="editorialProducts">{catalogItems.map((item, index) => <BundleCard key={item.id} bundle={item} revealIndex={index} immediateReveal />)}</div> : <div className="editorialState"><h3>{activeView === "combos" ? "Combos will appear here when they are available." : "This collection is being updated."}</h3>{error && <p>{error}</p>}<button type="button" onClick={() => refreshCatalog()}>Try again</button></div>}

          {itemCount > 0 && <div className="editorialCartBar"><div><span>Your Godavari Box</span><strong>{itemCount} items · {totalWeight.toFixed(1)} kg</strong></div><button type="button" onClick={() => setDrawerOpen(true)}>Review your box <span aria-hidden="true">→</span></button></div>}
        </div>
      </section>
      <section className="editorialClosing"><div className="shell"><span className="editorialKicker">FROM GODAVARI, WITH LOVE</span><h2>A little closer to home.</h2><p>Choose your favourites, build a box of at least 5 kg, and complete your order with our team on WhatsApp.</p></div></section>
      <Footer />
    </main>
  );
}
