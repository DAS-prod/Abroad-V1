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
    </header>
  );
}
