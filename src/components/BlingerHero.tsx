"use client";

import BookOrderTrigger from "./BookOrderTrigger";

export default function BlingerHero() {
  return (
    <section className="dawn-product" id="top">
      <div className="dawn-col">
        <div className="dawn-product-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/blinger/hero.png"
            alt="Sparkling Diamond aparat za ukrašavanje kose s dijamantima"
          />
        </div>

        <h1 className="dawn-h1 dawn-h1-lg">
          Sparkling Diamond
          <span>Aparat za ukrašavanje kose + 75 dijamanata</span>
        </h1>

        <a href="#recenzije" className="dawn-rating dawn-rating-stack">
          <span className="dawn-rating-cta">
            <strong>HIT IGRA - RODITELJI KAŽU</strong>
          </span>
        </a>

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
      </div>
    </section>
  );
}
