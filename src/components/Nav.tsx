"use client";

import { useEffect, useState } from "react";

const DEFAULT_LINKS = [
  { href: "#set", label: "Šta dobijaš" },
  { href: "#knjiga", label: "Iz knjige" },
  { href: "#kako-radi", label: "Kako radi" },
  // { href: "#gdje", label: "Gdje se koristi" }, — vrati kad WhereToUse sekcija bude aktivna
  { href: "#recenzije", label: "Recenzije" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Nav({
  price = "29 KM",
  links = DEFAULT_LINKS,
  logoHref = "#",
}: {
  price?: string;
  links?: { href: string; label: string }[];
  logoHref?: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="topbar">
        <span className="topbar-full">
          Stiže u <strong>poklon kutiji</strong> &nbsp;·&nbsp; Plaćanje
          pouzećem &nbsp;·&nbsp; Dostava po cijeloj BiH
        </span>
        <span className="topbar-short">
          Poklon kutija &nbsp;·&nbsp; Pouzeće &nbsp;·&nbsp; Dostava po BiH
        </span>
      </div>

      <header className={`nav${scrolled ? " scrolled" : ""}`} id="siteNav">
        <div className="nav-inner">
          <a href={logoHref} className="logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="Mali Istraživači" />
            Mali Istraživači
          </a>
          <nav className="nav-links">
            {links.map((l) => (
              <a href={l.href} key={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <a href="#naruci" className="btn btn-primary">
            Naruči – {price}
          </a>
        </div>
      </header>
    </>
  );
}
