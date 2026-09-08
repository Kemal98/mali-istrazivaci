// Fraze ovdje su najbliže onome što stoji na referentnoj stranici (iz
// ranijeg pregleda te stranice u ovoj sesiji — citirano tamo gdje sam
// imao tačan navod, moj tekst tamo gdje sam imao samo opis teme).
const POINTS = [
  {
    naslov: "Savršena igračka koju djeca ne ispuštaju iz ruku.",
    tekst: "Perlica se pričvrsti za sekundu — bez ljepila, bez makaza, bez nereda.",
  },
  {
    naslov: "Zajednička igra roditelja i djeteta.",
    tekst: "Slaganje perlica postaje trenutak druženja, ne samo igra za dijete samo.",
  },
  {
    naslov: "Ne staje samo na kosi.",
    tekst: "Perlice se lijepe i za traku, tkaninu, papir — prostor za maštu van frizure.",
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
          </div>
        ))}
      </div>
    </section>
  );
}
