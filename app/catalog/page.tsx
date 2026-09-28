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
