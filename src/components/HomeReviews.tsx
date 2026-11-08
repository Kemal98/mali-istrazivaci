import styles from "./Home.module.css";
import type { Review } from "@/lib/cms/types";

/**
 * Prima SAMO stvarne recenzije koje je admin ručno istakao (★ Na
 * početnoj, vidi ReviewsPanel) — ne sve objavljene. Sekcija se sakrije
 * ako nema ni jedne (nikad izmišljen citat).
 */
export default function HomeReviews({
  reviews,
}: {
  reviews: (Review & { productNaziv: string })[];
}) {
  if (reviews.length === 0) return null;

  const avg =
    Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;

  return (
    <section id="recenzije">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Šta kažu roditelji</span>
        <h2 className={styles.sectionTitle}>Porodice iz cijele BiH nam vjeruju</h2>
        <div className={styles.reviewsScore}>
          <span className={styles.reviewsScoreNum}>{avg}</span>
          <div className={styles.reviewsScoreMeta}>
            {"★".repeat(Math.round(avg))}
            <br />
            {reviews.length} {reviews.length === 1 ? "recenzija" : "recenzija"}
          </div>
        </div>
        <div className={styles.reviewsGrid}>
          {reviews.map((r) => (
            <div className={styles.reviewCard} key={r.id}>
              <div className={styles.reviewStars}>{"★".repeat(r.rating)}</div>
              <p className={styles.reviewText}>{r.tekst}</p>
              <div className={styles.reviewWho}>
                <div className={styles.reviewAv}>{r.inicijal || r.ime.charAt(0)}</div>
                <div>
                  <b>{r.ime}</b>
                  {r.productNaziv ? <small>{r.productNaziv}</small> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
