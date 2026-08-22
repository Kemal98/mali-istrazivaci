export default function BookAbout() {
  return (
    <section id="set">
      <div className="wrap">
        <span className="kicker k-green">Šta tačno dobijaš</span>
        <h2 className="h-sec">Jedna knjiga, deset vještina</h2>
        <p className="sub-sec">
          Interaktivna knjiga &ldquo;Svijet malih istraživača&rdquo; sa
          dijelovima na čičak – svaka stranica uči nešto novo.
        </p>

        <div className="set-grid">
          <div className="set-card">
            <div className="set-body">
              <h3>Životinje, slova i brojevi</h3>
              <p>
                Deset strana zadataka: životinje sa farme, bosanska abeceda,
                emocije, vrijeme i priroda, voće i povrće, brojevi i boje.
              </p>
              <span className="set-skill sk1">Govor i rječnik</span>
            </div>
          </div>

          <div className="set-card">
            <div className="set-body">
              <h3>Dijelovi na čičak</h3>
              <p>
                Dijete lijepi i skida dijelove samostalno – razvija finu
                motoriku dok se igra, bez pomoći odraslih.
              </p>
              <span className="set-skill sk2">Fina motorika</span>
            </div>
          </div>

          <div className="set-card">
            <div className="set-body">
              <h3>Sve na bosanskom jeziku</h3>
              <p>
                Svaki zadatak je jasan i djetetu i roditelju – nema
                prevođenja ni nagađanja.
              </p>
              <span className="set-skill sk3">Logika i mašta</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
