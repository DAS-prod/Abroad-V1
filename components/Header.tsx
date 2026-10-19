"use client";

import Link from "next/link";
import { countries } from "@/data/catalog";
import { useBox } from "./BoxProvider";
import { useState } from "react";
import { usePathname } from "next/navigation";

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.8 8.2h10.4l1 11H5.8l1-11Z" />
      <path d="M9 9V6.8a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

export default function Header() {
  const { countryCode, setCountryCode, itemCount, setDrawerOpen } = useBox();
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerQuery, setHeaderQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    ["/", "Home"],
    ["/build", "Build Your Box"],
    ["/bundles", "Bundles"],
    ["/combos", "Combos"],
    ["/catalog", "Add-ons"],
    ["/about", "Our Godavari"],
  ];

  return (
    <header className="siteHeader">
      <div className="headerInner shell">
        <Link className="brand" href="/" aria-label="Godavari Basket Abroad home">
          <span className="brandLogoWrap">
            <img src="/images/brand/logo.webp" alt="" />
          </span>
          <span className="brandWords">
            <strong>ABROAD</strong>
            <small>FROM GODAVARI, WITH LOVE.</small>
          </span>
        </Link>

        <nav className={menuOpen ? "mainNav open" : "mainNav"}>
          {links.map(([href, label]) => (
            <Link
              className={pathname === href ? "active" : ""}
              href={href}
              key={href}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="headerActions">
          <label className="countrySelect">
            <span>◎</span>
            <select
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="headerSearchButton" aria-label="Search products" aria-expanded={searchOpen} aria-controls="header-product-search" onClick={() => setSearchOpen(!searchOpen)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg></button>
          <Link href="/account" className="abroadAccountLink" aria-label="Your account" title="Your account"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2"/></svg></Link>
          <button
            className="bagButton"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open your Godavari box"
          >
            <BagIcon />
            {itemCount > 0 && <b>{itemCount}</b>}
          </button>

          <button
            className="menuButton"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            <i />
            <i />
            <i />
          </button>
        </div>
      </div>
      {searchOpen && <div className="headerSearchPanel" id="header-product-search"><form className="shell" action="/catalog" role="search"><label htmlFor="header-search">Find your Godavari favourites</label><div><input autoFocus id="header-search" name="q" type="search" value={headerQuery} onChange={e=>setHeaderQuery(e.target.value)} placeholder="Search pickles, sweets, snacks…" onKeyDown={e=>{if(e.key==="Escape")setSearchOpen(false)}}/><button type="submit">Search →</button><button type="button" aria-label="Close search" onClick={()=>setSearchOpen(false)}>×</button></div></form></div>}
    </header>
  );
}
