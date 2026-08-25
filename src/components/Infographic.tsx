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
          <video
            src="/video/video_lop.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-label="SAT MIRA set – sve što dobijaš, raspakovano"
          />
        </div>
      </div>
    </section>
  );
}
