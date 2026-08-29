import PriceBlock from "./PriceBlock";
import HeroMedia from "./HeroMedia";

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-top-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 7.1-1.01L12 2z" />
          </svg>
          <span className="badge-full">
            4.9 · 500+ porodica u BiH · Jedini Montessori set na bosanskom
          </span>
          <span className="badge-short">4.9 · 500+ porodica u BiH</span>
        </div>

        <h1>
          Sat mira za tebe.
          <br />
          Sat učenja za dijete.
        </h1>

        <p className="hero-sub sub-full">
          Tri Montessori igre u jednoj kutiji — knjiga na čičak, drvena
          igračka i mozgalica. Za uzrast 2–6 godina. Bez ekrana. Bez
          baterija. Sve na bosanskom.
        </p>
        <p className="hero-sub sub-short">
          Tri Montessori igre u jednoj kutiji. 2–6 godina, bez ekrana, sve
          na bosanskom.
        </p>

        <div className="hero-media">
          <div className="hero-media-img">
            <div className="hero-badge">
              <b>29</b>KM
            </div>
            <HeroMedia videoSrc="/video/hero.mp4" />
          </div>
        </div>

        <div className="hero-stats">
          <div className="hstat">
            <b>3</b>
            <small>igre</small>
          </div>
          <div className="hstat">
            <b>60</b>
            <small>minuta</small>
          </div>
          <div className="hstat">
            <b>0</b>
            <small>ekrana</small>
          </div>
        </div>

        <div style={{ gridArea: "pri", marginBottom: "16px" }}>
          <PriceBlock variant="full" oldPrice="" discount="" />
        </div>

        <div className="hero-cta-block">
          <a href="#naruci" className="btn btn-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            Naruči – 29 KM + dostava
          </a>
          <p className="hero-cta-note">
            Bez plaćanja unaprijed · 14 dana povrat
          </p>
          <a href="#set" className="hero-cta-link">
            Šta je u setu?
          </a>
        </div>

        <div className="hero-trust hero-trust-pay">
          <span className="tg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Plaćanje pouzećem
          </span>
          <span className="tb">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="1" y="6" width="15" height="12" rx="2" />
              <path d="M16 10h4l3 3v5h-7z" />
              <circle cx="6" cy="19" r="2" />
              <circle cx="18" cy="19" r="2" />
            </svg>
            Dostava po cijeloj BiH
          </span>
          <span className="to">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7" />
            </svg>
            Stiže u poklon kutiji
          </span>
          <span className="ty">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            14 dana povrat novca
          </span>
        </div>
      </div>
    </header>
  );
}
