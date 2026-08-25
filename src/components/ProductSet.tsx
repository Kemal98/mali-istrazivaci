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
              <img
                src="/img/knjiga_proizvod.png"
                alt="Montessori knjiga na čičak"
              />
            </div>
            <div className="set-body">
              <h3>Montessori igra na čičak</h3>
              <div className="set-spec">
                <div className="set-spec-item">
                  <b>10</b>
                  <small>strana</small>
                </div>
                <div className="set-spec-item">
                  <b>65</b>
                  <small>čičaka</small>
                </div>
                <div className="set-spec-item">
                  <b>6</b>
                  <small>tema</small>
                </div>
              </div>
              <p>
                Životinje, abeceda, emocije, vrijeme, hrana i brojevi – sve
                na bosanskom jeziku. Kartice se skidaju i lijepe iznova.
              </p>
              <span className="set-skill sk1">Govor i rječnik</span>
            </div>
          </div>

          <div className="set-card">
            <div className="set-media">
              <span className="set-num n2">2</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/igracke-izbor1.png"
                alt="Izbor drvenih Montessori igračaka – biramo jednu prema uzrastu djeteta"
              />
            </div>
            <div className="set-body">
              <h3>Montessori drvena igračka</h3>
              <div className="set-spec">
                <div className="set-spec-item">
                  <b>100%</b>
                  <small>drvo</small>
                </div>
                <div className="set-spec-item">
                  <b>3–6</b>
                  <small>godina</small>
                </div>
                <div className="set-spec-item">
                  <b>✓</b>
                  <small>po uzrastu</small>
                </div>
              </div>
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
              <img src="/img/tangaram1.png" alt="Drvena mozgalica Tangram" />
            </div>
            <div className="set-body">
              <h3>Drvena mozgalica</h3>
              <div className="set-spec">
                <div className="set-spec-item">
                  <b>7</b>
                  <small>pločica</small>
                </div>
                <div className="set-spec-item">
                  <b>100+</b>
                  <small>oblika</small>
                </div>
                <div className="set-spec-item">
                  <b>1</b>
                  <small>knjižica</small>
                </div>
              </div>
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
