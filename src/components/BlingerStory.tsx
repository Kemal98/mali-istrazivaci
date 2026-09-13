// Originalni tekstovi, bez tuđih slika (nema pravih fotografija Sparkling
// Diamond proizvoda još) — isti princip kao ProjektorStory.tsx: blokovi
// bez slike, centrirani tekst, dok ne stignu prave fotografije.
const POINTS = [
  {
    naslov: "Stavi. Klikni. Zablistaj. ✨",
    tekst:
      "Odaberi dijamant, postavi aplikator na kosu i jednim pritiskom dodaj sjaj frizuri.",
    steps: ["Izaberi dijamant", "Postavi aplikator", "Klik — dijamant je na mjestu"],
  },
  {
    naslov: "Njen mali salon kod kuće 💕",
    tekst:
      "Danas uređuje svoju kosu. Sutra mamu. Onda prijateljicu ili lutku — Sparkling Diamond pretvara obično popodne u mali salon ljepote kod kuće.",
  },
  {
    naslov: "75 dijamanata. 5 boja. Puno kombinacija.",
    tekst:
      "5 diskova, svaki sa po 15 dijamanata u različitim bojama — svaki put druga kombinacija, drugi izgled.",
  },
  {
    naslov: "Svaki put druga frizura ✨",
    tekst: "Za svoju kosu. Za sestru ili prijateljicu. Za lutke. Za rođendane i druženja.",
  },
  {
    naslov: "Još više načina za kreativnost",
    tekst:
      "Dijamanti nisu samo za kosu — isprobaj ih i na traci za kosu, torbici ili omiljenom modnom dodatku.",
  },
  {
    naslov: "Još je zabavnije u dvoje 💕",
    tekst:
      "Jedna bira boju, druga pravi frizuru — pa zamijene uloge. Sa mamom, sestrom ili najboljom drugaricom.",
  },
];

export default function BlingerStory() {
  return (
    <section className="dawn-story">
      <div className="dawn-col">
        {POINTS.map((p) => (
          <div className="dawn-story-block" key={p.naslov}>
            <p className="dawn-story-stmt">
              <span>{p.naslov}</span>
            </p>
            <p className="dawn-story-text">
              <span>{p.tekst}</span>
            </p>
            {p.steps && (
              <ol className="dawn-step-list">
                {p.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
