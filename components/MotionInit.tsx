"use client";

import { useEffect } from "react";

export default function MotionInit() {
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.1, rootMargin: "0px 0px -35px" });
    const register = () => document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => { if (!seen.has(node)) { seen.add(node); observer.observe(node); } });
    register();
    const mutations = new MutationObserver(register);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { mutations.disconnect(); observer.disconnect(); };
  }, []);
  return null;
}
