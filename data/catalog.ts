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

export type CatalogType = "product" | "bundle" | "combo";

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
  sizeLabel?: string;

  // Prices in the Google Sheets are USD values.
  priceUsd: number;

  variants?: {
    size: string;
    weightKg: number;
    priceUsd: number;
    id: string;
  }[];

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
// SHIPPING DESTINATIONS — ALL PRICES ARE USD
// =========================================================

export const countries = [
  { code: "US", name: "USA" },
  { code: "GB", name: "UK" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "UAE" },
  { code: "IN", name: "India" },
];
