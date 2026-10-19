"use client";

import { useBox } from "./BoxProvider";
import { usePathname } from "next/navigation";

export default function FloatingBox() {
  const { totalWeight, itemCount, minimumReached, setDrawerOpen } = useBox();
  const pathname = usePathname();
  if (!itemCount || !["/build", "/bundles", "/catalog"].includes(pathname)) return null;
  const progress = Math.min(100, (totalWeight / 5) * 100);
  return (
    <button className={itemCount > 0 ? "floatingBox hasItems" : "floatingBox"} onClick={() => setDrawerOpen(true)} aria-label="View your Godavari box">
      <span className="floatingIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.8 8.2h10.4l1 11H5.8l1-11Z" /><path d="M9 9V6.8a3 3 0 0 1 6 0V9" /></svg></span>
      <span className="floatingCopy">
        <small>{minimumReached ? "Minimum reached ✓" : "Your Godavari Box"}</small>
        <b>{totalWeight.toFixed(1)} kg · 5 kg minimum</b>
        <i className="animatedProgress"><em style={{ width: `${progress}%` }} /></i>
      </span>
      {itemCount > 0 && <span className="floatCount">{itemCount}</span>}
    </button>
  );
}
