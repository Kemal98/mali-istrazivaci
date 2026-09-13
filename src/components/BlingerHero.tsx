"use client";

import BookOrderTrigger from "./BookOrderTrigger";

export default function BlingerHero() {
  return (
    <section className="dawn-product" id="top">
      <div className="dawn-col">
        <div className="dawn-product-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/blinger/sparkling-hero.png"
            alt="Sparkling Diamond aparat za ukrašavanje kose s dijamantima"
          />
        </div>

        <h1 className="dawn-h1 dawn-h1-lg">
          Sparkling Diamond
          <br />
          Aparat za kosu (75 perlica)
        </h1>

        <a href="#recenzije" className="dawn-rating">
          <span className="dawn-stars" aria-hidden="true">
            ♥♥♥♥♥
          </span>
          4.8 (22 ocjene)
        </a>

        <div className="dawn-price-row">
          <span className="dawn-price-old">39 KM</span>
          <span className="dawn-price-new">24 KM</span>
          <span className="dawn-badge-sale">SNIŽENO</span>
        </div>

        <BookOrderTrigger className="dawn-btn-black dawn-btn-pulse">
          PORUČI SADA
        </BookOrderTrigger>
      </div>
    </section>
  );
}
