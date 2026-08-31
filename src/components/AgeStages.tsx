export type Stage = { age: string; text: string };

const defaultStages: Stage[] = [
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

export default function AgeStages({
  stages = defaultStages,
  title = "Ista kutija zabavlja dvogodišnjaka i uči šestogodišnjaka",
  note = "Isti set koji dvogodišnjak koristi za životinje, šestogodišnjak koristi za prve riječi. Zato ga ne prerastaju za tri mjeseca.",
  punch = "Jedan set. Četiri godine korištenja.",
}: {
  stages?: Stage[];
  title?: string;
  note?: string;
  punch?: string;
}) {
  return (
    <section>
      <div className="wrap">
        <h2 className="h-sec">{title}</h2>
        <div className="stages-list">
          {stages.map((s) => (
            <div className="stage-row" key={s.age}>
              <div className="stage-age">{s.age}</div>
              <div className="stage-desc">{s.text}</div>
            </div>
          ))}
        </div>
        <p className="stages-note">{note}</p>
        <p className="stages-punch">{punch}</p>
      </div>
    </section>
  );
}
