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
            <img src="/img/knjiga.jpg" alt="Knjiga" />
          </div>
          <div className="stitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/sat.jpg" alt="Drvena igračka" />
          </div>
          <div className="stitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/mozgalica.jpg" alt="Mozgalica" />
          </div>
        </div>
      </div>
    </section>
  );
}
