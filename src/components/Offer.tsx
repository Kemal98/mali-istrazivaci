import CtaButton from "./CtaButton";
import ValueStack from "./ValueStack";
import { SEASONAL_MESSAGE } from "@/lib/constants";

const valueStackItems = [
  { label: "Knjiga na čičak (65 kartica)", price: "15 KM" },
  { label: "Drvena igračka po uzrastu", price: "20 KM" },
  { label: "Magnetni tangram + knjižica", price: "16 KM" },
  { label: "Poklon kutija", price: "5 KM" },
];
const valueStackTotal = valueStackItems.reduce(
  (sum, item) => sum + parseInt(item.price, 10),
  0
);

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
            {/* TODO: zamijeniti fotografijom OTVORENE kutije sa svim
                sadržajem raspoređenim — konvertuje bolje od zatvorene kutije */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/set_hero2.png"
              alt="SAT MIRA Montessori set 3u1 – knjiga na čičak, drveni sat i magnetni tangram u poklon kutiji"
            />
          </div>
          <div className="offer-info">
            <h3>SAT MIRA – set 3u1</h3>
            <p className="osub">Montessori set za djecu 2–6 godina</p>

            <ValueStack
              items={valueStackItems}
              total={`${valueStackTotal} KM`}
              yourPrice="29 KM"
              delivery="10 KM"
            />
            <p className="offer-seasonal">{SEASONAL_MESSAGE}</p>

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
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                14 dana garancija povrata novca
              </li>
            </ul>

            <CtaButton
              text="Naruči – 29 KM + dostava"
              style={{ width: "100%" }}
            />
            <p className="offer-note">
              Trebaš dva seta? <strong>49 KM za dva</strong> (ušteda 9 KM) –
              označi u formi ili napiši u napomeni.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
