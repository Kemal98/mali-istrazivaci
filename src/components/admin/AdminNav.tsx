"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { href: "/admin/dashboard", label: "DASHBOARD", ico: "▦" },
  { href: "/admin/zarada", label: "ZARADA PO DANU", ico: "📈" },
  { href: "/admin/orders", label: "NARUDŽBE", ico: "🧾" },
  { href: "/admin/ne-isporuceno", label: "NE ISPORUČENO", ico: "📵" },
  { href: "/admin/kupci", label: "KUPCI", ico: "👤" },
  // "Poruke" (Messenger/Instagram inbox) pauzirano na zahtjev 24.10.2026
  // — stranica i webhook i dalje postoje, samo nije u meniju. Vidi
  // MESSENGER_INBOX_PAUSED u api/webhooks/messenger/route.ts.
  { href: "/admin/products", label: "PROIZVODI", ico: "▤" },
  { href: "/admin/troskovi", label: "TROŠKOVI REKLAMA", ico: "📣" },
  { href: "/admin/nabavka", label: "NABAVKA ROBE", ico: "📦" },
  { href: "/admin/media", label: "MEDIA LIBRARY", ico: "▣" },
  { href: "/admin/reviews", label: "RECENZIJE", ico: "★" },
  { href: "/admin/templates", label: "ŠABLONI", ico: "◲" },
  { href: "/admin/settings", label: "GLOBALNE POSTAVKE", ico: "⚙" },
];

export default function AdminNav({
  unreadMessenger = 0,
}: {
  unreadMessenger?: number;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  // Meni na mobitelu je fiksna ladica (van ekrana dok se ne otvori) —
  // na desktopu ovaj state se ne koristi (.adm-side je uvijek vidljiv
  // preko CSS-a iznad 900px, vidi admin.css).
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Samo na mobitelu (CSS >900px ovo sakrije) — fiksna traka sa
          dugmetom za otvaranje menija, pošto je .adm-side van ekrana. */}
      <div className="adm-mobile-bar">
        <button
          type="button"
          className="adm-nav-toggle"
          onClick={() => setOpen(true)}
          aria-label="Otvori meni"
        >
          ☰
        </button>
        <span className="adm-mobile-bar-title">MALI ISTRAŽIVAČI</span>
      </div>

      {open ? (
        <div
          className="adm-nav-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside className="adm-side" data-open={open}>
        <div className="adm-logo">
          MALI ISTRAŽIVAČI
          <small>ADMIN PANEL</small>
        </div>

        <nav className="adm-nav">
          {ITEMS.map((it) => {
            const active = pathname.startsWith(it.href);
            const badge = it.href === "/admin/messenger" ? unreadMessenger : 0;
            return (
              <Link
                key={it.href}
                href={it.href}
                data-active={active}
                onClick={() => setOpen(false)}
              >
                <span className="adm-nav-ico" aria-hidden="true">
                  {it.ico}
                </span>
                {it.label}
                {badge > 0 ? <span className="adm-nav-badge">{badge}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noreferrer">
            ↗ Otvori shop
          </a>
          <button type="button" className="adm-btn adm-btn-sm" onClick={logout}>
            ODJAVI SE
          </button>
        </div>
      </aside>
    </>
  );
}
