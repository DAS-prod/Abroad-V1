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
