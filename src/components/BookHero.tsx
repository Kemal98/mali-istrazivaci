"use client";

import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";

// Napomena: dugme ovdje uvijek izgleda aktivno/dostupno (na zahtjev) —
// stvarno stanje narudžbi (BOOK_ORDERS_ENABLED u constants.ts) i dalje
// odlučuje da li forma na dnu stranice zaista šalje narudžbu. Ako se
// narudžbe zaista ponovo otvore, prebaci tu zastavicu na true.
// Birač količine je maknut odavde na zahtjev — sad postoji samo u
// BookCheckout.tsx (forma dole).
export default function BookHero() {
  return (
    <section className="dawn-product" id="top">
      <div className="dawn-col">
        <div className="dawn-product-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/knjiga_proizvod2.png"
            alt="Interaktivna Montessori knjiga – Svijet malih istraživača"
          />
        </div>

        <h1 className="dawn-h1">
          Interaktivna Montessori knjiga
          <span>Svijet malih istraživača</span>
        </h1>

        <a href="#recenzije" className="dawn-rating">
          <span className="dawn-stars" aria-hidden="true">
            ♥♥♥♥♥
          </span>
          {RATING} ({REVIEWS_COUNT} ocjena)
        </a>

        <div className="dawn-price-row">
          <span className="dawn-price-old">29 KM</span>
          <span className="dawn-price-new">15 KM</span>
          <span className="dawn-badge-sale">SNIŽENO</span>
        </div>

        <p className="dawn-pay-line">
          Plaćanje pouzećem — pouzdana kupovina
        </p>

        <a href="#naruci" className="dawn-btn-black dawn-btn-pulse">
          KUPOVINA
        </a>
        <p className="dawn-cta-note">Dostava po cijeloj BiH · 2–4 dana</p>
      </div>
    </section>
  );
}
