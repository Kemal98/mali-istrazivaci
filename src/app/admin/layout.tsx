import type { Metadata } from "next";
import "./admin.css";

// Namjerno prazan wrapper: admin.css se uvozi SAMO ovdje, pa admin
// stilovi nikad ne dođu na javne stranice. Sidebar shell je u
// (panel)/layout.tsx, da ga /admin/login i /admin/preview ne dobiju.
export const metadata: Metadata = {
  title: "Admin — Mali Istraživači",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
