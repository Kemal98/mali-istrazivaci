import styles from "./Home.module.css";

export default function HomeHero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.wrap}>
        <div className={styles.heroGrid}>
          <div>
            <h1 className={styles.heroTitle}>
              Igračke koje djeca
              <br />
              stvarno zavole.
            </h1>
            <p className={styles.heroSub}>
              Pažljivo birane igračke za djecu svih uzrasta — plaćanje
              pouzećem, dostava po cijeloj BiH.
            </p>
            <div className={styles.heroBtns}>
              <a href="#proizvodi" className={styles.btnPrimary}>
                Pogledaj proizvode
              </a>
              <a href="#zasto-mi" className={styles.btnSecondary}>
                Kako radi
              </a>
            </div>
          </div>
          <div className={styles.heroMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/set_hero2.png"
              alt="Montessori igračke Mali Istraživači – set na čičak, drveni sat i magnetni tangram"
              width={800}
              height={800}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
