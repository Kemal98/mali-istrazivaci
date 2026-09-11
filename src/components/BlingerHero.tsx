"use client";

import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";
import BookOrderTrigger from "./BookOrderTrigger";

export default function BlingerHero() {
  return (
    <section className="dawn-product" id="top">
      <div className="dawn-col">
        <div className="dawn-product-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/blinger/hero.png"
            alt="Blinger aparat za kosu s perlicama, djeca se igraju i ukrašavaju kosu"
          />
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
          Plaćanje pouzećem, pouzdana kupovina
        </p>

        <BookOrderTrigger className="dawn-btn-black dawn-btn-pulse">
          PORUČI SADA
        </BookOrderTrigger>
      </div>
    </section>
  );
}
