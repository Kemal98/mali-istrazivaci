"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Home.module.css";

const LINKS = [
  { href: "#proizvodi", label: "Proizvodi" },
  { href: "#kategorije", label: "Kategorije" },
  { href: "#nasa-prica", label: "O nama" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function HomeHeader() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Off-canvas meni: blokira scroll iza panela dok je otvoren, Escape ga
  // zatvara — obično ponašanje za ovakav meni.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Jednostavan klijentski filter (odluka iz intervjua) — bez nove
  // rute/servera, samo sakrije kartice koje ne odgovaraju unosu, nad
  // onim što je VEĆ renderovano (prvih 6 ili "sve", vidi HomeProductGrid).
  // ProductCard nosi data-naziv za ovo.
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll<HTMLElement>("[data-product-card]");
    cards.forEach((el) => {
      const naziv = el.dataset.naziv ?? "";
      el.style.display = !q || naziv.includes(q) ? "" : "none";
    });
    if (q) document.getElementById("proizvodi")?.scrollIntoView({ behavior: "smooth" });
  }, [query]);

  return (
    <>
      <div className={styles.announce}>
        Dostava širom BiH (2–3 radna dana, 10 KM) · Plaćanje pouzećem · 14 dana povrat
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo.png" alt="Mali Istraživači" />
            Mali Istraživači
          </Link>

          <nav className={styles.navLinks}>
            {LINKS.map((l) => (
              <a href={l.href} key={l.href}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className={styles.headerRight}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Pretraži igračke"
              placeholder="Pretraži igračke…"
              className={styles.headerSearch}
            />
            <a href="#proizvodi" className={styles.btnPrimary} style={{ padding: "11px 22px", fontSize: ".9rem" }}>
              Naruči
            </a>
            <button
              type="button"
              className={styles.hamburger}
              aria-label="Otvori meni"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className={open ? styles.offcanvasBackdropOpen : undefined} onClick={() => setOpen(false)} />
      <nav
        className={`${styles.offcanvas} ${open ? styles.offcanvasOpen : ""}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={styles.offcanvasClose}
          aria-label="Zatvori meni"
          onClick={() => setOpen(false)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {LINKS.map((l) => (
          <a href={l.href} key={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
}
