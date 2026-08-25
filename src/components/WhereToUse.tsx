const items = [
  {
    src: "/img/gdje-kuca.webp",
    alt: "Dijete se igra sa SAT MIRA setom kod kuće",
    title: "Kod kuće",
    text: "Dok ti kuhaš ili radiš – dijete ima svoj zadatak.",
  },
  {
    src: "/img/gdje-auto.webp",
    alt: "Dijete se igra sa SAT MIRA setom u autu",
    title: "U autu i autobusu",
    text: 'Vožnja do mora bez "jesmo li stigli".',
  },
  {
    src: "/img/gdje-kafic.webp",
    alt: "Dijete se igra sa SAT MIRA setom u kafiću",
    title: "U kafiću i čekaonici",
    text: "Umjesto telefona na stolu.",
  },
  {
    src: "/img/gdje-baka.webp",
    alt: "Dijete se igra sa SAT MIRA setom kod bake",
    title: "Kod bake i u vrtiću",
    text: "Lako se nosi, ništa se ne gubi.",
  },
];

export default function WhereToUse() {
  return (
    <section id="gdje">
      <div className="wrap">
        <span className="kicker k-blue">Stane u torbu</span>
        <h2 className="h-sec">Sve što treba je ravna površina</h2>
        <div className="gdje-grid">
          {items.map((item) => (
            <div className="gdje-card" key={item.title}>
              <div className="gdje-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.alt} />
              </div>
              <div className="gdje-card-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="gdje-note">
          Kutija je 25×20 cm i stane u svaku torbu. Bez baterija, bez
          punjenja, bez interneta.
        </p>
      </div>
    </section>
  );
}
