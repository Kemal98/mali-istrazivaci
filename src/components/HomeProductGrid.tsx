import Link from "next/link";
import { getUnifiedProducts } from "@/lib/home/rank";
import { CATEGORY_KEYS, CATEGORY_LABELS } from "@/lib/home/types";
import ProductCard from "./ProductCard";
import styles from "./Home.module.css";

const CATEGORY_FILTERS = [
  { kategorija: "", label: "Sve" },
  ...CATEGORY_KEYS.map((k) => ({ kategorija: k, label: CATEGORY_LABELS[k] })),
];

const PAGE_SIZE = 6;

// Spaja "statične" proizvode (SAT MIRA, Sparkling Diamond — nemaju svoju
// CMS stranicu) i OBJAVLJENE CMS proizvode u jednu listu — logika živi u
// src/lib/home/rank.ts (getUnifiedProducts), deli se sa "Hit proizvodi" i
// "Posebne ponude" sekcijama da se ne piše triput.
export default async function HomeProductGrid({
  kategorija,
  sve,
}: {
  kategorija?: string;
  sve?: boolean;
}) {
  const all = await getUnifiedProducts().catch(() => []);

  const items = kategorija ? all.filter((p) => p.kategorije.includes(kategorija)) : all;
  const visible = sve ? items : items.slice(0, PAGE_SIZE);
  const katParam = (k: string) => (k ? `?kategorija=${k}` : "");

  return (
    <section id="proizvodi">
      <div className={styles.wrap}>
        <h2 className={styles.sectionTitle}>Igračke za svakog</h2>

        <div className={styles.catFilters}>
          {CATEGORY_FILTERS.map((c) => {
            const active = (kategorija ?? "") === c.kategorija;
            return (
              <Link
                key={c.kategorija || "sve"}
                href={`/${katParam(c.kategorija)}#proizvodi`}
                className={`${styles.catFilterBtn} ${active ? styles.catFilterBtnActive : ""}`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {items.length > 0 ? (
          <>
            <div className={styles.grid}>
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {!sve && items.length > PAGE_SIZE ? (
              <div className={styles.showMoreWrap}>
                <Link
                  href={`/${katParam(kategorija ?? "")}${kategorija ? "&" : "?"}sve=1#proizvodi`}
                  className={styles.showMoreBtn}
                >
                  Pogledaj više ({items.length - PAGE_SIZE})
                </Link>
              </div>
            ) : null}
          </>
        ) : (
          <p className={styles.sectionSub}>
            Još nemamo proizvod u ovoj kategoriji, javi nam se ako tražiš
            nešto konkretno.
          </p>
        )}
      </div>
    </section>
  );
}
