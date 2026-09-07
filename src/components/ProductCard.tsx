import type { Product } from "@/lib/products";
import styles from "./Home.module.css";

export default function ProductCard({ product: p }: { product: Product }) {
  return (
    <a
      href={p.link}
      className={`${styles.card} ${!p.naStanju ? styles.cardMuted : ""}`}
    >
      <div className={styles.cardImgWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.slike[0]}
          alt={p.naziv}
          width={600}
          height={600}
          loading="lazy"
        />
        {p.badge && <span className={styles.cardBadge}>{p.badge}</span>}
        {!p.naStanju && <div className={styles.cardSoldOut}>Rasprodano</div>}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardName}>{p.naziv}</div>
        <div className={styles.cardPriceRow}>
          {p.staraCijena && (
            <span className={styles.cardPriceOld}>
              {p.staraCijena} {p.valuta}
            </span>
          )}
          <span className={styles.cardPrice}>
            {p.cijena} {p.valuta}
          </span>
        </div>
        <div className={styles.cardRating}>
          <span className={styles.cardHearts} aria-hidden="true">
            ♥♥♥♥♥
          </span>
          {p.ocjena}({p.brojRecenzija} ocjena)
        </div>
      </div>
    </a>
  );
}
