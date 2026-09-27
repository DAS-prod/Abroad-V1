"use client";

import { useBox } from "./BoxProvider";

export default function Price({ inr, suffix }: { inr: number; suffix?: string }) {
  const { selectedCountry } = useBox();
  const value = inr * selectedCountry.rate;
  const digits = selectedCountry.currency === "INR" ? 0 : 0;
  return (
    <span title="Indicative converted price; final checkout can use live pricing">
      {selectedCountry.symbol}{value.toLocaleString(undefined, { maximumFractionDigits: digits })}{suffix || ""}
    </span>
  );
}
