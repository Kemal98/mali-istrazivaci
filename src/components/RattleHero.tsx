"use client";

import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";
import BookOrderTrigger from "./BookOrderTrigger";

export default function RattleHero() {
  return (
    <section className="dawn-product" id="top">
      <div className="dawn-col">
        <div className="dawn-product-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/rotirajuce-zvecke/hero.png"
            alt="Vesele rotirajuće zvečke za bebe — tri zvečke sa vakuum osnovom"
          />
        </div>

        <h1 className="dawn-h1 dawn-h1-lg">Vesele rotirajuće zvečke za bebe (3 komada u setu)</h1>

        <a href="#recenzije" className="dawn-rating">
          <span className="dawn-stars" aria-hidden="true">
            ♥♥♥♥♥
          </span>
          {RATING} ({REVIEWS_COUNT} ocjena)
        </a>

        <div className="dawn-price-row">
          <span className="dawn-price-old">29 KM</span>
          <span className="dawn-price-new">24 KM</span>
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
