"use client";

import {
  Bundle,
  countries,
  PACKAGING_WEIGHT_KG,
} from "@/data/catalog";

import { useCatalog } from "@/components/CatalogProvider";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CartLine = {
  bundleId: string;
  quantity: number;
};

type BoxContextValue = {
  lines: CartLine[];

  selectedBoxKg: number;

  boxWeightChosen: boolean;

  chooseBoxWeight: (kg: number) => void;

  countryCode: string;

  giftMode: boolean;

  drawerOpen: boolean;

  toastMessage: string;

  totalProductWeight: number;

  packagingWeight: number;

  totalWeight: number;

  totalInr: number;


  itemCount: number;

  minimumReached: boolean;

  remainingToMinimum: number;

  selectedCountry: (typeof countries)[number];

  setSelectedBoxKg: (kg: number) => void;

  setCountryCode: (code: string) => void;

  setGiftMode: (value: boolean) => void;

  setDrawerOpen: (value: boolean) => void;

  addBundle: (bundleId: string) => void;

  removeBundle: (bundleId: string) => void;

  decrementBundle: (bundleId: string) => void;

  clearBox: () => void;

  replaceBox: (bundleIds: string[]) => void;

  getBundle: (id: string) => Bundle | undefined;

  getQuantity: (id: string) => number;
};

const BoxContext =
  createContext<BoxContextValue | null>(null);

const STORAGE_KEY =
  "gb-abroad-builder-v1";

const noop = () => {};

const SSR_BOX_FALLBACK: BoxContextValue = {
  lines: [],

  selectedBoxKg: 5,

  boxWeightChosen: false,

  chooseBoxWeight: noop,

  countryCode: "US",

  giftMode: false,

  drawerOpen: false,

  toastMessage: "",

  totalProductWeight: 0,

  packagingWeight: 0,

  totalWeight: 0,

  totalInr: 0,


  itemCount: 0,

  minimumReached: false,

  remainingToMinimum: 5,

  selectedCountry: countries[0]!,

  setSelectedBoxKg: noop,

  setCountryCode: noop,

  setGiftMode: noop,

  setDrawerOpen: noop,

  addBundle: noop,

  removeBundle: noop,

  decrementBundle: noop,

  clearBox: noop,

  replaceBox: noop,

  getBundle: () => undefined,

  getQuantity: () => 0,
};

