import { NextResponse } from "next/server";
import type { Bundle } from "@/data/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type SheetRow = Record<string, string>;
type CatalogType = "product" | "bundle" | "combo";

/* -------------------------------------------------------
   CSV PARSER
------------------------------------------------------- */

function parseCsv(text: string): SheetRow[] {
  const rows: string[][] = [];

  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if (
      (char === "\n" || char === "\r") &&
      !quoted
    ) {
      if (
        char === "\r" &&
        next === "\n"
      ) {
        i += 1;
      }

      row.push(field);
      field = "";

      if (
        row.some(
          (value) =>
            value.trim() !== ""
        )
      ) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);

  if (
    row.some(
      (value) =>
        value.trim() !== ""
    )
  ) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  const headers =
    rows[0].map(
      (header) =>
        header
          .replace(
            /^\uFEFF/,
            ""
          )
          .trim()
          .toLowerCase()
          .replace(
            /\s+/g,
            "_"
          )
    );

  return rows
    .slice(1)
    .map((cells) => {
      const object: SheetRow =
        {};

      headers.forEach(
        (
          header,
          index
        ) => {
          object[header] =
            (
              cells[index] ||
              ""
            ).trim();
        }
      );

      return object;
    });
}

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function slugify(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

function isTruthy(
  value:
    | string
    | undefined,
  defaultValue = true
) {
  if (
    value === undefined ||
    value === null ||
    value.trim() === ""
  ) {
    return defaultValue;
  }

  const normalized =
    value
      .toLowerCase()
      .trim();

  return ![
    "0",
    "false",
    "no",
    "inactive",
    "disabled",
    "off",
  ].includes(
    normalized
  );
}

function parseNumber(
  value?: string
) {
  if (!value) {
    return 0;
  }

  const cleaned =
    value
      .replace(
        /,/g,
        ""
      )
      .replace(
        /[^\d.-]/g,
        ""
      );

  const number =
    Number(cleaned);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

function parseWeightKg(
  value?: string
) {
  if (!value) {
    return 0;
  }

  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /,/g,
        ""
      );

  const number =
    parseNumber(
      normalized
    );

  if (!number) {
    return 0;
  }

  if (
    normalized.includes(
      "mg"
    )
  ) {
    return (
      number /
      1_000_000
    );
  }

  if (
    normalized.includes(
      "gram"
    ) ||
    /\d+(?:\.\d+)?\s*(?:g|gm)\b/.test(
      normalized
    )
  ) {
    return (
      number / 1000
    );
  }

  return number;
}

function splitValues(
  value?: string
) {
  if (!value) {
    return [];
  }

  return value
    .split(
      /\s*[|;]\s*|\s*,\s*/
    )
    .map(
      (item) =>
        item.trim()
    )
    .filter(Boolean);
}

function firstValue(
  row: SheetRow,
  keys: string[]
) {
  for (
    const key of keys
  ) {
    const value =
      row[key]?.trim();

    if (value) {
      return value;
    }
  }

  return "";
}

/* -------------------------------------------------------
   GOOGLE SHEET URL NORMALIZER

   This means you can paste either:

   https://docs.google.com/spreadsheets/d/ID/edit?gid=123

   OR

   https://docs.google.com/spreadsheets/d/ID/gviz/tq?tqx=out:csv&gid=123

------------------------------------------------------- */

function normalizeGoogleSheetUrl(
  rawUrl: string
) {
  const trimmed =
    rawUrl.trim();

  if (!trimmed) {
    return "";
  }

  const url =
    new URL(trimmed);

  if (
    url.hostname !==
    "docs.google.com"
  ) {
    return trimmed;
  }

  const match =
    url.pathname.match(
      /\/spreadsheets\/d\/([^/]+)/
    );

  if (!match) {
    return trimmed;
  }

  const spreadsheetId =
    match[1];

  const gid =
    url.searchParams.get(
      "gid"
    ) || "0";

  return (
    `https://docs.google.com/spreadsheets/d/` +
    `${spreadsheetId}/gviz/tq?tqx=out:csv&gid=` +
    encodeURIComponent(
      gid
    )
  );
}

/* -------------------------------------------------------
   FETCH A GOOGLE SHEET TAB
------------------------------------------------------- */

async function fetchSheetRows(
  rawUrl: string,
  label: string
) {
  const normalizedUrl =
    normalizeGoogleSheetUrl(
      rawUrl
    );

  const url =
    new URL(
      normalizedUrl
    );

  url.searchParams.set(
    "_gb_refresh",
    Date.now().toString()
  );

  const response =
    await fetch(
      url.toString(),
      {
        method: "GET",

        cache:
          "no-store",

        headers: {
          "Cache-Control":
            "no-cache, no-store, must-revalidate",

          Pragma:
            "no-cache",

          "User-Agent":
            "GodavariBasketAbroad/1.0",
        },
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `${label} Google Sheet returned HTTP ${response.status}`
    );
  }

  const csv =
    await response.text();

  if (
    !csv ||
    csv.trim().length ===
      0
  ) {
    throw new Error(
      `${label} Google Sheet returned an empty response.`
    );
  }

  /*
   * Google sometimes returns
   * a sign-in HTML page if
   * Sheet permissions are wrong.
   */
  if (
    /<!doctype html|<html/i.test(
      csv.slice(
        0,
        500
      )
    )
  ) {
    throw new Error(
      `${label} Google Sheet returned HTML instead of CSV. Make sure the Sheet has view access.`
    );
  }

  return parseCsv(csv);
}

/* -------------------------------------------------------
   CONVERT SHEET ROW -> CATALOG PRODUCT

   IMPORTANT:
   forcedType controls the destination.

   Bundle Sheet -> bundle
   Combos Sheet -> combo

   We DO NOT depend on catalog_type
   anymore for the Combos sheet.
------------------------------------------------------- */

function rowToCatalogItem(
  row: SheetRow,
  index: number,
  forcedType: CatalogType,
  sheetLabel: string
): Bundle | null {
  /*
   * active:
   *
   * TRUE / 1 / blank = visible
   * FALSE / 0 = hidden
   */
  if (
    !isTruthy(
      row.active,
      true
    )
  ) {
    return null;
  }

  const defaultCategory =
    forcedType ===
    "combo"
      ? "Combos"
      : "";

  const categoryName =
    firstValue(
      row,
      [
        "category",

        "parent_category",

        "catalog",

        "collection",
      ]
    ) ||
    defaultCategory;

  const category =
    slugify(
      categoryName
    );

  if (!category) {
    console.warn(
      `Skipping ${sheetLabel} row ${
        index + 2
      }: category is required.`
    );

    return null;
  }

  const name =
    firstValue(
      row,
      [
        "name",

        "bundle_name",

        "product_name",

        "combo_name",
      ]
    );

  if (!name) {
    console.warn(
      `Skipping ${sheetLabel} row ${
        index + 2
      }: name is required.`
    );

    return null;
  }

  const rawWeight =
    firstValue(
      row,
      [
        "weight_kg",

        "weightkg",

        "bundle_weight_kg",

        "bundle_weight",

        "combo_weight_kg",

        "combo_weight",

        "combo_size",

        "weight",

        "kg",

        "size",
      ]
    );

  const sizeLabel =
    row.size?.trim() ||
    rawWeight;

  const explicitShippingWeight =
    firstValue(
      row,
      [
        "shipping_weight_kg",
        "product_weight_kg",
        "weight_kg",
        "weightkg",
      ]
    );

  const sizeHasWeightUnit =
    /\bkg\b|kilogram|gram|\bgm?\b|\bmg\b/i.test(
      sizeLabel
    );

  /*
   * Individual product rows sometimes use labels such as
   * "10 Pieces" or "1 packet" rather than a numeric weight.
   * Use an explicit shipping_weight_kg column when present.
   * Until that optional column is added, one catalog pack is
   * treated as 1 kg so the existing 5 kg box flow still works.
   */
  const weightKg =
    forcedType === "product"
      ? explicitShippingWeight
        ? parseWeightKg(explicitShippingWeight)
        : sizeHasWeightUnit
          ? parseWeightKg(sizeLabel)
          : 1
      : parseWeightKg(rawWeight);

  if (
    weightKg <= 0
  ) {
    console.warn(
      `Skipping ${sheetLabel} row ${
        index + 2
      }: valid weight is required for ${name}`
    );

    return null;
  }

  const priceInr =
    parseNumber(
      firstValue(
        row,
        [
          "price_inr",

          "combo_price_inr",

          "bundle_price",

          "combo_price",

          "price",

          "seller_price",

          "1kg",
        ]
      )
    );

  /*
   * Combo needs a price because
   * it can be added directly
   * to the customer's box.
   */
  if (
    priceInr <= 0
  ) {
    console.warn(
      `Skipping ${sheetLabel} row ${
        index + 2
      }: valid price is required for ${name}`
    );

    return null;
  }

  const items =
    splitValues(
      firstValue(
        row,
        [
          "items",

          "products",

          "includes",

          "bundle_items",

          "combo_items",
        ]
      )
    );

  const tags =
    splitValues(
      row.tags
    );

  const subcategory =
    firstValue(
      row,
      [
        "subcategory",

        "sub_category",
      ]
    );

  const parentCategory =
    row.parent_category
      ?.trim() || "";

  const image =
    firstValue(
      row,
      [
        "image",

        "image_url",

        "photo",

        "photo_url",
      ]
    ) ||
    "/images/brand/logo.webp";

  const sourceId =
    row.id?.trim() ||
    `${slugify(
      name
    )}-${index + 1}`;

  const id =
    forcedType === "product"
      ? `product-${sourceId}`
      : sourceId;

  return {
    id,

    category,

    categoryName,

    parentCategory:
      parentCategory ||
      undefined,

    subcategory:
      subcategory ||
      undefined,

    name,

    subtitle:
      firstValue(
        row,
        [
          "subtitle",

          "description",
        ]
      ),

    weightKg,

    sizeLabel:
      sizeLabel ||
      `${weightKg} kg`,

    priceInr,

    image,

    items:
      items.length > 0
        ? items
        : [name],

    tags,

    popular:
      isTruthy(
        row.popular ||
          row.featured,
        false
      ),

    catalogType:
      forcedType,
  };
}

/* -------------------------------------------------------
   API
------------------------------------------------------- */

export async function GET() {
  const catalogSheetUrl =
    process.env
      .ABROAD_CATALOG_SHEET_URL
      ?.trim() ||
    "";

  /*
   * NORMAL BUNDLES SHEET
   *
   * ABROAD_GOOGLE_SHEET_URL is
   * retained for backward compatibility.
   */
  const bundlesSheetUrl =
    process.env
      .ABROAD_BUNDLES_SHEET_URL
      ?.trim() ||

    process.env
      .ABROAD_GOOGLE_SHEET_URL
      ?.trim() ||

    process.env
      .GLOBAL_GOOGLE_SHEET_URL
      ?.trim() ||

    "";

  /*
   * DEDICATED COMBOS SHEET
   */
  const combosSheetUrl =
    process.env
      .ABROAD_COMBOS_SHEET_URL
      ?.trim() ||
    "";

  if (
    !catalogSheetUrl &&
    !bundlesSheetUrl &&
    !combosSheetUrl
  ) {
    return NextResponse.json(
      {
        products: [],

        bundles: [],

        combos: [],

        source:
          "not-configured",

        envLoaded:
          false,

        count: 0,

        comboCount: 0,

        refreshedAt:
          new Date().toISOString(),

        error:
          "Google Sheet URLs are not configured.",
      },
      {
        status: 503,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }

  let bundleRows:
    SheetRow[] = [];

  let productRows:
    SheetRow[] = [];

  let comboRows:
    SheetRow[] = [];

  const errors:
    string[] = [];

  let loadedSheets =
    0;

  /* ---------------------------
     LOAD PRODUCT CATALOG SHEET
  --------------------------- */

  if (
    catalogSheetUrl
  ) {
    try {
      productRows =
        await fetchSheetRows(
          catalogSheetUrl,
          "Product catalog"
        );

      loadedSheets += 1;
    } catch (error) {
      console.error(
        "Product Catalog Sheet error:",
        error
      );

      errors.push(
        error instanceof Error
          ? error.message
          : "Unable to load Product Catalog Sheet."
      );
    }
  }

  /* ---------------------------
     LOAD BUNDLES SHEET
  --------------------------- */

  if (
    bundlesSheetUrl
  ) {
    try {
      bundleRows =
        await fetchSheetRows(
          bundlesSheetUrl,
          "Bundles"
        );

      loadedSheets += 1;
    } catch (error) {
      console.error(
        "Bundles Sheet error:",
        error
      );

      errors.push(
        error instanceof
          Error
          ? error.message
          : "Unable to load Bundles Sheet."
      );
    }
  }

  /* ---------------------------
     LOAD COMBOS SHEET
  --------------------------- */

  if (
    combosSheetUrl
  ) {
    try {
      comboRows =
        await fetchSheetRows(
          combosSheetUrl,
          "Combos"
        );

      loadedSheets += 1;
    } catch (error) {
      console.error(
        "Combos Sheet error:",
        error
      );

      errors.push(
        error instanceof
          Error
          ? error.message
          : "Unable to load Combos Sheet."
      );
    }
  } else {
    errors.push(
      "ABROAD_COMBOS_SHEET_URL is not configured."
    );
  }

  /*
   * If neither Sheet loaded,
   * return an actual API error.
   */
  if (
    loadedSheets === 0
  ) {
    return NextResponse.json(
      {
        products: [],

        bundles: [],

        combos: [],

        source:
          "error",

        envLoaded:
          true,

        count: 0,

        comboCount: 0,

        productSheetRows:
          0,

        bundleSheetRows:
          0,

        comboSheetRows:
          0,

        sheetRows:
          0,

        refreshedAt:
          new Date().toISOString(),

        error:
          errors.join(
            " "
          ),
      },
      {
        status: 502,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }

  /* ---------------------------
     BUILD NORMAL BUNDLES
  --------------------------- */

  const bundles =
    bundleRows
      .map(
        (
          row,
          index
        ) =>
          rowToCatalogItem(
            row,
            index,
            "bundle",
            "Bundles"
          )
      )
      .filter(
        (
          item
        ): item is Bundle =>
          Boolean(
            item
          )
      );

  /* ---------------------------
     BUILD INDIVIDUAL PRODUCTS
  --------------------------- */

  const products =
    productRows
      .map(
        (
          row,
          index
        ) =>
          rowToCatalogItem(
            row,
            index,
            "product",
            "Product catalog"
          )
      )
      .filter(
        (
          item
        ): item is Bundle =>
          Boolean(
            item
          )
      );

  /* ---------------------------
     BUILD COMBOS

     IMPORTANT:
     EVERYTHING FROM COMBOS
     SHEET IS FORCED TO "combo".
  --------------------------- */

  const combos =
    comboRows
      .map(
        (
          row,
          index
        ) =>
          rowToCatalogItem(
            row,
            index,
            "combo",
            "Combos"
          )
      )
      .filter(
        (
          item
        ): item is Bundle =>
          Boolean(
            item
          )
      );

  /*
   * Display combos in order:
   *
   * 5 KG
   * 10 KG
   * 15 KG
   *
   * Then alphabetically
   * within same weight.
   */
  combos.sort(
    (
      a,
      b
    ) =>
      a.weightKg -
        b.weightKg ||
      a.name.localeCompare(
        b.name
      )
  );

  return NextResponse.json(
    {
      products,

      bundles,

      combos,

      source:
        "google-sheet",

      envLoaded:
        true,

      count:
        bundles.length,

      productCount:
        products.length,

      comboCount:
        combos.length,

      productSheetRows:
        productRows.length,

      bundleSheetRows:
        bundleRows.length,

      comboSheetRows:
        comboRows.length,

      sheetRows:
        productRows.length +
        bundleRows.length +
        comboRows.length,

      refreshedAt:
        new Date().toISOString(),

      error:
        errors.length
          ? errors.join(
              " "
            )
          : undefined,
    },
    {
      status: 200,

      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, max-age=0",

        Pragma:
          "no-cache",

        Expires:
          "0",
      },
    }
  );
}
