export default function ProductSet() {
  return (
    <section id="set">
      <div className="wrap">
        <span className="kicker k-green">3 proizvoda u jednoj kutiji</span>
        <h2 className="h-sec">Šta tačno dobijaš u setu</h2>
        <p className="sub-sec">
          Tri različite igre koje se nadopunjuju – svaka razvija drugu
          vještinu i drži pažnju na svoj način.
        </p>

        <div className="set-grid">
          <div className="set-card">
            <div className="set-media">
              <span className="set-num n1">1</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/knjiga.jpg" alt="Montessori knjiga na čičak" />
            </div>
            <div className="set-body">
              <h3>Montessori igra na čičak</h3>
              <p>
                Interaktivna knjiga &ldquo;Svijet malih istraživača&rdquo; sa
                deset strana zadataka – životinje, slova, emocije, brojevi.
                Sve na bosanskom jeziku.
              </p>
              <span className="set-skill sk1">Govor i rječnik</span>
            </div>
          </div>

          <div className="set-card">
            <div className="set-media">
              <span className="set-num n2">2</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/sat.jpg" alt="Drvena Montessori igračka" />
            </div>
            <div className="set-body">
              <h3>Montessori drvena igračka</h3>
              <p>
                Kvalitetna drvena igračka koju biramo{" "}
                <strong>prema uzrastu tvog djeteta</strong> – sat sa
                brojevima, sortirka oblika ili slična razvojna igračka.
              </p>
              <span className="set-skill sk2">Fina motorika</span>
            </div>
          </div>

          <div className="set-card">
            <div className="set-media">
              <span className="set-num n3">3</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/mozgalica.jpg" alt="Drvena mozgalica Tangram" />
            </div>
            <div className="set-body">
              <h3>Drvena mozgalica</h3>
              <p>
                Magnetni Tangram sa knjižicom zadataka. Dijete slaže stotine
                oblika – mačku, kuću, brod, pticu – od sedam šarenih pločica.
              </p>
              <span className="set-skill sk3">Logika i mašta</span>
            </div>
          </div>
        </div>

        <div className="set-note">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <b>Zašto biramo igračku prema uzrastu?</b>
            <p>
              Dvogodišnjak i šestogodišnjak ne trebaju istu igračku. Zato pri
              narudžbi upišeš koliko dijete ima godina, a mi biramo drvenu
              igračku koja mu tačno odgovara – da ne bude ni prelaka ni
              preteška.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
