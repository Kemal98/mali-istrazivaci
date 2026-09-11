// Fraze su najbliže onome što stoji na referentnoj stranici (citirano
// tamo gdje sam imao tačan navod iz ranijeg pregleda te stranice u ovoj
// sesiji). GIF-ovi (giphy*.gif) nemaju svoj tekst na referenci koji sam
// zabilježio, pa su njihovi opisi generički/sigurni — ne tvrdim nešto
// specifično o sadržaju koje ne mogu potvrditi (fajlovi su preveliki za
// pregled ovdje).
const POINTS = [
  {
    naslov: "Savršena igračka koju djeca ne ispuštaju iz ruku.",
    tekst: "Perlica se pričvrsti za sekundu, bez ljepila, bez makaza, bez nereda.",
    media: { tip: "gif" as const, src: "/img/blinger/giphy.gif" },
  },
  {
    naslov: "Zajednička igra roditelja i djeteta.",
    tekst: "Slaganje perlica postaje trenutak druženja, ne samo igra za dijete samo.",
    media: {
      tip: "slika" as const,
      src: "/img/blinger/stvoreno_za_male_princeze.png",
      alt: "Mama i dvije djevojčice ukrašavaju kosu Blinger aparatom",
    },
  },
  {
    naslov: "Vidi u pokretu.",
    tekst: "Jedan pokret i perlica je na mjestu, brzo, bez muke.",
    media: { tip: "gif" as const, src: "/img/blinger/giphy-2.gif" },
  },
  {
    naslov: "Ne staje samo na kosi.",
    tekst: "Perlice se lijepe i za traku, obuću, tkaninu. Prostor za maštu van frizure.",
    media: {
      tip: "slika" as const,
      src: "/img/blinger/vise-nacina-koristenja.png",
      alt: "Blinger perlice zalijepljene na dječijoj patici",
    },
  },
  {
    naslov: "Igra koja traje, ne dosadi za dan.",
    tekst: "Svaki put nova kombinacija boja, ista igračka, drugačiji rezultat.",
    media: { tip: "gif" as const, src: "/img/blinger/giphy-3.gif" },
  },
];

export default function BlingerStory() {
  return (
    <section className="dawn-story">
      <div className="dawn-col">
        {POINTS.map((p) => (
          <div className="dawn-story-block" key={p.naslov}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.media.src}
              alt={p.media.tip === "slika" ? p.media.alt : p.naslov}
              loading="lazy"
            />
            <div className="dawn-story-copy">
              <p className="dawn-story-stmt">
                <span>{p.naslov}</span>
              </p>
              <p className="dawn-story-text">
                <span>{p.tekst}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
