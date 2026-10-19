"use client";

import { usePathname, useRouter } from "next/navigation";
import { boxSizes } from "@/data/catalog";
import { useBox } from "./BoxProvider";

export default function BoxSizeSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedBoxKg, chooseBoxWeight } = useBox();

  const scrollToCatalog = () => {
    // On the Build page the catalog may still be hydrating from the Google Sheet.
    // A couple of frames gives React time to paint the selected state before scrolling.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById("catalog")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  const selectBox = (kg: number) => {
    chooseBoxWeight(kg);

    if (pathname !== "/build") {
      // Do not use a hash here. Browsers can jump to #catalog before the async
      // catalog cards have rendered, which was creating a blank-looking section.
      // The Build page waits for the catalog UI and performs the scroll itself.
      router.push(`/build?box=${kg}&catalog=1`);
      return;
    }

    scrollToCatalog();
  };

  return (
    <div className="boxSizeGrid">
      {boxSizes.map((box) => (
        <button
          key={box.kg}
          type="button"
          className={selectedBoxKg === box.kg ? "boxSize active" : "boxSize"}
          onClick={() => selectBox(box.kg)}
          aria-pressed={selectedBoxKg === box.kg}
        >
          {box.popular && <span className="popularFlag">Most Popular</span>}
          <div className="boxGlyph" aria-hidden="true">◆</div>
          <span className="boxSizeLabel">
            <span className="boxSizeWeight"><b>{box.kg}</b><em>KG</em></span>
            <strong>{box.name}</strong>
            <small>{box.description}</small>
          </span>
          <i className="boxSizeCheck" aria-hidden="true">{selectedBoxKg === box.kg ? "✓" : "→"}</i>
        </button>
      ))}
    </div>
  );
}
