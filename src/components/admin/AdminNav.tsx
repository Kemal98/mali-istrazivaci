"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "DASHBOARD", ico: "▦" },
  { href: "/admin/products", label: "PROIZVODI", ico: "▤" },
  { href: "/admin/media", label: "MEDIA LIBRARY", ico: "▣" },
  { href: "/admin/reviews", label: "RECENZIJE", ico: "★" },
  { href: "/admin/templates", label: "ŠABLONI", ico: "◲" },
  { href: "/admin/settings", label: "GLOBALNE POSTAVKE", ico: "⚙" },
];

export default function AdminNav() {
  const pathname = usePathname() || "";
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="adm-side">
      <div className="adm-logo">
        MALI ISTRAŽIVAČI
        <small>ADMIN PANEL</small>
      </div>

      <nav className="adm-nav">
        {ITEMS.map((it) => {
          const active =
            it.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} data-active={active}>
              <span className="adm-nav-ico" aria-hidden="true">
                {it.ico}
              </span>
              {it.label}
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
  );
}
