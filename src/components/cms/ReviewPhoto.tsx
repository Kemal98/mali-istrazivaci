"use client";

import { useState } from "react";

/**
 * Mala sličica uz recenziju (ne puna širina) — klik otvara sliku uvećanu u
 * popupu, isti .dawn-modal-* obrazac kao RattleReviews.tsx.
 */
export default function ReviewPhoto({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="dawn-rev-photo-thumb"
        onClick={() => setOpen(true)}
        aria-label="Pogledaj sliku"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading="lazy" decoding="async" />
      </button>

      {open ? (
        <div
          className="dawn-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="dawn-modal dawn-video-modal" role="dialog" aria-modal="true">
            <button
              type="button"
              className="dawn-modal-close"
              aria-label="Zatvori"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="dawn-video-player" />
          </div>
        </div>
      ) : null}
    </>
  );
}
