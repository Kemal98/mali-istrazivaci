"use client";

import { useEffect, useRef, useState } from "react";
import type { Review } from "@/lib/cms/types";

/**
 * Kompaktna traka "neko je upravo kupio/rekao" — prikazuje se ISPOD
 * naslova/podnaslova proizvoda, IZNAD cijene (vidi CmsHero.tsx). Nikad
 * ne izmišlja recenzije — prima samo stvarne, admin-označene recenzije
 * (Review.featuredProductPage), iste koje se koriste i dolje u sekciji
 * "Recenzije" na dnu stranice. Prazna lista -> ništa se ne renderuje.
 */

const ROTATE_MS = 6000;

function initials(ime: string): string {
  const parts = ime.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function SocialProofCard({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Auto-rotacija svakih 6 sek — staje sama ako ostane samo jedna recenzija.
  useEffect(() => {
    if (reviews.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  const r = reviews[index % reviews.length];

  function go(dir: 1 | -1) {
    setIndex((i) => (i + dir + reviews.length) % reviews.length);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  return (
    <div
      className="social-proof"
      onTouchStart={reviews.length > 1 ? onTouchStart : undefined}
      onTouchEnd={reviews.length > 1 ? onTouchEnd : undefined}
    >
      {reviews.length > 1 ? (
        <button
          type="button"
          className="social-proof-nav social-proof-nav-prev"
          aria-label="Prethodna recenzija"
          onClick={() => go(-1)}
        >
          ‹
        </button>
      ) : null}

      <a href="#recenzije" className="social-proof-link">
        <span className="social-proof-avatar">
          {r.slika ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={r.slika} alt="" />
          ) : (
            <span>{r.inicijal || initials(r.ime)}</span>
          )}
        </span>

        <span className="social-proof-body">
          <span className="social-proof-top">
            <b className="social-proof-name">{r.ime}</b>
            <span className="social-proof-stars" aria-hidden="true">
              {"★".repeat(Math.max(0, Math.min(5, r.rating)))}
              {"☆".repeat(5 - Math.max(0, Math.min(5, r.rating)))}
            </span>
          </span>
          <span className="social-proof-text">{r.tekst}</span>
          {r.verified ? (
            <span className="social-proof-verified">✓ Verifikovana kupovina</span>
          ) : null}
        </span>
      </a>

      {reviews.length > 1 ? (
        <button
          type="button"
          className="social-proof-nav social-proof-nav-next"
          aria-label="Sljedeća recenzija"
          onClick={() => go(1)}
        >
          ›
        </button>
      ) : null}
    </div>
  );
}
