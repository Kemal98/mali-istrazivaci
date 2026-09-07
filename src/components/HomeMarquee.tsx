import styles from "./Home.module.css";

const ITEMS = [
  "Bez ekrana",
  "Sve na našem jeziku",
  "Netoksični materijali",
  "Ručno pakujemo u BiH",
  "Dostava 2–4 dana",
];

export default function HomeMarquee() {
  // Traka se duplira jednom da animacija (translateX -50%) izgleda kao
  // beskonačna petlja bez vidljivog "skoka" na kraju.
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={styles.marqueeTrack}>
        {loop.map((t, i) => (
          <span key={i}>✦ {t}</span>
        ))}
      </div>
    </div>
  );
}
