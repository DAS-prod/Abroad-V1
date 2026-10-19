"use client";

export default function Price({ usd, suffix, digits }: { usd: number; suffix?: string; digits?: number }) {
  const precision = digits ?? 0;
  return (
    <span>
      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: precision, maximumFractionDigits: precision }).format(usd)}{suffix || ""}
    </span>
  );
}
