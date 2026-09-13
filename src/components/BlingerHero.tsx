"use client";

import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";
import BookOrderTrigger from "./BookOrderTrigger";

// NAPOMENA: nema stvarne fotografije Sparkling Diamond proizvoda u /img —
// stare Blinger slike prikazuju drugi (stari) proizvod, ne koriste se.
// Placeholder okvir dok ne stigne prava fotografija u originalnoj kutiji.
export default function BlingerHero() {
  return (
    <section className="dawn-product" id="top">
      <div className="dawn-col">
        <div className="dawn-product-img dawn-img-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
          </svg>
          <span>Slika proizvoda dolazi uskoro</span>
        </div>

        <h1 className="dawn-h1 dawn-h1-lg">
          Sparkling Diamond ✨
          <span>Aparat za ukrašavanje kose + 75 dijamanata</span>
        </h1>

        <a href="#recenzije" className="dawn-rating dawn-rating-stack">
          <span className="dawn-rating-cta">
            <strong>HIT IGRA - RODITELJI KAŽU</strong>
          </span>
          <span className="dawn-rating-sub">
            <span className="dawn-stars" aria-hidden="true">
              ♥♥♥♥♥
            </span>
            {RATING} ({REVIEWS_COUNT} ocjena)
          </span>
        </a>

        <p className="dawn-heart-lead">Njen mali salon kod kuće.</p>
        <p className="dawn-story-text" style={{ marginBottom: 18 }}>
          <span>
            75 dijamanata u 5 boja za frizure koje može praviti iznova i
            iznova.
          </span>
        </p>

        <div className="dawn-price-row">
          <span className="dawn-price-old">39 KM</span>
          <span className="dawn-price-new">24 KM</span>
          <span className="dawn-badge-sale">SNIŽENO</span>
        </div>

        <BookOrderTrigger className="dawn-btn-black dawn-btn-pulse">
          PORUČI SADA
        </BookOrderTrigger>

        <p className="dawn-pay-line dawn-pay-line-below">
          Plaćanje pouzećem, pouzdana kupovina
        </p>

        <ul className="dawn-hero-usp">
          <li>Plaćanje pouzećem</li>
          <li>Dostava širom BiH</li>
          <li>Brza dostava</li>
        </ul>
      </div>
    </section>
  );
}
