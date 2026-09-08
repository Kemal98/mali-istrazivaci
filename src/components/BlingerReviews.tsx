import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";

// TODO: primjer-recenzije, ne stvarni citati kupaca — ovo je nov proizvod,
// nema još pravih recenzija. Zamijeni kad ih budeš imao (isto upozorenje
// kao za ostale proizvode na sajtu).
const reviews = [
  {
    text: "Kćerka (6 god.) je sama naučila da radi frizure sebi i lutkama. Perlice se drže, ne otpadaju tokom dana.",
    initial: "E",
    name: "Elma S.",
  },
  {
    text: "Uzela sam za rođendan. Nema ljepila ni makaza pa mogu i sama da se igra bez nadzora.",
    initial: "S",
    name: "Selma H.",
  },
  {
    text: "Djeca su se igrala i sa trakom za kosu, ne samo kosom. Dobra ideja za mirno popodne.",
    initial: "I",
    name: "Ilma K.",
  },
];

export default function BlingerReviews() {
  return (
    <section className="dawn-reviews" id="recenzije">
      <div className="dawn-col">
        <div className="dawn-rev-score">
          <span className="dawn-rev-num">{RATING}</span>
          <div>
            <div className="dawn-stars">★★★★★</div>
            <small>na osnovu {REVIEWS_COUNT} ocjena</small>
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
