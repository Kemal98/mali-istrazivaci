import { listMessengerMessages } from "@/lib/messenger/repo";
import { datum } from "@/lib/cms/datum";
import MarkMessengerRead from "@/components/admin/MarkMessengerRead";

export const dynamic = "force-dynamic";

/**
 * Samo za ČITANJE — poruke koje stignu na FB stranicu preko Messenger
 * webhooka (api/webhooks/messenger). Nema slanja odgovora odavde,
 * admin za to i dalje koristi Facebook/Messenger aplikaciju.
 */
export default async function MessengerPage() {
  const messages = await listMessengerMessages();
  const unread = messages.filter((m) => !m.readAt).length;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Messenger poruke</h1>
          <p>
            Poruke sa Facebook stranice, najnovije prvo. Ovo je samo pregled —
            za odgovor i dalje idi na Messenger/Facebook.
          </p>
        </div>
        <div className="adm-head-actions">
          {unread > 0 ? <MarkMessengerRead /> : null}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="adm-empty" style={{ background: "#fff", borderRadius: 10 }}>
          Još nema primljenih poruka. (Ako je ovo neočekivano, provjeri da li
          je Messenger webhook podešen — vidi MESSENGER_* u Vercel
          Environment Variables.)
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th>Od</th>
                <th>Poruka</th>
                <th>Kad</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} style={!m.readAt ? { background: "#fdf1dc" } : undefined}>
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
