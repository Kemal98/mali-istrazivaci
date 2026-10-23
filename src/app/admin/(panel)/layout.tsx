import AdminNav from "@/components/admin/AdminNav";
import { countUnreadMessenger } from "@/lib/messenger/repo";

// Shell sa sidebarom. Autorizacija je u proxy.ts — ako sesija nije
// validna, na ovu rutu se nikad ne stigne, nego redirect na login.
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const unreadMessenger = await countUnreadMessenger();
  return (
    <div className="adm">
      <div className="adm-shell">
        <AdminNav unreadMessenger={unreadMessenger} />
        <main className="adm-main">{children}</main>
      </div>
    </div>
  );
}
