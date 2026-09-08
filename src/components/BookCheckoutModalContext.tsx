"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Forma za narudžbu je sad popup (modal) umjesto sekcije na stranici —
// ovaj kontekst dijeli otvoreno/zatvoreno stanje između svih "Naruči"/
// "Kupovina" dugmadi na stranici (hero, ponovljeni CTA, sticky trake,
// header) i samog modala u BookCheckout.tsx.
type ModalState = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const ModalContext = createContext<ModalState | null>(null);

export function BookCheckoutModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useBookCheckoutModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error(
      "useBookCheckoutModal mora biti unutar BookCheckoutModalProvider"
    );
  }
  return ctx;
}
