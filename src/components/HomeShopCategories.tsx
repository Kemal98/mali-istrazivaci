import Link from "next/link";
import styles from "./Home.module.css";
import type { HomeContent } from "@/lib/home/types";

export default function HomeShopCategories({ content }: { content: HomeContent }) {
  const tiles = content.kategorijeTiles.filter((t) => t.prikazi && t.slika);
  if (tiles.length === 0) return null;

  return (
    <section id="kategorije">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Kupuj po kategoriji</span>
        <h2 className={styles.sectionTitle}>Šta tražiš danas?</h2>
        <div className={styles.ageGrid}>
          {tiles.map((t) => (
            <Link
              href={`/?kategorija=${t.kategorija}#proizvodi`}
              className={styles.ageCard}
              key={t.kategorija}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.slika} alt={t.alt} loading="lazy" />
              <div className={styles.ageCardOverlay}>
                <span>{t.alt}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
