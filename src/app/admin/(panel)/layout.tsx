import AdminNav from "@/components/admin/AdminNav";

// Shell sa sidebarom. Autorizacija je u proxy.ts (Edge) — ako sesija
// nije validna, na ovu rutu se nikad ne stigne, nego redirect na login.
export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="adm">
      <div className="adm-shell">
        <AdminNav />
        <main className="adm-main">{children}</main>
      </div>
    </div>
  );
}
