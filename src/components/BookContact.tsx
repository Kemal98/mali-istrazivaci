import { CONTACT_EMAIL } from "@/lib/constants";

// Napomena: brief je tražio klikabilan broj telefona — brojevi telefona su
// ranije u ovoj sesiji u potpunosti uklonjeni sa sajta (mail je jedini
// kanal). Zamijenjeno mailto blokom iste namjene.
export default function BookContact() {
  return (
    <section className="dawn-contact">
      <div className="dawn-col">
        <p className="dawn-contact-q">
          Imaš pitanje ili želiš naručiti porukom?
        </p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="dawn-contact-link">
          ✉️ {CONTACT_EMAIL}
        </a>
      </div>
    </section>
  );
}
