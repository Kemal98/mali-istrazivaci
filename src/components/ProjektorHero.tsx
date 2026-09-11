"use client";

import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";
import BookOrderTrigger from "./BookOrderTrigger";

// NAPOMENA: nema stvarne fotografije ovog proizvoda u /img — placeholder
// okvir umjesto tuđe slike (isti pristup kao originalna Blinger stranica).
// Zamijeni pravom fotografijom čim je imaš, pa "dawn-img-placeholder"
// klasa i SVG mogu van.
export default function ProjektorHero() {
  return (
    <section className="dawn-product" id="top">
      <div className="dawn-col">
        <div className="dawn-product-img dawn-img-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M8 21h8M12 18v3" />
            <circle cx="12" cy="11" r="3" />
          </svg>
          <span>Slika proizvoda dolazi uskoro</span>
        </div>

        <h1 className="dawn-h1 dawn-h1-lg">
          Projektor za crtanje — set sa tablom i markerima (12 boja)
        </h1>

        <a href="#recenzije" className="dawn-rating">
          <span className="dawn-stars" aria-hidden="true">
            ♥♥♥♥♥
          </span>
          {RATING} ({REVIEWS_COUNT} ocjena)
        </a>

        <div className="dawn-price-row">
          <span className="dawn-price-old">35 KM</span>
          <span className="dawn-price-new">26 KM</span>
          <span className="dawn-badge-sale">SNIŽENO</span>
        </div>

        <p className="dawn-pay-line">Plaćanje pouzećem — pouzdana kupovina</p>

        <BookOrderTrigger className="dawn-btn-black dawn-btn-pulse">
          PORUČI SADA
        </BookOrderTrigger>
        <ul className="dawn-hero-usp">
          <li>Projektor vodi dijete kroz crtež</li>
          <li>12 perivih markera u boji</li>
          <li>Tabla za višekratnu upotrebu</li>
        </ul>
      </div>
    </section>
  );
}
