"use client";

import Link from "next/link";
import ShippingCutoff from "./ShippingCutoff";
import BookOrderTrigger from "./BookOrderTrigger";
import { FAMILIES_COUNT } from "@/lib/socialProof";

const ITEMS = [
  "👉 PORUČI SADA",
  "✓ Pouzdano mjesto za kupovinu",
  "💵 Plaćanje pouzećem",
  "🚚 Dostava po cijeloj BiH",
  `❤️ ${FAMILIES_COUNT}+ zadovoljnih porodica`,
  "cutoff", // zamjenjeno stvarnom <ShippingCutoff/> komponentom ispod
];

export default function DawnHeader({
  logoHref = "/",
}: {
  // Neke stranice (npr. rotirajuce-zvecke) žele da logo/ime vrati na vrh
  // TE stranice ("#top") umjesto na "/" — dok početna stranica nije
  // gotova, ne želimo da klik na logo odvede kupca sa dovršene
  // proizvod-stranice na nedovršenu početnu.
  logoHref?: string;
} = {}) {
  // Traka se duplira jednom da animacija (translateX -50%) izgleda kao
  // beskonačna petlja bez vidljivog "skoka" na kraju.
  const loop = [...ITEMS, ...ITEMS];

  return (
    // Traka + header fiksirani zajedno (jedan sticky omotač) — traka
    // ostaje vidljiva i klikabilna dok se skrola, ne samo header.
    <div className="dawn-topbar-wrap">
      <BookOrderTrigger
        className="dawn-announce"
        aria-label="Naruči odmah, kliknite za narudžbu"
      >
        <div className="dawn-announce-track">
          {loop.map((t, i) =>
            t === "cutoff" ? (
              <span key={i}>
                ⏰ <ShippingCutoff />
              </span>
            ) : (
              <span
                key={i}
                className={t.includes("PORUČI SADA") ? "dawn-announce-cta" : undefined}
              >
                {t}
              </span>
            )
          )}
        </div>
      </BookOrderTrigger>
      <header className="dawn-header">
        <div className="dawn-header-inner">
          <Link href={logoHref} className="dawn-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="Mali Istraživači" />
            Mali Istraživači
          </Link>
          <nav className="dawn-nav-links">
            <Link href="/">Početna</Link>
            <Link href="/">Svi proizvodi</Link>
            <a href="#kontakt">Kontakt</a>
          </nav>
          <BookOrderTrigger className="dawn-cart-btn" aria-label="Naruči">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
          </BookOrderTrigger>
        </div>
      </header>
    </div>
  );
}
