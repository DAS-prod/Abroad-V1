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
