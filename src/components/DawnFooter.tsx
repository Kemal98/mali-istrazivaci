import { CONTACT_EMAIL } from "@/lib/constants";

// Napomena: brief je tražio "🛡️ garancija zadovoljstva" — ne nudimo garanciju
// povrata, pa je zamijenjeno stvarnom prednošću (plaćanje pouzećem).
export default function DawnFooter() {
  return (
    <footer className="dawn-footer" id="kontakt">
      <div className="dawn-col">
        <p>🚚 Plaćanje pouzećem · Dostava po cijeloj BiH</p>
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p className="dawn-footer-copy">© 2026 Mali Istraživači</p>
      </div>
    </footer>
  );
}
