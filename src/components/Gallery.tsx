const items = [
  {
    badge: "01",
    src: "/img/farma.png",
    alt: "Životinje sa farme u Montessori knjizi – magarac, ćurka, krava na čičak",
    cap: "Životinje sa farme",
    skill: "Nazivi, boje i zvukovi životinja",
    gs: "gs1",
  },
  {
    badge: "02",
    src: "/img/alphabet.png",
    alt: "Bosanska abeceda u Montessori knjizi – slova DŽ, Ć, Đ na čičak",
    cap: "Bosanska abeceda",
    skill: "Sva bosanska slova – Č, Ć, Dž, Đ, Š, Ž",
    gs: "gs2",
  },
  {
    badge: "03",
    src: "/img/emocije.png",
    alt: "Emocije u Montessori knjizi – sretan, tužan, ljut, zaljubljen na čičak",
    cap: "Emocije i osjećaji",
    skill: "Prepoznaje i imenuje kako se osjeća",
    gs: "gs3",
  },
  {
    badge: "04",
    src: "/img/vrijeme.png",
    alt: "Vrijeme i priroda u Montessori knjizi – sunce, kiša, snijeg, duga na čičak",
    cap: "Vrijeme i priroda",
    skill: "Povezivanje pojmova i logika",
    gs: "gs4",
  },
  {
    badge: "05",
    src: "/img/voce.png",
    alt: "Voće i povrće u Montessori knjizi – razvrstavanje na čičak",
    cap: "Voće i povrće",
    skill: "Razvrstavanje i kategorije",
    gs: "gs1",
  },
  {
    badge: "06",
    src: "/img/tijelo.png",
    alt: "Dijelovi tijela u Montessori knjizi – glava, oko, ruka, stopalo na čičak",
    cap: "Dijelovi tijela",
    skill: "Prepoznaje i imenuje dijelove tijela",
    gs: "gs2",
  },
];

export default function Gallery({
  subtitle = "Prave fotografije knjige iz seta. Sve na bosanskom – i dijete i roditelj razumiju svaki zadatak.",
}: {
  subtitle?: string;
}) {
  return (
    <section className="gal-bg" id="knjiga">
      <div className="wrap">
        <span className="kicker k-green">Pogledaj iznutra</span>
        <h2 className="h-sec">Svaka stranica knjige = nova vještina</h2>
        <p className="sub-sec">{subtitle}</p>
        <div className="gal-grid">
          {items.map((item) => (
            <div className="gal-item" key={item.badge}>
              <div className="stitch">
                <span className="tab-badge">{item.badge}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.alt} />
              </div>
              <div className="gal-cap">{item.cap}</div>
              <p className={`gal-skill ${item.gs}`}>{item.skill}</p>
            </div>
          ))}
        </div>
        <div className="gal-feature">
          <div className="gal-feature-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/spelovanje.png"
              alt="Dijete slaže prve riječi slova na čičak"
            />
          </div>
          <div className="gal-feature-body">
            <span className="gal-feature-badge">
              Za stariju djecu · 4–6 godina
            </span>
            <h3>Spelovanje riječi</h3>
            <p>
              Najnapredniji zadatak u knjizi – dijete slaže cijelu riječ,
              slovo po slovo. Isti set koji dvogodišnjak koristi za
              životinje, šestogodišnjak koristi za prve riječi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
