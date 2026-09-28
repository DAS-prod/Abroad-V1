import { countries } from "./catalog";

const usdRate = countries.find((country) => country.code === "US")!.rate;

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(inr: number): string {
  return usdFormatter.format(inr * usdRate);
}
