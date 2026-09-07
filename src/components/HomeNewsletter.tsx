import { CONTACT_EMAIL } from "@/lib/constants";
import styles from "./Home.module.css";

// Brief nudi "Newsletter / Viber kontakt blok" kao alternative. Nema
// stvarnog newsletter sistema (nigdje u kodu) niti objavljenog Viber/
// telefon broja (CONTACT_EMAIL je jedini stvarni kanal, isto kao svugdje
// drugo na sajtu) — pravljenje lažne prijave koja nikuda ne šalje podatke
// bilo bi gore nego da je nema, pa je ovo kontakt blok na mail.
export default function HomeNewsletter() {
  return (
    <section className={styles.newsletter} id="kontakt">
      <div className={styles.wrap}>
        <h2>Imaš pitanje prije narudžbe?</h2>
        <p>
          Piši nam na mail — odgovaramo isti ili sljedeći dan i pomažemo
          oko izbora igračke po uzrastu djeteta.
        </p>
        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.btnPrimary}>
          ✉️ {CONTACT_EMAIL}
        </a>
      </div>
    </section>
  );
}
