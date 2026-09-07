import Link from "next/link";
import styles from "./Home.module.css";

const AGES = [
  { uzrast: "2-3", label: "2–3 godine", img: "/img/igracke-izbor.png" },
  { uzrast: "4-6", label: "4–6 godina", img: "/img/tanagram.png" },
  { uzrast: "6+", label: "6+ godina", img: "/img/knjiga_proizvod2.png" },
];

// Napomena: "6+" nema još nijedan proizvod u products.json (postojeći
// katalog ide do "4-6") — kartica i dalje vodi na filter, samo će rezultat
// biti prazan dok se ne doda proizvod za taj uzrast.
export default function HomeShopByAge() {
  return (
    <section id="uzrast">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Po uzrastu</span>
        <h2 className={styles.sectionTitle}>Kupuj po uzrastu djeteta</h2>
        <div className={styles.ageGrid}>
          {AGES.map((a) => (
            <Link
              href={`/?uzrast=${a.uzrast}#proizvodi`}
              className={styles.ageCard}
              key={a.uzrast}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.img} alt={`Igračke za uzrast ${a.label}`} loading="lazy" />
              <div className={styles.ageCardOverlay}>
                <span>{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
