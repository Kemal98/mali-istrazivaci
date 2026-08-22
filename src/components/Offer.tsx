import { STOCK_LEFT } from "@/lib/socialProof";

export default function Offer() {
  return (
    <section className="offer-bg" id="ponuda">
      <div className="wrap">
        <span className="kicker" style={{ color: "#7BB8FF" }}>
          Akcijska cijena
        </span>
        <h2 className="h-sec">Sve tri igre za 29 KM</h2>
        <div className="offer-card">
          <div className="offer-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/kutija.jpg" alt="SAT MIRA poklon kutija" />
          </div>
          <div className="offer-info">
            <h3>SAT MIRA – set 3u1</h3>
            <p className="osub">Montessori set za djecu 2–6 godina</p>
            <div className="offer-price">
              <span className="pm">29 KM</span>
              <span className="po">45 KM</span>
              <span className="ps">–36%</span>
            </div>
            <div className="stock-alert">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Ostalo još samo {STOCK_LEFT} kompleta na zalihi
            </div>
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
                Knjiga na čičak + drvena igračka + mozgalica
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
                Igračka birana prema uzrastu djeteta
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
                Stiže u poklon kutiji – spremno za darivanje
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
              Naruči set – 29 KM
            </a>
            <p className="offer-note">
              <strong>Akcija vrijedi do isteka zalihe.</strong> Trebaš više
              setova? Napiši u napomeni.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
