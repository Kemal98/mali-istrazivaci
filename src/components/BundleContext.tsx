"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { ProductBundle } from "@/lib/cms/types";

// Dijeli izabrani paket između PaketiPicker (u Hero sekciji) i CmsCheckout
// (modal za narudžbu) — ista mehanika kao DawnQtyContext za količinu.
// null = paketi nisu uključeni za ovaj proizvod (ponaša se kao do sad).
type BundleState = {
  bundle: ProductBundle | null;
  setBundle: (b: ProductBundle) => void;
};

const BundleContext = createContext<BundleState | null>(null);

export function BundleProvider({
  initial,
  children,
}: {
  initial: ProductBundle | null;
  children: ReactNode;
}) {
  const [bundle, setBundle] = useState<ProductBundle | null>(initial);
  return (
    <BundleContext.Provider value={{ bundle, setBundle }}>
      {children}
    </BundleContext.Provider>
  );
}

export function useBundle() {
  const ctx = useContext(BundleContext);
  if (!ctx) throw new Error("useBundle mora biti unutar BundleProvider");
  return ctx;
}
