import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";

// TODO: primjer-recenzije, nov proizvod, nema još pravih. Zamijeni kad ih
// budeš imao (isto upozorenje kao za ostale proizvode na sajtu).
const reviews = [
  {
    text: "Kćerka (4 god.) sjedne i nacrta pet slika za redom. Konačno malo mira dok spremam večeru.",
    initial: "S",
    name: "Selma H.",
  },
  {
    text: "Markeri se stvarno peru, probala na rukama i majici. Tabla se obriše i crta se ponovo.",
    initial: "I",
    name: "Irma K.",
  },
  {
    text: "Uzeli za rođendanski poklon. Projektor lijepo pokaže crtež pa dijete samo prati liniju.",
    initial: "M",
    name: "Mirela D.",
  },
];

export default function ProjektorReviews() {
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
