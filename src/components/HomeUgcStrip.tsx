import styles from "./Home.module.css";

// Nema stvarnih fotografija kupaca u /img — traka je spremna (isti markup
// koji treba za pravi UGC), ali svaka pločica dolje jasno piše "PRIMJER" i
// koristi postojeće slike proizvoda kao vizuelni placeholder. Zamijeni
// src listu pravim fotografijama kupaca kad ih budeš imao/la.
const PLACEHOLDER_TILES = [
  "/img/set_hero2.png",
  "/img/knjiga_proizvod2.png",
  "/img/igracke-izbor.png",
  "/img/tanagram.png",
  "/img/set_hero.jpg",
  "/img/igracke-izbor1.png",
];

export default function HomeUgcStrip() {
  return (
    <div className={styles.ugcStrip}>
      <div className={styles.wrap}>
        <span className={styles.kicker}>Naši mali istraživači</span>
      </div>
      <div className={styles.ugcTrack}>
        {PLACEHOLDER_TILES.map((src, i) => (
          <div className={styles.ugcItem} key={src + i} style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Primjer fotografije za UGC traku — zamijeni pravom fotografijom kupca" loading="lazy" />
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: "rgba(43,33,23,.75)",
                color: "#fff",
                fontSize: ".65rem",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "999px",
              }}
            >
              PRIMJER
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
