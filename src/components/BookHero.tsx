"use client";

import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";
import { useDawnQty } from "./DawnQtyContext";

export default function BookHero() {
  const { qty, setQty } = useDawnQty();

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

        <p className="dawn-rating">
          <span className="dawn-stars">★★★★★</span>
          {RATING}/5 · {REVIEWS_COUNT} ocjena
        </p>

        <div className="dawn-price-row">
          <span className="dawn-price-old">29 KM</span>
          <span className="dawn-price-new">15 KM</span>
          <span className="dawn-badge-sale">SNIŽENO</span>
        </div>

        <div className="dawn-qty" role="group" aria-label="Količina">
          <button
            type="button"
            onClick={() => setQty(qty - 1)}
            aria-label="Smanji količinu"
          >
            −
          </button>
          <span className="dawn-qty-val">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            aria-label="Povećaj količinu"
          >
            +
          </button>
        </div>

        <a href="#naruci" className="dawn-btn-black">
          NARUČI — PLATIŠ KURIRU
        </a>
        <p className="dawn-cta-note">
          Ne plaćaš ništa unaprijed · Dostava po cijeloj BiH
        </p>
      </div>
    </section>
  );
}
