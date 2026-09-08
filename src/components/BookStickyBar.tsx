"use client";

import { useEffect, useState } from "react";
import BookOrderTrigger from "./BookOrderTrigger";

// Traka fiksirana na dnu ekrana, samo na mobitelu — ali se ne vidi odmah.
// Pojavljuje se tek kad korisnik skrola prošao početni dio (#top, BookHero),
// a nestaje ako se vrati na vrh. Isti pristup kao postojeći StickyBar.tsx
// na glavnoj stranici za CSS (display:none iznad 900px), plus
// IntersectionObserver ovdje za samo pojavljivanje-na-skrol.
export default function BookStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting)
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <BookOrderTrigger className="dawn-sticky-bar" aria-label="Poruči sada">
      Poruči sada
    </BookOrderTrigger>
  );
}
