import { Fragment } from "react";

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
    tekst: "Igračka kojoj se bebe stalno vraćaju.",
    src: "/img/rotirajuce-zvecke/dimenzije.webp",
    alt: "Dimenzije rotirajuće zvečke: 10,5 x 4,2 cm",
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
              <p className="dawn-story-text">
                <span>{p.boldTekst ? <strong>{p.tekst}</strong> : p.tekst}</span>
              </p>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
