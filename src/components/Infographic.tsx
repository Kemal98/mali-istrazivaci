export default function Infographic() {
  return (
    <section className="info-bg">
      <div className="wrap">
        <span className="kicker k-blue">Sve na jednom mjestu</span>
        <h2 className="h-sec">Cijeli set, jedna kutija</h2>
        <p className="sub-sec">
          Stiže spakovano i spremno za poklon – ne treba ti ništa dodatno.
        </p>
        <div className="info-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/set_full.jpg" alt="SAT MIRA set – sve što dobijaš" />
        </div>
      </div>
    </section>
  );
}
