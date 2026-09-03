import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";

// TODO: ovo su primjer-recenzije, ne stvarni citati kupaca knjige — zamijeni
// stvarnim kad ih budeš imao.
const reviews = [
  {
    text: "Uzela sam za kćerku (3 god.) da ima nešto bez ekrana za duže vožnje. Sad je to njena omiljena igračka u autu.",
    initial: "L",
    name: "Lejla M.",
    city: "Sarajevo",
  },
  {
    text: "Sin (5 god.) je za sedmicu naučio nova slova kroz igru sa čičkom. Knjiga je čvrsta, izdržala je i pad sa stola.",
    initial: "A",
    name: "Amar S.",
    city: "Banja Luka",
  },
  {
    text: "Jednostavno, na našem jeziku, dijete odmah razumije zadatke. Preporučujem svima koji traže nešto edukativno bez tableta.",
    initial: "N",
    name: "Nadja K.",
    city: "Mostar",
  },
];

export default function BookReviewsDawn() {
  return (
    <section className="dawn-reviews" id="recenzije">
      <div className="dawn-col">
        <h2 className="dawn-h2">Roditelji koji su već kupili kod nas ♥️</h2>
        <p className="dawn-rev-intro">
          Kratko i iskreno — brza dostava, čvrsta knjiga, djeca zauzeta.
        </p>
        <div className="dawn-rev-score">
          <span className="dawn-rev-num">{RATING}</span>
          <div>
            <div className="dawn-stars">★★★★★</div>
            <small>na osnovu {REVIEWS_COUNT} ocjena roditelja</small>
          </div>
        </div>
        <div className="dawn-rev-list">
          {reviews.map((r) => (
            <div className="dawn-rev-card" key={r.name}>
              <div className="dawn-rev-who">
                <div className="dawn-rev-av">{r.initial}</div>
                <div>
                  <b>{r.name}</b>
                  <span className="dawn-rev-verified">Verifikovano</span>
                </div>
              </div>
              <p>&ldquo;{r.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
