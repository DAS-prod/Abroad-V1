export const PACKAGING_WEIGHT_KG = 0.3;

// =========================================================
// CATEGORIES
// =========================================================

export type CategoryKey = string;

export type Category = {
  key: CategoryKey;
  name: string;
  kicker: string;
  description: string;
  image: string;
  accent?: string;
  subcategories?: string[];
};

// =========================================================
// CATALOG TYPE
// =========================================================

export type CatalogType =
  | "product"
  | "bundle"
  | "combo";

// =========================================================
// BUNDLE / CATALOG ITEM
// =========================================================

export type Bundle = {
  id: string;

  category: CategoryKey;

  categoryName?: string;

  parentCategory?: string;

  subcategory?: string;

  name: string;

  subtitle: string;

  weightKg: number;

  /*
   * Examples:
   * "250g"
   * "500g"
   * "1kg"
   * "5 kg"
   * "10 pieces"
   */
  sizeLabel?: string;

  priceInr: number;

  /*
   * Optional exact USD price from Google Sheet.
   * Safe to keep even if some catalog rows do not use it.
   */
  priceUsd?: number;

  image: string;

  items: string[];

  tags?: string[];

  popular?: boolean;

  active?: boolean;

  stock?: number;

  catalogType?: CatalogType;
};

// =========================================================
// BOX SIZES
// =========================================================

export const boxSizes = [
  {
    kg: 5,
    name: "Personal",
    description: "A compact box of favourites",
  },

  {
    kg: 10,
    name: "Family",
    description: "A fuller mix for home",
    popular: true,
  },

  {
    kg: 15,
    name: "Stock Up",
    description: "More of what you miss",
  },

  {
    kg: 20,
    name: "Big Box",
    description: "Made for sharing",
  },
];

// =========================================================
// COUNTRY / CURRENCY
// =========================================================

export const countries = [
  {
    code: "US",
    name: "USA",
    currency: "USD",
    symbol: "$",
    rate: 0.01042,
  },

  {
    code: "GB",
    name: "UK",
    currency: "GBP",
    symbol: "£",
    rate: 0.0092,
  },

  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    symbol: "C$",
    rate: 0.016,
  },

  {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    symbol: "A$",
    rate: 0.018,
  },

  {
    code: "AE",
    name: "UAE",
    currency: "AED",
    symbol: "AED ",
    rate: 0.044,
  },

  {
    code: "IN",
    name: "India",
    currency: "INR",
    symbol: "₹",
    rate: 1,
  },
];
