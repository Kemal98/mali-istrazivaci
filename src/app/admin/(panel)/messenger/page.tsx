import { listMessengerMessages } from "@/lib/messenger/repo";
import { backfillConfigured } from "@/lib/messenger/graph";
import { datum } from "@/lib/cms/datum";
import MarkMessengerRead from "@/components/admin/MarkMessengerRead";
import BackfillMessenger from "@/components/admin/BackfillMessenger";

export const dynamic = "force-dynamic";

const PLATFORM_ICON: Record<string, string> = {
  messenger: "💬",
  instagram: "📷",
};

/**
 * Samo za ČITANJE — poruke koje stignu na FB stranicu ili Instagram
 * preko webhooka (api/webhooks/messenger). Nema slanja odgovora
 * odavde, admin za to i dalje koristi Messenger/Instagram aplikaciju.
 */
export default async function MessengerPage() {
  const messages = await listMessengerMessages();
  const unread = messages.filter((m) => !m.readAt).length;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Messenger / Instagram poruke</h1>
          <p>
            Poruke sa Facebook stranice i Instagrama, najnovije prvo. Ovo je
            samo pregled — za odgovor i dalje idi na Messenger/Instagram.
          </p>
        </div>
        <div className="adm-head-actions">
          {unread > 0 ? <MarkMessengerRead /> : null}
        </div>
      </div>

      {backfillConfigured() ? (
        <div className="adm-card" style={{ marginBottom: 14 }}>
          <BackfillMessenger />
          <p className="adm-hint" style={{ marginTop: 8, marginBottom: 0 }}>
            Povuče i poruke koje su stigle PRIJE nego je webhook podešen.
            Sigurno je pokrenuti više puta — ne pravi duplikate.
          </p>
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="adm-empty" style={{ background: "#fff", borderRadius: 10 }}>
          Još nema primljenih poruka. (Ako je ovo neočekivano, provjeri da li
          je webhook podešen — vidi MESSENGER_* u Vercel Environment
          Variables.)
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th />
                <th>Od</th>
                <th>Poruka</th>
                <th>Kad</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} style={!m.readAt ? { background: "#fdf1dc" } : undefined}>
                  <td title={m.platform === "instagram" ? "Instagram" : "Messenger"}>
                    {PLATFORM_ICON[m.platform]}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <b>{m.senderName || "(nepoznato ime)"}</b>
                    <div className="adm-hint">{m.psid}</div>
                  </td>
                  <td>{m.text}</td>
                  <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                    {datum(m.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
