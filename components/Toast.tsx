"use client";

import { useBox } from "./BoxProvider";

export default function Toast() {
  const { toastMessage } = useBox();
  return (
    <div className={toastMessage ? "gbToast show" : "gbToast"} role="status" aria-live="polite">
      <span>✓</span>
      <p>{toastMessage}</p>
    </div>
  );
}
