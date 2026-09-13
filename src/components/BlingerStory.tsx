import { FAMILIES_COUNT, RATING } from "@/lib/socialProof";

// Struktura/redoslijed sekcija prati tačno referentnu stranicu (slike
// koje je vlasnik poslao od te stranice, screenshot po screenshot,
// odozgo nadolje) — ali svaka rečenica je vlastita formulacija na
// ijekavici, ne prepisana od njih. "Bez ekrana" namjerno izostavljeno
// (uklonjeno sitewide ranije u sesiji, na izričit zahtjev).
const POINTS = [
  {
    naslov: "Igračka koju djeca stalno traže nazad.",
    tekst:
      "Dijamant se pričvrsti za par sekundi. Bez ljepila. Bez makaza. Bez nereda. Dijamanti se lijepe za skoro svaku površinu.",
    src: "/img/blinger/stvoreno_za_male_princeze.png",
    alt: "Mama i djevojčice ukrašavaju kosu zajedno",
    bold: true,
  },
  {
    naslov: "Mama i kćerka, zajedno u igri.",
    tekst: "Sati kreativne igre i zajedničkog druženja. Savršeno za rođendane i igru kod kuće.",
    src: "/img/blinger/giphy.gif",
    alt: "Zajednička igra sa Sparkling Diamond aparatom",
    bold: true,
  },
  {
    naslov: "Još više načina za kreativnost.",
    tekst: "Kosa, trake, torbice, obuća... i sve čega se sjetite!",
    src: "/img/blinger/vise-nacina-koristenja.png",
    alt: "Dijamanti zalijepljeni na patiku",
    bold: true,
  },
  {
    naslov: "Igračka koja se stvarno koristi, ne samo otvori i ostavi.",
    tekst: null,
    bold: true,
  },
];

export default function BlingerStory() {
  return (
    <section className="dawn-story">
      <div className="dawn-col">
        <div className="dawn-story-block">
          <p className="dawn-story-proof-count">
            Preko {FAMILIES_COUNT}+ zadovoljnih roditelja
          </p>
          <p className="dawn-story-proof-stars" style={{ marginBottom: 18 }}>
            ⭐️⭐️⭐️⭐️⭐️ (prosječna ocjena {RATING}/5)
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/blinger/giphy-3.gif"
            alt="Djeca koriste Sparkling Diamond aparat"
            loading="lazy"
          />
        </div>

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
                <span>{p.bold ? <strong>{p.tekst}</strong> : p.tekst}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
