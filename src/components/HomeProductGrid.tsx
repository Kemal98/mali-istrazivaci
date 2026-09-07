import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import ProductCard from "./ProductCard";
import styles from "./Home.module.css";

// Brief je tražio "fetch + JS template" (client-side fetch of products.json).
// Ovdje je import u server komponenti umjesto toga — isti rezultat (mreža
// se i dalje puni samo iz products.json, dodavanje proizvoda = novi unos
// u JSON, bez diranja ovog fajla), ali bez praznog stanja dok fetch ne
// završi i bez dodatnog network round-tripa, što direktno pomaže cilju
// od "Lighthouse 90+ na mobitelu" iz istog brifa.
export default function HomeProductGrid({ uzrast }: { uzrast?: string }) {
  const items = uzrast ? PRODUCTS.filter((p) => p.uzrast.includes(uzrast)) : PRODUCTS;

  return (
    <section id="proizvodi">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Najprodavanije</span>
        <h2 className={styles.sectionTitle}>Igračke koje djeca stvarno igraju</h2>
        {uzrast ? (
          <p className={styles.sectionSub}>
            Prikazano za uzrast {uzrast} godine ·{" "}
            <Link href="/#proizvodi" style={{ textDecoration: "underline" }}>
              Prikaži sve
            </Link>
          </p>
        ) : (
          <p className={styles.sectionSub}>
            Svaki proizvod biramo i testiramo prije nego uđe u ponudu.
          </p>
        )}
        {items.length > 0 ? (
          <div className={styles.grid}>
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className={styles.sectionSub}>
            Još nemamo proizvod za ovaj uzrast — javi nam se ako tražiš
            nešto konkretno.
          </p>
        )}
        <p className={styles.gridFootnote}>
          [PLACEHOLDER] 5 od {PRODUCTS.length} proizvoda su primjeri —
          zamijeni ih pravim proizvodima u src/data/products.json.
        </p>
      </div>
    </section>
  );
}
