import { getUnifiedProducts, computeHitProizvodi } from "@/lib/home/rank";
import ProductCard from "./ProductCard";
import styles from "./Home.module.css";
import type { HomeContent } from "@/lib/home/types";

const MAX_ITEMS = 12;

export default async function HomeHitProizvodi({ content }: { content: HomeContent }) {
  const all = await getUnifiedProducts().catch(() => []);
  if (all.length === 0) return null;

  const { autoRankedIds, bestsellerIds } = await computeHitProizvodi(all);
  const byLink = new Map(all.map((p) => [p.link, p]));

  // Ručno zakucana lista POTPUNO zamjenjuje automatski rang kad postoji
  // (odluka iz intervjua) — bestseller bedž ostaje iz STVARNE prodaje,
  // bez obzira na to.
  const orderIds = content.hitProizvodiPinned.length
    ? content.hitProizvodiPinned
    : autoRankedIds;

  const items = orderIds.map((id) => byLink.get(id)).filter((p) => p !== undefined).slice(0, MAX_ITEMS);
  if (items.length === 0) return null;

  return (
    <section id="hit-proizvodi">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Najprodavaniji</span>
        <h2 className={styles.sectionTitle}>Hit proizvodi koje mališani obožavaju</h2>
        <p className={styles.sectionSub}>Pronađi novu omiljenu igračku za svoje dijete.</p>
        <div className={styles.grid}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} bestseller={bestsellerIds.has(p.link)} />
          ))}
        </div>
      </div>
    </section>
  );
}
