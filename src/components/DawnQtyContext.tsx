"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const QtyContext = createContext<{
  qty: number;
  setQty: (n: number) => void;
} | null>(null);

export function DawnQtyProvider({ children }: { children: ReactNode }) {
  const [qty, setQtyState] = useState(1);
  const setQty = (n: number) => setQtyState(Math.min(9, Math.max(1, n)));
  return (
    <QtyContext.Provider value={{ qty, setQty }}>
      {children}
    </QtyContext.Provider>
  );
}

export function useDawnQty() {
  const ctx = useContext(QtyContext);
  if (!ctx) throw new Error("useDawnQty must be used inside DawnQtyProvider");
  return ctx;
}
