"use client";

import { useEffect, useRef, useState } from "react";

// Video je 45MB — NE smije se učitati dok sekcija nije stvarno na ekranu
// (puno korisnika na mobitelu nikad ne doskrola dovde, pa ne treba ni da
// skine ni bajt). IntersectionObserver prvo otkrije da je sekcija blizu
// viewporta, pa se tek tad <video> montira (i počinje preuzimanje/autoplay).
export default function Infographic() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="info-bg">
      <div className="wrap">
        <span className="kicker k-blue">Sve na jednom mjestu</span>
        <h2 className="h-sec">Cijeli set, jedna kutija</h2>
        <p className="sub-sec">
          Stiže spakovano i spremno za poklon – ne treba ti ništa dodatno.
        </p>
        <div className="info-img" ref={ref}>
          {visible ? (
            <video
              src="/video/video_lop.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="SAT MIRA set – sve što dobijaš, raspakovano"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
