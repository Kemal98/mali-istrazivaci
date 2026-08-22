import { FAMILIES_COUNT } from "@/lib/socialProof";

const reviews = [
  {
    text: "Kupila za rođendan. Kći (4 god.) je prvo sat vremena slagala mozgalicu, pa prešla na knjigu. Nije ni pitala za tablet cijelo popodne.",
    initial: "A",
    name: "Amina H.",
    city: "Sarajevo",
    av: "av1",
  },
  {
    text: "Ponijeli smo set na put. Sin je mirno prošao cijelu vožnju do mora. Tri različite igre znače da se ne dosadi brzo – to je razlika.",
    initial: "M",
    name: "Merima K.",
    city: "Tuzla",
    av: "av2",
  },
  {
    text: "Stiglo u lijepoj kutiji, nisam morala ništa pakovati. Sin je počeo prepoznavati slova kroz knjigu – sami smo se iznenadili.",
    initial: "D",
    name: "Dženan P.",
    city: "Zenica",
    av: "av3",
  },
];

export default function Reviews() {
  return (
    <section className="rev-bg" id="recenzije">
      <div className="wrap">
        <span className="kicker k-orange">Šta kažu roditelji</span>
        <h2 className="h-sec">Porodice iz cijele BiH nam vjeruju</h2>
        <div className="rev-score">
          <span className="num">4.9</span>
          <div className="rss">
            <span className="stars">★★★★★</span>
            <small>Ocjena zadovoljnih roditelja</small>
          </div>
          <div className="rev-score-sep" />
          <div className="rss">
            <span className="num2">{FAMILIES_COUNT}+</span>
            <small>zadovoljnih porodica</small>
          </div>
        </div>
        <div className="rev-grid">
          {reviews.map((r) => (
            <div className="rev-card" key={r.name}>
              <div className="rev-stars">★★★★★</div>
              <p className="rev-text">&ldquo;{r.text}&rdquo;</p>
              <div className="rev-who">
                <div className={`rev-av ${r.av}`}>{r.initial}</div>
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
