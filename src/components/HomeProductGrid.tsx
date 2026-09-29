import Link from "next/link";
import { PRODUCTS, type Product } from "@/lib/products";
import { listProducts, listPublishedReviews } from "@/lib/cms/repo";
import ProductCard from "./ProductCard";
import styles from "./Home.module.css";

const KATEGORIJA_LABEL: Record<string, string> = {
  bebe: "za bebe",
  djevojcice: "za djevojčice",
  edukativno: "edukativne",
};

// Početna prikazuje DVIJE grupe proizvoda, spojene u jednu listu:
//  1) "statični" proizvodi iz src/data/products.json — SAT MIRA i ostali
//     koji imaju svoju ručno pisanu stranicu (nisu u CMS bazi).
//  2) OBJAVLJENI proizvodi iz admin panela (CMS) — objaviš proizvod u
//     adminu, on se odmah pojavi ovdje, bez da iko dira ovaj fajl ili json.
// Proizvod iz CMS-a se preskače ako već postoji u json-u sa istim
// linkom (npr. Sparkling Diamond je i dalje u products.json — ne
// duplira se kartica).
//
// Kategorija (shopKategorija) se čita direktno sa proizvoda, ne iz
// published snapshota — to je samo admin oznaka za navigaciju na
// početnoj, ne javni sadržaj, pa ne treba isto "zamrzavanje" do objave
// kao cijena/tekst.
async function cmsProducts(existingLinks: Set<string>): Promise<Product[]> {
  const published = (await listProducts()).filter(
    (p) =>
      p.status === "published" &&
      p.publishedHero &&
      p.publishedData &&
      p.publishedData.cijena !== null &&
      !existingLinks.has(`/${p.slug}`)
  );

  return Promise.all(
    published.map(async (p) => {
      const reviews = await listPublishedReviews(p.id);
      const avg = reviews.length
        ? Math.round(
            (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
          ) / 10
        : 5;
      return {
        id: p.id,
        naziv: p.publishedData!.naziv,
        podnaslov: "",
        cijena: p.publishedData!.cijena as number,
        staraCijena: p.publishedData!.staraCijena,
        valuta: "KM",
        badge: p.publishedData!.badge || null,
        uzrast: ["2-3", "4-6"],
        kategorije: p.shopKategorija ? [p.shopKategorija] : [],
        slike: [p.publishedHero!.slika],
        ocjena: avg,
        brojRecenzija: reviews.length,
        naStanju: true,
        link: `/${p.slug}`,
      } satisfies Product;
    })
  );
}

export default async function HomeProductGrid({ kategorija }: { kategorija?: string }) {
  const existingLinks = new Set(PRODUCTS.map((p) => p.link));
  const fromCms = await cmsProducts(existingLinks).catch(() => []);
  const all = [...PRODUCTS, ...fromCms];

  const items = kategorija ? all.filter((p) => p.kategorije.includes(kategorija)) : all;

  return (
    <section id="proizvodi">
      <div className={styles.wrap}>
        <h2 className={styles.sectionTitle}>Najprodavanije igračke</h2>
        {kategorija && (
          <p className={styles.sectionSub}>
            Prikazano {KATEGORIJA_LABEL[kategorija] ?? kategorija} ·{" "}
            <Link href="/#proizvodi" style={{ textDecoration: "underline" }}>
              Prikaži sve
            </Link>
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
            Još nemamo proizvod u ovoj kategoriji, javi nam se ako tražiš
            nešto konkretno.
          </p>
        )}
      </div>
    </section>
  );
}
