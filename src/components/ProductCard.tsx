import type { Product } from "@/lib/products";
import styles from "./Home.module.css";

export default function ProductCard({ product: p }: { product: Product }) {
  return (
    <a
      href={p.link}
      className={`${styles.card} ${!p.naStanju ? styles.cardMuted : ""}`}
    >
      <div className={styles.cardImgWrap}>
        {p.badge && <span className={styles.cardBadge}>{p.badge}</span>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.slike[0]}
          alt={p.naziv}
          width={600}
          height={600}
          loading="lazy"
        />
        {!p.naStanju && <div className={styles.cardSoldOut}>Rasprodano</div>}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardName}>{p.naziv}</div>
        <div className={styles.cardRating}>
          <span>★★★★★</span> {p.ocjena} ({p.brojRecenzija})
        </div>
        <div className={styles.cardPriceRow}>
          <span className={styles.cardPrice}>
            {p.cijena} {p.valuta}
          </span>
          {p.staraCijena && (
            <span className={styles.cardPriceOld}>
              {p.staraCijena} {p.valuta}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
