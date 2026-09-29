import Link from "next/link";
import styles from "./Home.module.css";

// Kupuj po kategoriji — isto mjesto (odmah ispod hero slike) i ista
// ideja kao kod referentnog sajta (igrackolandia.shop): par velikih
// kartica koje odmah usmjere kupca, umjesto da prva stvar na stranici
// bude generička rešetka svih proizvoda.
//
// Slika po kartici je STVARNA fotografija jednog od naših proizvoda iz
// te kategorije (ne generička ilustracija) — prepoznatljivije kupcu.
const CATEGORIES = [
  {
    kategorija: "bebe",
    label: "Za bebe",
    img: "/img/rotirajuce-zvecke/hero.png",
  },
  {
    kategorija: "djevojcice",
    label: "Za djevojčice",
    img: "/img/blinger/sparkling-hero.png",
  },
  {
    kategorija: "edukativno",
    label: "Edukativne",
    img: "/img/set_hero2.png",
  },
];

export default function HomeShopCategories() {
  return (
    <section id="kategorije">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Kupuj po kategoriji</span>
        <h2 className={styles.sectionTitle}>Šta tražiš danas?</h2>
        <div className={styles.ageGrid}>
          {CATEGORIES.map((c) => (
            <Link
              href={`/?kategorija=${c.kategorija}#proizvodi`}
              className={styles.ageCard}
              key={c.kategorija}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.label} loading="lazy" />
              <div className={styles.ageCardOverlay}>
                <span>{c.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
