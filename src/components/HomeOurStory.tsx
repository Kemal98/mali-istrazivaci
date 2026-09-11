import styles from "./Home.module.css";

// TODO: AboutUs.tsx (postojeća komponenta) je prazan placeholder — nema
// stvarne "naše priče" nigdje u kodu, pa ne mogu izvući stvarne činjenice
// (ko je osnovao, kada, zašto). Tekst ispod je namjerno generički/misija-
// fokusiran, bez izmišljenih ličnih detalja — zamijeni stvarnom pričom.
export default function HomeOurStory() {
  return (
    <section id="nasa-prica">
      <div className={styles.wrap}>
        <div className={styles.storyGrid}>
          <div className={styles.storyImg}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/knjiga_proizvod2.png"
              alt="Igračka Mali Istraživači, izbliza"
              loading="lazy"
            />
          </div>
          <div className={styles.storyText}>
            <span className={styles.kicker} style={{ textAlign: "left" }}>
              Naša priča
            </span>
            <h2>Igračke koje biramo pažljivo</h2>
            <p>
              [PLACEHOLDER TEKST] Mali Istraživači je nastao iz želje da
              roditeljima u BiH olakšamo izbor igračaka, bez pretraživanja
              stranih sajtova i čekanja sedmicama na dostavu. Svaki proizvod
              biramo i testiramo prije nego što uđe u ponudu.
            </p>
            <a href="#proizvodi" className={styles.btnSecondary}>
              Pogledaj proizvode
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
