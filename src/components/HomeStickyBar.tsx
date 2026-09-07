import Link from "next/link";
import styles from "./Home.module.css";

// Brief traži "cijena + Naruči dugme", ali ovo je sad mreža sa više
// proizvoda — nema jedne cijene da se prikaže. Umjesto izmišljanja jedne,
// traka ističe stvarni bestseller (SAT MIRA, koji već nosi reklame) i
// vodi direktno na njega — isti cilj (brz put do narudžbe na mobitelu),
// bez lažnog predstavljanja cijene cijele stranice.
export default function HomeStickyBar() {
  return (
    <div className={styles.sticky}>
      <div className={styles.stickyText}>
        SAT MIRA — 29 KM
        <small>Bestseller · Pouzeće</small>
      </div>
      <Link href="/sat-mira" className={styles.btnPrimary} style={{ padding: "12px 22px", fontSize: ".9rem" }}>
        Naruči
      </Link>
    </div>
  );
}
