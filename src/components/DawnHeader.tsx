"use client";

import Link from "next/link";
import ShippingCutoff from "./ShippingCutoff";

export default function DawnHeader() {
  return (
    <>
      <div className="dawn-announce">
        <ShippingCutoff />
      </div>
      <header className="dawn-header">
        <div className="dawn-header-inner">
          <Link href="/" className="dawn-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="Mali Istraživači" />
            Mali Istraživači
          </Link>
          <nav className="dawn-nav-links">
            <Link href="/">Početna</Link>
            <Link href="/">Svi proizvodi</Link>
            <a href="#kontakt">Kontakt</a>
          </nav>
          <a href="#naruci" className="dawn-cart-btn" aria-label="Naruči">
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
          </a>
        </div>
      </header>
    </>
  );
}
