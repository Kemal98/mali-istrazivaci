import type { Metadata } from "next";
import "./admin.css";

// Namjerno prazan wrapper: admin.css se uvozi SAMO ovdje, pa admin
// stilovi nikad ne dođu na javne stranice. Sidebar shell je u
// (panel)/layout.tsx, da ga /admin/login i /admin/preview ne dobiju.
//
// appleWebApp: kad se na iPhone-u uradi Safari → Podijeli → "Dodaj na
// Home Screen" na BILO KOJOJ /admin/* stranici, otvara se bez Safari
// adresne trake (kao prava app), sa ovim nazivom i ikonicom
// (apple-icon.png pored ovog fajla — ista slika kao sajt favicon).
export const metadata: Metadata = {
  title: "Admin — Mali Istraživači",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "MI Admin",
    statusBarStyle: "black-translucent",
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
