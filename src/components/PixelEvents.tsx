"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Jedan red po proizvod-stranici — dodavanje nove stranice znači dodati
// jedan red ovdje, ne još jednu ternary granu. "/" namjerno nije ovdje
// (nova početna, mreža proizvoda — nijedan konkretan proizvod se ne
// gleda, pa se ViewContent tamo namjerno ne pali, vidi ispod).
const PRODUCT_PIXEL: { path: string; content_name: string; value: number }[] = [
  { path: "/edukativna-knjiga", content_name: "Interaktivna Montessori knjiga", value: 15 },
  { path: "/blinger-aparat-za-kosu", content_name: "Blinger aparat za kosu", value: 29 },
  { path: "/rotirajuce-zvecke", content_name: "Vesele rotirajuće zvečke", value: 19 },
  { path: "/projektor-za-crtanje", content_name: "Projektor za crtanje", value: 26 },
];
const DEFAULT_CONTENT = { content_name: "SAT MIRA set 3u1", value: 29 };

export default function PixelEvents() {
  const fired = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    const isHomeGrid = pathname === "/";
    const match = PRODUCT_PIXEL.find((p) => pathname?.startsWith(p.path));
    const content = match
      ? { content_name: match.content_name, value: match.value }
      : DEFAULT_CONTENT;

    if (window.fbq && !isHomeGrid) {
      window.fbq("track", "ViewContent", { ...content, currency: "BAM" });
    }

    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest(
        'a[href="#naruci"]'
      );
      if (!target || fired.current || !window.fbq) return;
      fired.current = true;
      window.fbq("track", "InitiateCheckout", {
        ...content,
        currency: "BAM",
      });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
