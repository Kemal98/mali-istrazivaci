export default function Pain() {
  return (
    <section className="pain-bg" id="zasto">
      <div className="wrap">
        <span className="kicker k-orange">Poznato ti ovo?</span>
        <h2 className="h-sec">
          Tablet umiri dijete na 10 minuta.
          <br />
          Ovaj set – na cijeli sat.
        </h2>
        <p className="sub-sec">
          Ne treba ti savršena rutina ni beskrajno strpljenje. Treba ti nešto
          što dijete <em>samo</em> želi da radi – i što ga usput nečemu
          nauči.
        </p>
        <div className="pain-grid">
          <div className="pain-card bad">
            <h3>
              <span style={{ fontSize: "1.35rem" }}>🚩</span> Bez seta
            </h3>
            <ul>
              <li>Dijete traži telefon čim se dosadi</li>
              <li>Igračka se zapostavi za tri dana</li>
              <li>Put autom ili čekaonica = stres</li>
              <li>Nemaš ni 20 minuta za sebe</li>
              <li>Osjećaj krivice zbog ekrana</li>
            </ul>
          </div>
          <div className="pain-card good">
            <h3>
              <span style={{ fontSize: "1.35rem" }}>😌</span> Sa SAT MIRA
              setom
            </h3>
            <ul>
              <li>Tri različite igre – nema dosade</li>
              <li>Dijete se igra samostalno, bez tebe</li>
              <li>Uči slova, brojeve, oblike i vrijeme</li>
              <li>Stane u torbu – savršeno za put</li>
              <li>Ti imaš sat mira. Bez krivice.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
