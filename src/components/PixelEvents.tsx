"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function PixelEvents() {
  const fired = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    // "/" je od sada nova početna (mreža proizvoda), ne SAT MIRA stranica
    // — SAT MIRA se preselio na /sat-mira. Grid nije "pregled proizvoda"
    // u smislu piksela (nijedan konkretan proizvod se ne gleda), pa tamo
    // namjerno ne pali lažan ViewContent za SAT MIRA. Sve ostalo (uklj.
    // /hvala) zadržava tačno isto ponašanje kao prije ove izmjene.
    const isBook = pathname?.startsWith("/edukativna-knjiga");
    const isBlinger = pathname?.startsWith("/blinger-aparat-za-kosu");
    const isHomeGrid = pathname === "/";
    const content = isBook
      ? { content_name: "Interaktivna Montessori knjiga", value: 15 }
      : isBlinger
      ? { content_name: "Blinger aparat za kosu", value: 19 }
      : { content_name: "SAT MIRA set 3u1", value: 29 };

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
