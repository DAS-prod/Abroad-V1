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

  // Available pack prices from the catalog Sheet, in INR.
  variants?: { size: string; weightKg: number; priceInr: number; id: string }[];

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
