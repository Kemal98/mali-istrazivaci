import { getUnifiedProducts, posebnePonude } from "@/lib/home/rank";
import ProductCard from "./ProductCard";
import styles from "./Home.module.css";

export default async function HomePosebnePonude() {
  const all = await getUnifiedProducts().catch(() => []);
  const items = posebnePonude(all);
  if (items.length === 0) return null;

  return (
    <section id="posebne-ponude">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Akcija</span>
        <h2 className={styles.sectionTitle}>Posebne ponude za male istraživače</h2>
        <p className={styles.sectionSub}>
          Stvarna sniženja i paketne ponude — automatski, bez izmišljenih popusta.
        </p>
        <div className={styles.grid}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
