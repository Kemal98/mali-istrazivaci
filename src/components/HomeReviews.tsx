import { RATING, REVIEWS_COUNT, FAMILIES_COUNT } from "@/lib/socialProof";
import styles from "./Home.module.css";

// Isti citati koje već koristi postojeća Reviews.tsx komponenta na
// /sat-mira — nova forma, isti stvarni sadržaj ("Iskoristi postojeće").
const REVIEWS = [
  {
    text: "Kupila za rođendan. Kći (4 god.) je prvo sat vremena slagala mozgalicu, pa prešla na knjigu. Nije ni pitala za tablet cijelo popodne.",
    initial: "A",
    name: "Amina H.",
    city: "Sarajevo",
  },
  {
    text: "Ponijeli smo set na put. Sin je mirno prošao cijelu vožnju do mora. Tri različite igre znače da se ne dosadi brzo – to je razlika.",
    initial: "M",
    name: "Merima K.",
    city: "Tuzla",
  },
  {
    text: "Stiglo u lijepoj kutiji, nisam morala ništa pakovati. Sin je počeo prepoznavati slova kroz knjigu – sami smo se iznenadili.",
    initial: "D",
    name: "Dženan P.",
    city: "Zenica",
  },
];

export default function HomeReviews() {
  return (
    <section id="recenzije">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Šta kažu roditelji</span>
        <h2 className={styles.sectionTitle}>Porodice iz cijele BiH nam vjeruju</h2>
        <div className={styles.reviewsScore}>
          <span className={styles.reviewsScoreNum}>{RATING}</span>
          <div className={styles.reviewsScoreMeta}>
            ★★★★★
            <br />
            {REVIEWS_COUNT} ocjena · {FAMILIES_COUNT}+ porodica
          </div>
        </div>
        <div className={styles.reviewsGrid}>
          {REVIEWS.map((r) => (
            <div className={styles.reviewCard} key={r.name}>
              <div className={styles.reviewStars}>★★★★★</div>
              <p className={styles.reviewText}>&ldquo;{r.text}&rdquo;</p>
              <div className={styles.reviewWho}>
                <div className={styles.reviewAv}>{r.initial}</div>
                <div>
                  <b>{r.name}</b>
                  <small>{r.city}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
