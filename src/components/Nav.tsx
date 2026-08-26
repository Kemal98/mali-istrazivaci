"use client";

import { useEffect, useState, type ReactNode } from "react";

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
  phone,
  topbarFull = (
    <>
      Stiže u <strong>poklon kutiji</strong> &nbsp;·&nbsp; Plaćanje pouzećem
      &nbsp;·&nbsp; Dostava po cijeloj BiH
    </>
  ),
  topbarShort = "Poklon kutija · Pouzeće · Dostava po BiH",
}: {
  price?: string;
  links?: { href: string; label: string }[];
  logoHref?: string;
  phone?: string;
  topbarFull?: ReactNode;
  topbarShort?: ReactNode;
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
        <span className="topbar-full">{topbarFull}</span>
        <span className="topbar-short">{topbarShort}</span>
      </div>

      <header className={`nav${scrolled ? " scrolled" : ""}`} id="siteNav">
        <div className="nav-inner">
          <a href={logoHref} className="logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="Mali Istraživači" />
            Mali Istraživači
          </a>
          <nav className={`nav-links${phone ? " nav-links-full" : ""}`}>
            {links.map((l) => (
              <a href={l.href} key={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="nav-phone"
                aria-label="Pozovi nas"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </a>
            )}
            <a href="#naruci" className="btn btn-primary">
              Naruči – {price} + dostava
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
