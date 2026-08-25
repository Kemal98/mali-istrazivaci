export default function Final() {
  return (
    <section className="final-bg">
      <div className="wrap">
        <h2>Pokloni djetetu sat mira – i sebi.</h2>
        <p>
          29 KM umjesto 58 KM. Tri igre u poklon kutiji, plaćanje pouzećem,
          dostava po cijeloj BiH.
        </p>
        <a href="#naruci" className="btn btn-primary">
          Naruči set – 29 KM
        </a>
        <div className="final-strip">
          <div className="stitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/knjiga_proizvod.png" alt="Knjiga" />
          </div>
          <div className="stitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/igracke-izbor1.png" alt="Drvena igračka" />
          </div>
          <div className="stitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/tangaram1.png" alt="Mozgalica" />
          </div>
        </div>
      </div>
    </section>
  );
}
