"use client";

import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";
import BookOrderTrigger from "./BookOrderTrigger";

// NAPOMENA: nema stvarne fotografije ovog proizvoda u /img — placeholder
// okvir ispod umjesto tuđe slike (vidi napomenu uz commit). Zamijeni
// pravom fotografijom čim je imaš.
export default function BlingerHero() {
  return (
    <section className="dawn-product" id="top">
      <div className="dawn-col">
        <div className="dawn-product-img dawn-img-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>Slika proizvoda dolazi uskoro</span>
        </div>

        <h1 className="dawn-h1 dawn-h1-lg">PRO Blinger Aparat za kosu (180 perlica)</h1>

        <a href="#recenzije" className="dawn-rating">
          <span className="dawn-stars" aria-hidden="true">
            ♥♥♥♥♥
          </span>
          {RATING} ({REVIEWS_COUNT} ocjena)
        </a>

        <div className="dawn-price-row">
          <span className="dawn-price-old">49 KM</span>
          <span className="dawn-price-new">29 KM</span>
          <span className="dawn-badge-sale">SNIŽENO</span>
        </div>

        <p className="dawn-pay-line">
          Plaćanje pouzećem — pouzdana kupovina
        </p>

        <BookOrderTrigger className="dawn-btn-black dawn-btn-pulse">
          PORUČI SADA
        </BookOrderTrigger>
        <p className="dawn-cta-note">Dostava po cijeloj BiH · 2–4 dana</p>
      </div>
    </section>
  );
}
