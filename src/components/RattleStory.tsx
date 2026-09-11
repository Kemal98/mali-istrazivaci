// Fraze najbliže onome što stoji na referentnoj stranici (iz ranijeg
// pregleda te iste stranice u ovoj sesiji). Dimenzije (10.5 × 4.2 cm) su
// stvarno pročitane sa slike dimenzije.webp, ne izmišljene. Redoslijed
// medija je po tačnom zahtjevu: giphy-4, kupanje/putovanje/kuhinja,
// icon-motorika, dimenzije, giphy-5.
// u-paketu.webp namjerno uklonjena (bila je četvrta u nizu) — slika
// prikazuje zvečke u torbici, a torbica se NE dobija uz proizvod, pa bi
// zadržavanje te slike samo bez teksta i dalje vizuelno tvrdilo suprotno.
const POINTS = [
  {
    naslov: "Vidi u pokretu.",
    tekst: "Beba je okreće iznova i iznova — jednostavan pokret, dug interes.",
    src: "/img/rotirajuce-zvecke/giphy-4.gif",
    alt: "Rotirajuća zvečka u pokretu",
  },
  {
    naslov: "Odlične za kupanje, putovanje i kuhinju.",
    tekst: "Idealno dok spremaš ručak, pereš sudove ili se tuširaš.",
    src: "/img/rotirajuce-zvecke/kupanje,putovanje,kuhinja.png",
    alt: "Rotirajuće zvečke zalijepljene u kadi, na prozoru aviona i na frižideru",
  },
  {
    naslov: "Umirujuća igra koja drži pažnju.",
    tekst: "Vakuum se zalijepi za svaku površinu — ne padaju i ne klize tokom igre.",
    src: "/img/rotirajuce-zvecke/icon-motorika.webp",
    alt: "Beba se igra rotirajućom zvečkom na frižideru",
  },
  {
    naslov: "Prava veličina za male ruke — 10,5 × 4,2 cm.",
    tekst: "Igračka kojoj se bebe stalno vraćaju.",
    src: "/img/rotirajuce-zvecke/dimenzije.webp",
    alt: "Dimenzije rotirajuće zvečke — 10,5 x 4,2 cm",
  },
  {
    naslov: "Bez sitnih dijelova — bezbjedno za male ruke.",
    tekst: "Lako se peru i ponovo koriste.",
    src: "/img/rotirajuce-zvecke/giphy-5.gif",
    alt: "Rotirajuća zvečka u pokretu",
  },
];

export default function RattleStory() {
  return (
    <section className="dawn-story">
      <div className="dawn-col">
        {POINTS.map((p) => (
          <div className="dawn-story-block" key={p.naslov}>
            <p className="dawn-story-stmt">
              <span>{p.naslov}</span>
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} loading="lazy" />
            <p className="dawn-story-text">
              <span>{p.tekst}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
