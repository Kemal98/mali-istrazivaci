"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="topbar">
        Stiže u <strong>poklon kutiji</strong> &nbsp;·&nbsp; Plaćanje
        pouzećem &nbsp;·&nbsp; Dostava po cijeloj BiH
      </div>

      <header className={`nav${scrolled ? " scrolled" : ""}`} id="siteNav">
        <div className="nav-inner">
          <a href="#" className="logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="Mali Istraživači" />
            Mali Istraživači
          </a>
          <nav className="nav-links">
            <a href="#set">Šta dobijaš</a>
            <a href="#knjiga">Iz knjige</a>
            <a href="#recenzije">Recenzije</a>
            <a href="#kontakt">Kontakt</a>
          </nav>
          <a href="#naruci" className="btn btn-primary">
            Naruči – 29 KM
          </a>
        </div>
      </header>
    </>
  );
}
