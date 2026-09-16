"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttribution } from "@/lib/orders/attribution";

/**
 * Nevidljiva komponenta u root layoutu — hvata UTM parametre i fbclid na
 * svakoj promjeni stranice i pamti ih do narudžbe.
 *
 * Ne renderuje ništa i ne dira ni jedan piksel sajta. Kupac je nikad ne
 * vidi ni ne osjeti.
 */
export default function UtmCapture() {
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    captureAttribution();
    // pathname/params u zavisnostima: Next ne reloada stranicu pri
    // klijentskoj navigaciji, pa bez ovoga ne bismo vidjeli UTM-ove ako
    // kupac dođe na drugu stranicu preko internog linka
  }, [pathname, params]);

  return null;
}
