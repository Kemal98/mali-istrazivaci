export default function HowItWorks() {
  return (
    <section className="how-bg" id="kako-radi">
      <div className="wrap">
        <span className="kicker k-orange">Zalijepi, skini, ponovi</span>
        <h2 className="h-sec">Ne troši se kao obične naljepnice</h2>
        <p className="sub-sec">
          Čičak izresci se skidaju i lijepe stotine puta – ista knjiga se
          koristi iznova, svaki dan drugačije.
        </p>
        <div className="how-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/tutorijal.png"
            alt="Montessori knjiga na čičak – naljepnice se lijepe i skidaju, koraci 1 do 4"
            loading="lazy"
          />
        </div>
        <div className="how-trust">
          <span className="tg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Bez ljepila i makaza
          </span>
          <span className="tb">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Nema jednokratnih naljepnica
          </span>
          <span className="to">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Spremno za igru za 30 sekundi
          </span>
        </div>
        <div className="how-cta">
          <a href="#naruci" className="btn btn-ghost">
            Naruči set – 29 KM + dostava
          </a>
        </div>
      </div>
    </section>
  );
}
