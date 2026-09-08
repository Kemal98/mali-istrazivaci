"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useBookCheckoutModal } from "./BookCheckoutModalContext";

// Zajedničko dugme/link za sve "Naruči"/"Kupovina" pozive na stranici —
// otvara modal formu umjesto skrolanja na sekciju. Ostaje <a href="#naruci">
// (ne <button>) namjerno: PixelEvents.tsx globalno sluša klik na tačno taj
// selektor za InitiateCheckout, pa preventDefault ovdje ne dira to praćenje
// — event handler u PixelEvents.tsx je nezavisan i i dalje puca.
export default function BookOrderTrigger({
  children,
  ...rest
}: { children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { setOpen } = useBookCheckoutModal();
  return (
    <a
      href="#naruci"
      {...rest}
      onClick={(e) => {
        e.preventDefault();
        setOpen(true);
      }}
    >
      {children}
    </a>
  );
}
