import styles from "./Home.module.css";
import type { HomeContent } from "@/lib/home/types";

// Generička/atmosferska hero sekcija (odluka iz intervjua) — NIJE vezana
// za jedan konkretan proizvod, samo stvarne fotografije kao ugođaj.
// Dugme skroluje do mreže proizvoda, ne otvara jedan proizvod.
export default function HomeHero({ content }: { content: HomeContent }) {
  const slike = content.heroGalerija.length
    ? content.heroGalerija
    : [{ url: "/img/set_hero2.png", alt: "Igračke Mali Istraživači" }];

  return (
    <section className={styles.hero} id="top">
      <div className={styles.wrap}>
        <div className={styles.heroGrid}>
          <div>
            <h1 className={styles.heroTitle}>{content.heroNaslov}</h1>
            <p className={styles.heroSub}>{content.heroPodnaslov}</p>
            <div className={styles.heroBtns}>
              <a href="#proizvodi" className={styles.btnPrimary}>
                {content.heroCtaTekst}
              </a>
            </div>
          </div>
          <div className={styles.heroMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slike[0].url} alt={slike[0].alt} width={800} height={800} />
          </div>
        </div>
      </div>
    </section>
  );
}
