"use client";

import { useState } from "react";

/**
 * Glavna slika + red malih klikabilnih slika ispod (kao na AliExpress/
 * Amazon stranicama proizvoda) — klik na malu sliku je postavi kao
 * glavnu. Samo ovaj dio hero-a treba klijentski JS (promjena glavne
 * slike), zato je izdvojen iz CmsHero.tsx (koji ostaje server-rendered).
 */
export default function HeroGallery({
  main,
  mainAlt,
  extra,
}: {
  main: string;
  mainAlt: string;
  extra: { url: string; alt?: string }[];
}) {
  const images = [{ url: main, alt: mainAlt }, ...extra.filter((i) => i.url)];
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="dawn-gallery">
      <div className="dawn-product-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt || mainAlt} />
      </div>
      {images.length > 1 ? (
        <div className="dawn-gallery-thumbs" role="tablist" aria-label="Ostale fotografije">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Fotografija ${i + 1}`}
              className={`dawn-gallery-thumb${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
