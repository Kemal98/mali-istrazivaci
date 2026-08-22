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
    const isBook = pathname?.startsWith("/edukativna-knjiga");
    const content = isBook
      ? { content_name: "Interaktivna Montessori knjiga", value: 15 }
      : { content_name: "SAT MIRA set 3u1", value: 29 };

    if (window.fbq) {
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
