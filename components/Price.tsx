"use client";

import { useBox } from "./BoxProvider";

export default function Price({ inr, suffix, digits }: { inr: number; suffix?: string; digits?: number }) {
  const { selectedCountry } = useBox();
  const value = inr * selectedCountry.rate;
  const precision = digits ?? 0;
  return (
    <span title="Indicative converted price; final checkout can use live pricing">
      {selectedCountry.symbol}{value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}{suffix || ""}
    </span>
  );
}
