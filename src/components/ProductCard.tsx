import type { Product } from "@/lib/products";
import styles from "./Home.module.css";

export default function ProductCard({ product: p }: { product: Product }) {
  return (
    <a
      href={p.link}
      className={`${styles.card} ${!p.naStanju ? styles.cardMuted : ""}`}
    >
      <div className={styles.cardImgWrap}>
        {p.slike[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.slike[0]}
            alt={p.naziv}
            width={600}
            height={600}
            loading="lazy"
          />
        ) : (
          <div className={styles.cardImgPlaceholder} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
            </svg>
          </div>
        )}
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
