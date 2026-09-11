import { Fragment } from "react";
import { RATING, FAMILIES_COUNT } from "@/lib/socialProof";

const INCLUDES_ITEMS = [
  "3 rotirajuća spinera (leptir, bubamara, pčela)",
  "Vakuum osnova za lijepljenje",
  "Spremno za igru",
];

// Fraze najbliže onome što stoji na referentnoj stranici (iz ranijeg
// pregleda te iste stranice u ovoj sesiji). Dimenzije (10.5 × 4.2 cm) su
// stvarno pročitane sa slike dimenzije.webp, ne izmišljene. Redoslijed
// medija je po tačnom zahtjevu: kupanje/putovanje/kuhinja, icon-motorika,
// dimenzije, giphy-5.
// giphy-4.gif se više ne ponavlja ovdje — sad je gore u Hero-u i u
// checkout modalu, pa bi bio duplikat da ostane i kao prva tačka ovdje.
// u-paketu.webp namjerno uklonjena (bila je četvrta u nizu) — slika
// prikazuje zvečke u torbici, a torbica se NE dobija uz proizvod, pa bi
// zadržavanje te slike samo bez teksta i dalje vizuelno tvrdilo suprotno.
const POINTS = [
  {
    naslov: "Odlične za kupanje, putovanje i kuhinju.",
    tekst: "Idealno dok spremate ručak, perete sudove ili se tuširate.",
    src: "/img/rotirajuce-zvecke/kupanje,putovanje,kuhinja.png",
    alt: "Rotirajuće zvečke zalijepljene u kadi, na prozoru aviona i na frižideru",
    boldTekst: true,
  },
  {
    naslov: "Umirujuća igra koja drži pažnju.",
    tekst: "Vakuum se zalijepi za svaku površinu, ne padaju i ne klize tokom igre.",
    src: "/img/rotirajuce-zvecke/icon-motorika.webp",
    alt: "Beba se igra rotirajućom zvečkom na frižideru",
  },
  {
    naslov: "Prava veličina za male ruke: 10,5 × 4,2 cm.",
    tekst: null,
    src: "/img/rotirajuce-zvecke/dimenzije.webp",
    alt: "Dimenzije rotirajuće zvečke: 10,5 x 4,2 cm",
    includesInstead: true,
  },
  {
    naslov: "Bez sitnih dijelova, bezbjedno za male ruke.",
    tekst: "Lako se peru i ponovo koriste.",
    src: "/img/rotirajuce-zvecke/giphy-5.gif",
    alt: "Rotirajuća zvečka u pokretu",
    boldTekst: true,
  },
];

export default function RattleStory() {
  return (
    <section className="dawn-story">
      <div className="dawn-col">
        {POINTS.map((p, i) => (
          <Fragment key={p.naslov}>
            {i === POINTS.length - 1 && (
              <div className="dawn-hit-block">
                <span className="dawn-hit-badge">HIT</span>
                <p className="dawn-hit-tagline">
                  Igračka koju roditelji
                  <br />
                  non-stop hvale!
                </p>
                <p className="dawn-hit-sub">
                  Poklon koji roditeljima
                  <br />
                  olakšava svakodnevicu.
                </p>
              </div>
            )}
            <div className="dawn-story-block">
              <p className="dawn-story-stmt">
                <span>{p.naslov}</span>
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} loading="lazy" />
              {p.includesInstead ? (
                <div className="dawn-story-text dawn-includes dawn-includes-inline">
                  <h2 className="dawn-h2 dawn-h2-xs">U paketu dobijaš:</h2>
                  <ul>
                    {INCLUDES_ITEMS.map((t) => (
                      <li key={t}>
                        {t} <span className="dawn-check" aria-hidden="true">✓</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="dawn-story-text">
                  <span>{p.boldTekst ? <strong>{p.tekst}</strong> : p.tekst}</span>
                </p>
              )}
              {i === 0 && (
                <div className="dawn-story-proof">
                  <p className="dawn-story-proof-count">
                    Preko {FAMILIES_COUNT}+ zadovoljnih roditelja
                  </p>
                  <p className="dawn-story-proof-stars">
                    ⭐️⭐️⭐️⭐️⭐️ (prosječna ocjena {RATING}/5)
                  </p>
                </div>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
