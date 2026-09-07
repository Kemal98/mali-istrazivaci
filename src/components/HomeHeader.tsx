"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Home.module.css";

const LINKS = [
  { href: "#proizvodi", label: "Proizvodi" },
  { href: "#uzrast", label: "Po uzrastu" },
  { href: "#nasa-prica", label: "O nama" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function HomeHeader() {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <div className={styles.announce}>
        Dostava po cijeloj BiH · Plaćanje pouzećem · 14 dana povrat
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
