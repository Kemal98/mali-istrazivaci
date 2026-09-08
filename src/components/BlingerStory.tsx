// Originalan tekst, nadahnut strukturom referentne stranice — bez
// preuzimanja njihovih rečenica. Bez slika (nema pravih fotografija ovog
// proizvoda u /img), pa je ovo tekstualna verzija umjesto naizmjeničnog
// teksta/slika kao na BookStory.
const POINTS = [
  {
    naslov: "Perlica se pričvrsti za par sekundi.",
    tekst: "Nema čekanja, nema frustracije — dijete odmah vidi rezultat.",
  },
  {
    naslov: "Bez ljepila, bez makaza, bez nereda.",
    tekst: "Sve što treba je aparat i perlice. Čisto od početka do kraja.",
  },
  {
    naslov: "Perlice se lijepe za skoro svaku površinu.",
    tekst: "Ne samo kosa — traka, papir, tkanina. Prostor za maštu, ne samo frizuru.",
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