export function BoxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    products,
    bundles,
    combos,
  } = useCatalog();

  const [
    lines,
    setLines,
  ] = useState<CartLine[]>([]);

  const [
    selectedBoxKg,
    setSelectedBoxKg,
  ] = useState(5);

  const [boxWeightChosen, setBoxWeightChosen] = useState(false);

  const chooseBoxWeight = (kg: number) => {
    setSelectedBoxKg(kg);
    setBoxWeightChosen(true);
  };

  const [
    countryCode,
    setCountryCode,
  ] = useState("US");

  const [
    giftMode,
    setGiftMode,
  ] = useState(false);

  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);

  const [
    toastMessage,
    setToastMessage,
  ] = useState("");

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  const toastTimer =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  /*
   * Normal bundles + combo packs.
   *
   * This allows both normal catalog items
   * and 5KG / 10KG / 15KG combos to use
   * the same cart system.
   */
  const allCatalogItems =
    useMemo(
      () => [
        ...products,
        ...bundles,
        ...combos,
      ],
      [
        products,
        bundles,
        combos,
      ]
    );

  const showToast = (
    message: string
  ) => {
    setToastMessage(message);

    if (
      toastTimer.current
    ) {
      clearTimeout(
        toastTimer.current
      );
    }

    toastTimer.current =
      setTimeout(
        () => {
          setToastMessage("");
        },
        1900
      );
  };

  /*
   * Restore saved cart
   * only after browser hydration.
   */
  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (raw) {
        const saved =
          JSON.parse(raw);

        setLines(
          Array.isArray(
            saved?.lines
          )
            ? saved.lines
            : []
        );

        setSelectedBoxKg(5);

        setCountryCode(
          saved?.countryCode ||
            "US"
        );

        setGiftMode(
          Boolean(
            saved?.giftMode
          )
        );
      }
    } catch {
      /*
       * Ignore broken /
       * unavailable localStorage.
       */
    }

    setHydrated(true);

    return () => {
      if (
        toastTimer.current
      ) {
        clearTimeout(
          toastTimer.current
        );
      }
    };
  }, []);

  /*
   * Save cart whenever
   * cart/settings change.
   */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,

        JSON.stringify({
          lines,

          selectedBoxKg,

          countryCode,

          giftMode,
        })
      );
    } catch {
      /*
       * Some private browsers may
       * disable localStorage.
       */
    }
  }, [
    lines,

    selectedBoxKg,

    countryCode,

    giftMode,

    hydrated,
  ]);

  const getBundle = (
    id: string
  ) =>
    allCatalogItems.find(
      (
        catalogItem
      ) =>
        catalogItem.id ===
        id
    );

  const getQuantity = (
    id: string
  ) =>
    lines.find(
      (line) =>
        line.bundleId === id
    )?.quantity || 0;

  /*
   * Actual food/product weight.
   *
   * Shipping uses THIS value,
   * not packaging weight.
   */
  const totalProductWeight =
    useMemo(() => {
      return lines.reduce(
        (
          sum,
          line
        ) => {
          const bundle =
            allCatalogItems.find(
              (
                catalogItem
              ) =>
                catalogItem.id ===
                line.bundleId
            );

          return (
            sum +
            (
              bundle?.weightKg ||
              0
            ) *
              line.quantity
          );
        },
        0
      );
    }, [
      lines,
      allCatalogItems,
    ]);

  /*
   * Packaging is shown separately.
   */
  const packagingWeight =
    lines.length > 0
      ? PACKAGING_WEIGHT_KG
      : 0;

  const totalWeight =
    Number(
      (
        totalProductWeight +
        packagingWeight
      ).toFixed(2)
    );

  /*
   * Total products INR value.
   */
  const totalInr =
    useMemo(() => {
      return lines.reduce(
        (
          sum,
          line
        ) => {
          const bundle =
            allCatalogItems.find(
              (
                catalogItem
              ) =>
                catalogItem.id ===
                line.bundleId
            );

          return (
            sum +
            (
              bundle?.priceInr ||
              0
            ) *
              line.quantity
          );
        },
        0
      );
    }, [
      lines,
      allCatalogItems,
    ]);

  const itemCount =
    lines.reduce(
      (
        sum,
        line
      ) =>
        sum +
        line.quantity,
      0
    );

  const minimumReached =
    totalWeight >= 5;

  const remainingToMinimum =
    Math.max(
      0,

      Number(
        (
          5 -
          totalWeight
        ).toFixed(2)
      )
    );

  const selectedCountry =
    countries.find(
      (
        country
      ) =>
        country.code ===
        countryCode
    ) ||
    countries[0]!;

  /*
   * Add item / combo.
   */
  const addBundle = (
    bundleId: string
  ) => {
    const bundle =
      getBundle(
        bundleId
      );

    setLines(
      (
        current
      ) => {
        const existing =
          current.find(
            (
              line
            ) =>
              line.bundleId ===
              bundleId
          );

        if (
          existing
        ) {
          return current.map(
            (
              line
            ) =>
              line.bundleId ===
              bundleId
                ? {
                    ...line,

                    quantity:
                      line.quantity +
                      1,
                  }
                : line
          );
        }

        return [
          ...current,

          {
            bundleId,

            quantity: 1,
          },
        ];
      }
    );

    showToast(
      bundle
        ? `${bundle.name} added to your box`
        : "Added to your Godavari Box"
    );
  };

  /*
   * Reduce quantity by 1.
   */
  const decrementBundle = (
    bundleId: string
  ) => {
    const bundle =
      getBundle(
        bundleId
      );

    setLines(
      (
        current
      ) =>
        current
          .map(
            (
              line
            ) =>
              line.bundleId ===
              bundleId
                ? {
                    ...line,

                    quantity:
                      line.quantity -
                      1,
                  }
                : line
          )
          .filter(
            (
              line
            ) =>
              line.quantity >
              0
          )
    );

    if (
      bundle
    ) {
      showToast(
        `${bundle.name} updated`
      );
    }
  };

  /*
   * Remove entire line.
   */
  const removeBundle = (
    bundleId: string
  ) => {
    const bundle =
      getBundle(
        bundleId
      );

    setLines(
      (
        current
      ) =>
        current.filter(
          (
            line
          ) =>
            line.bundleId !==
            bundleId
        )
    );

    if (
      bundle
    ) {
      showToast(
        `${bundle.name} removed`
      );
    }
  };

  /*
   * Empty complete box.
   */
  const clearBox = () => {
    setLines([]);

    showToast(
      "Your box is empty"
    );
  };

  /*
   * Used by suggested/custom
   * bundle builder.
   */
  const replaceBox = (
    bundleIds: string[]
  ) => {
    const counts =
      new Map<
        string,
        number
      >();

    bundleIds.forEach(
      (
        id
      ) => {
        counts.set(
          id,

          (
            counts.get(
              id
            ) || 0
          ) + 1
        );
      }
    );

    setLines(
      Array.from(
        counts,

        ([
          bundleId,
          quantity,
        ]) => ({
          bundleId,

          quantity,
        })
      )
    );

    showToast(
      "Your suggested Godavari Box is ready"
    );
  };

  const value: BoxContextValue =
    {
      lines,

      selectedBoxKg,

      boxWeightChosen,

      chooseBoxWeight,

      countryCode,

      giftMode,

      drawerOpen,

      toastMessage,

      totalProductWeight,

      packagingWeight,

      totalWeight,

      totalInr,


      itemCount,

      minimumReached,

      remainingToMinimum,

      selectedCountry,

      setSelectedBoxKg,

      setCountryCode,

      setGiftMode,

      setDrawerOpen,

      addBundle,

      removeBundle,

      decrementBundle,

      clearBox,

      replaceBox,

      getBundle,

      getQuantity,
    };

  return (
    <BoxContext.Provider
      value={value}
    >
      {children}
    </BoxContext.Provider>
  );
}

export function useBox() {
  const context =
    useContext(
      BoxContext
    );

  if (
    context
  ) {
    return context;
  }

  /*
   * Next.js prerenders Client Components
   * during `next build`.
   *
   * This prevents the static-generation
   * stage from crashing before browser
   * hydration.
   */
  if (
    typeof window ===
    "undefined"
  ) {
    return SSR_BOX_FALLBACK;
  }

  /*
   * If this happens in the browser,
   * there really is a component outside
   * BoxProvider and we still want the
   * error to be visible.
   */
  throw new Error(
    "useBox must be used inside BoxProvider"
  );
}
