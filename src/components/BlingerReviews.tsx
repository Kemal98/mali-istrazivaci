import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";

// Sparkling Diamond je nov proizvod na sajtu — nema još stvarnih recenzija
// za NJEGA konkretno, pa se namjerno ne izmišljaju (na izričit zahtjev).
// Zamijeni ovaj blok pravim recenzijama čim ih budeš imao/la.
export default function BlingerReviews() {
  return (
    <section className="dawn-reviews" id="recenzije">
      <div className="dawn-col">
        <h2 className="dawn-h2 dawn-h2-lg">
          Roditelji koji su već kupili kod nas ♥️
        </h2>
        <div className="dawn-rev-score">
          <span className="dawn-rev-num">{RATING}</span>
          <div>
            <div className="dawn-stars">★★★★★</div>
            <small>na osnovu {REVIEWS_COUNT} ocjena</small>
          </div>
        </div>
        <p className="dawn-rev-intro">
          Prve recenzije za Sparkling Diamond stižu uskoro — javi nam se sa
          svojim utiskom nakon kupovine!
        </p>
      </div>
    </section>
  );
}
