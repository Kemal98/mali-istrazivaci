export default function BookOffer() {
  return (
    <section className="offer-bg" id="ponuda">
      <div className="wrap">
        <span className="kicker" style={{ color: "#7BB8FF" }}>
          Cijena
        </span>
        <h2 className="h-sec">Interaktivna knjiga za 15 KM</h2>
        <div className="offer-card">
          <div className="offer-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/knjiga.jpg"
              alt="Interaktivna Montessori knjiga"
            />
          </div>
          <div className="offer-info">
            <h3>Svijet malih istraživača</h3>
            <p className="osub">Interaktivna Montessori knjiga 2–6 godina</p>
            <div className="offer-price">
              <span className="pm">15 KM</span>
            </div>
            <p
              style={{
                fontSize: ".8rem",
                fontWeight: 600,
                color: "rgba(255,255,255,.55)",
                marginTop: "-10px",
                marginBottom: "16px",
              }}
            >
              + 10 KM dostava, plaća se kuriru
            </p>
            <ul className="offer-points">
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Deset strana zadataka na čičak
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Čvrst materijal, otporan na kidanje
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Plaćanje pouzećem – platiš kad preuzmeš
              </li>
            </ul>
            <a href="#naruci" className="btn btn-primary" style={{ width: "100%" }}>
              Naruči knjigu – 15 KM
            </a>
            <p className="offer-note">
              Dostava po cijeloj BiH. Trebaš više komada? Napiši u napomeni.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
