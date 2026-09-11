import styles from "./Home.module.css";

// Sadržaj izvučen iz postojeće /sat-mira stranice (Hero, TrustStrip, Offer,
// Guarantee) — isti razlozi, nova forma.
const REASONS = [
  {
    naslov: "Pažljivo biramo svaki proizvod",
    opis: "Ne prodajemo sve što postoji, samo igračke za koje mislimo da vrijede.",
  },
  {
    naslov: "Ručno pakujemo svaku narudžbu",
    opis: "Svaki paket pripremamo lično, ne šalje se iz tuđeg magacina.",
  },
  {
    naslov: "Netoksični materijali",
    opis: "Brušeno drvo bez oštrih ivica, boje bez štetnih materija, sigurno za malu djecu.",
  },
  {
    naslov: "Plaćanje pouzećem",
    opis: "Ne plaćaš ništa unaprijed. Platiš kuriru kad ti donese paket na vrata.",
  },
  {
    naslov: "14 dana povrat",
    opis: "Ne svidi se djetetu? Javi se u roku od 14 dana, vraćamo novac bez pitanja.",
  },
];

export default function HomeWhyUs() {
  return (
    <section id="zasto-mi">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Zašto Mali Istraživači</span>
        <h2 className={styles.sectionTitle}>Razlozi da nam povjeriš igru svog djeteta</h2>
        <div className={styles.whyGrid}>
          <div className={styles.whyImg}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/set_hero.jpg"
              alt="Dijete se igra igračkama Mali Istraživači"
              loading="lazy"
            />
          </div>
          <div className={styles.whyList}>
            {REASONS.map((r, i) => (
              <div className={styles.whyItem} key={r.naslov}>
                <span className={styles.whyNum}>{i + 1}</span>
                <div>
                  <h3>{r.naslov}</h3>
                  <p>{r.opis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
