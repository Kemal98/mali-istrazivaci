// Originalni tekstovi, sa vraćenim postojećim Blinger slikama/gifovima
// (isti fizički proizvod/aplikator, samo novo ime i ponuda — vlasnik je
// potvrdio da slike ostaju). Raspoređeno po bloku koji najbliže odgovara
// onome što se vidi.
const POINTS = [
  {
    naslov: "Stavi. Klikni. Zablistaj. ✨",
    tekst:
      "Odaberi dijamant, postavi aplikator na kosu i jednim pritiskom dodaj sjaj frizuri.",
    steps: ["Izaberi dijamant", "Postavi aplikator", "Klik — dijamant je na mjestu"],
    src: "/img/blinger/giphy-3.gif",
    alt: "Postavljanje dijamanta aplikatorom",
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
    src: "/img/blinger/giphy-2.gif",
    alt: "Dijamanti u više boja",
  },
  {
    naslov: "Svaki put druga frizura ✨",
    tekst: "Za svoju kosu. Za sestru ili prijateljicu. Za lutke. Za rođendane i druženja.",
    src: "/img/blinger/giphy.gif",
    alt: "Različite frizure sa dijamantima",
  },
  {
    naslov: "Još više načina za kreativnost",
    tekst:
      "Dijamanti nisu samo za kosu — isprobaj ih i na traci za kosu, torbici ili omiljenom modnom dodatku.",
    src: "/img/blinger/vise-nacina-koristenja.png",
    alt: "Dijamanti zalijepljeni na patiku",
  },
  {
    naslov: "Još je zabavnije u dvoje 💕",
    tekst: null,
    src: "/img/blinger/stvoreno_za_male_princeze.png",
    alt: "Mama i djevojčice ukrašavaju kosu zajedno",
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
            {p.src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.src} alt={p.alt} loading="lazy" />
            )}
            {p.tekst && (
              <p className="dawn-story-text">
                <span>{p.tekst}</span>
              </p>
            )}
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
