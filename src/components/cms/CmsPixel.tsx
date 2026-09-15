"use client";

import { useEffect, useRef } from "react";

// ViewContent za CMS proizvode — PixelEvents.tsx zna samo statične rute,
// pa CMS stranica sama prijavi svoj proizvod (tačno ime i cijena).
export default function CmsPixel({
  naziv,
  vrijednost,
}: {
  naziv: string;
  vrijednost: number | null;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "ViewContent", {
        content_name: naziv,
        value: vrijednost ?? 0,
        currency: "BAM",
      });
    }
  }, [naziv, vrijednost]);
  return null;
}
