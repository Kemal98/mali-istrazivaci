import CtaButton from "./CtaButton";
import BonusDeadline from "./BonusDeadline";

export default function Final() {
  return (
    <section className="final-bg">
      <div className="wrap">
        <h2>Pokloni djetetu sat mira – i sebi.</h2>
        <p>
          29 KM + 10 KM dostava. Tri igre u poklon kutiji, plaćanje
          pouzećem, dostava po cijeloj BiH.
        </p>
        <p className="final-bonus">
          🎁 PDF vodič &ldquo;30 igara sa setom&rdquo; uz narudžbe do
          nedjelje, <BonusDeadline />
        </p>
        <CtaButton text="Naruči set – 29 KM + dostava" />
        <div className="final-strip">
          <div className="stitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/knjiga_proizvod2.png" alt="Knjiga" />
          </div>
          <div className="stitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/igracke-izbor.png" alt="Drvena igračka" />
          </div>
          <div className="stitch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/tanagram.png" alt="Mozgalica" />
          </div>
        </div>
      </div>
    </section>
  );
}
