import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";

// TODO: primjer-recenzije, nov proizvod, nema još pravih. Zamijeni kad ih
// budeš imao (isto upozorenje kao za ostale proizvode na sajtu).
const reviews = [
  {
    text: "Ljepe se za kadu i za frižider, baš kako piše. Sin (8 mjeseci) ih okreće i smije se svaki put.",
    initial: "L",
    name: "Lamija T.",
  },
  {
    text: "Ponijeli smo ih na put, zalijepile su se za prozor aviona i mirno je sjedio pola leta.",
    initial: "N",
    name: "Nejra M.",
  },
  {
    text: "Lako se peru, nema sitnih dijelova koji se odvajaju. Preporučujem za bebe koje sve stavljaju u usta.",
    initial: "A",
    name: "Amina R.",
  },
];

export default function RattleReviews() {
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
