"use client";

import { useEffect, useState } from "react";

export default function IntroAnimation() {
  const [stage, setStage] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 0–1 sec: Logo
    const logoTimer = window.setTimeout(() => {
      setStage(1);
    }, 1000);

    // 1–2 sec: Tagline
    const taglineTimer = window.setTimeout(() => {
      setStage(2);
    }, 2000);

    // Hold briefly, then slowly dissolve into homepage
    const exitTimer = window.setTimeout(() => {
      setStage(3);
    }, 2700);

    // Fade lasts ~1.2 sec, then remove intro completely
    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => {
      window.clearTimeout(logoTimer);
      window.clearTimeout(taglineTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`gbIntro ${
        stage === 3 ? "gbIntroLeaving" : ""
      }`}
      aria-hidden="true"
    >
      <div className="gbIntroContent">
        {/* LOGO */}
        <div className="gbIntroLogo">
          <img
            src="/images/brand/logo.webp"
            alt="Godavari Basket"
          />
        </div>

        {/* TAGLINE */}
        <div
          className={`gbIntroTagline ${
            stage >= 1
              ? "gbIntroTaglineVisible"
              : ""
          }`}
        >
          <p>
            Authentic Goodness From Godavari
          </p>

          <div className="gbIntroOrnament">
            <span />
            <b>✦</b>
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
