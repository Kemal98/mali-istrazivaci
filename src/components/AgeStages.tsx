const stages = [
  {
    age: "2–3 godine",
    text: "Prepoznaje životinje, lijepi čičak, slaže oblike",
  },
  {
    age: "4–5 godina",
    text: "Uči slova i brojeve, slaže tangram figure",
  },
  {
    age: "6 godina",
    text: "Spelovanje riječi, čita sat, rješava složene zadatke",
  },
];

export default function AgeStages() {
  return (
    <section>
      <div className="wrap">
        <h2 className="h-sec">
          Ista kutija zabavlja dvogodišnjaka i uči šestogodišnjaka
        </h2>
        <div className="stages-list">
          {stages.map((s) => (
            <div className="stage-row" key={s.age}>
              <div className="stage-age">{s.age}</div>
              <div className="stage-desc">{s.text}</div>
            </div>
          ))}
        </div>
        <p className="stages-note">
          Isti set koji dvogodišnjak koristi za životinje, šestogodišnjak
          koristi za prve riječi. Zato ga ne prerastaju za tri mjeseca.
        </p>
        <p className="stages-punch">Jedan set. Četiri godine korištenja.</p>
      </div>
    </section>
  );
}
