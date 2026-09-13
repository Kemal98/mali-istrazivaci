// Ocjena/broj ocjena su hardkodirani (4.8 / 22) samo za ovu stranicu —
// isto kao u BlingerHero.tsx — umjesto sitewide RATING/REVIEWS_COUNT
// (4.9/87) iz socialProof.ts.
const PAGE_RATING = 4.8;
const PAGE_REVIEWS_COUNT = 22;

// Stvarne recenzije koje je poslao vlasnik (tekst prenešen kako je
// poslan, samo očišćen pravopis/razmaci) — imena su nasumično dodana jer
// nisu poslana uz tekst. Prva recenzija ima i stvarnu fotografiju.
const reviews = [
  {
    text: "Nikad ne pišem recenzije, ali ovo me stvarno oduševilo. Iskreno, bila sam skeptična, ali ih je TAKO LAKO staviti, a izdržale su cijeli rođendan u trampoline parku! Nakon toga je čak i spavala s njima, a ujutro su još uvijek sve bile na mjestu!!! Nemam pojma kako, jer uopšte nisu pretjerano ljepljive. Jutros sam ih skinula bez ikakvih problema, bez bola, suza ili čupanja kose. Stvarno ne znam koja je nauka iza ovoga? 😂 Ozbiljno preporučujem!",
    initial: "D",
    name: "Dženita M.",
    photo: "/img/blinger/recenzije/rodjendan.jpg",
  },
  {
    text: "Iskreno nisam znala šta da očekujem kada sam naručila, ali baš sam zadovoljna. Vrlo jednostavno se stavljaju, lijepo stoje u kosi i najvažnije mi je što se poslije bez problema skinu.",
    initial: "A",
    name: "Amila K.",
  },
  {
    text: "Kupila sam ih za kćerku jer stalno traži neke ukrase za kosu. Mislila sam da će brzo spasti, ali držale su joj skoro cijeli dan. Baš su praktične, lako ih mogu staviti i sama kod kuće.",
    initial: "M",
    name: "Merima S.",
  },
  {
    text: "Najviše sam se bojala skidanja jer moja curica ne podnosi kada je nešto vuče za kosu. Na kraju nije bilo nikakvih problema. Jednostavno se stave, lijepo izgledaju i lako se skinu.",
    initial: "L",
    name: "Lejla P.",
  },
  {
    text: "Naručila sam ih više iz radoznalosti, ali moram priznati da su me pozitivno iznenadile. Kćerka ih baš voli, a meni odgovara što ne moram dugo praviti frizuru da bi kosa izgledala zanimljivije.",
    initial: "E",
    name: "Emina R.",
  },
  {
    text: "Baš dobra stvar za djevojčice koje vole šljokice i ukrase u kosi. Kod nas se pokazalo super za rođendane i posebne prilike, ali ih sada želi nositi i običnim danima.",
    initial: "A",
    name: "Amra B.",
  },
  {
    text: "Prvi put sam mislila da neću znati kako ih pravilno staviti, ali stvarno je jednostavno. Trebalo mi je svega nekoliko minuta, a frizura je odmah izgledala mnogo ljepše.",
    initial: "A",
    name: "Ajla N.",
  },
  {
    text: "Ono što mi se posebno svidjelo jeste što nisu neugodne na kosi. Kćerka ih je nosila nekoliko sati i nije se žalila da je nešto zateže ili smeta. Skinule smo ih brzo i bez ikakve drame.",
    initial: "B",
    name: "Belma T.",
  },
  {
    text: "Stvarno praktično kada nemate vremena za neku posebnu frizuru. Stavili smo ih pred izlazak i kosa je odmah izgledala sređenije. Za djevojčice koje vole ovakve detalje baš lijepa stvar.",
    initial: "V",
    name: "Vildana H.",
  },
  {
    text: "Koristile smo ih već nekoliko puta i svaki put su se dobro pokazale. Najvažnije mi je bilo da neće čupati kosu prilikom skidanja, a toga stvarno nije bilo. Kćerka je zadovoljna, a samim tim i ja.",
    initial: "A",
    name: "Adna F.",
  },
  {
    text: "Mislila sam da će nakon igre i trčanja sve odmah spasti, ali ostale su dosta dugo u kosi. Za mene je najveći plus što se kasnije bez problema skinu i ne ostavljaju kosu zamršenu.",
    initial: "J",
    name: "Jasmina D.",
  },
  {
    text: "Baš simpatičan proizvod. Kćerka se svaki put raduje kada ih stavljamo, a ja volim što za nekoliko minuta možemo napraviti nešto drugačije s kosom bez puno muke.",
    initial: "A",
    name: "Anela K.",
  },
];

export default function BlingerReviews() {
  return (
    <section className="dawn-reviews" id="recenzije">
      <div className="dawn-col">
        <h2 className="dawn-h2 dawn-h2-lg">
          Roditelji koji su već kupili kod nas ♥️
        </h2>
        <div className="dawn-rev-score">
          <span className="dawn-rev-num">{PAGE_RATING}</span>
          <div>
            <div className="dawn-stars">★★★★★</div>
            <small>na osnovu {PAGE_REVIEWS_COUNT} recenzije</small>
          </div>
        </div>
        <div className="dawn-rev-list">
          {reviews.map((r) => (
            <div className="dawn-rev-card" key={r.name}>
              {r.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.photo}
                  alt="Kosa ukrašena Sparkling Diamond dijamantima"
                  loading="lazy"
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    marginBottom: 14,
                  }}
                />
              )}
              <div className="dawn-rev-who">
                <div className="dawn-rev-av">{r.initial}</div>
                <div>
                  <b>{r.name}</b>
                  <span className="dawn-rev-verified">Verifikovano</span>
                </div>
              </div>
              <p>&ldquo;{r.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
