import { FAMILIES_COUNT } from "@/lib/socialProof";

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-head">
          <div className="hero-social">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 7.1-1.01L12 2z" />
            </svg>
            Izbor {FAMILIES_COUNT}+ porodica u BiH
          </div>
          <div className="hero-tag">
            Jedini Montessori set na bosanskom jeziku · 2–6 godina
          </div>
          <h1>
            SAT MIRA
            <span className="sub">
              3 igre koje zaokupe dijete – bez ijednog ekrana.
            </span>
          </h1>
        </div>
        <div className="hero-media">
          <div className="hero-badge">
            <b>29</b>KM
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/set_hero.jpg"
            alt="SAT MIRA Montessori set 3u1 – knjiga, drvena igračka i mozgalica"
          />
        </div>
        <div className="hero-body">
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
          <p className="hero-sub">
            Tri igre u jednoj <strong>poklon kutiji</strong> – dok se dijete
            igra i uči, ti napokon popiješ kafu na miru.
          </p>
          <div className="hero-price">
            <span className="price-main">29 KM</span>
            <span className="price-old">58 KM</span>
            <span className="price-save">UŠTEDA 29 KM</span>
          </div>
          <div className="hero-actions">
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
              Naruči set odmah
            </a>
            <a href="#set" className="btn btn-ghost">
              Šta je u setu?
            </a>
          </div>
          <div className="hero-trust">
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
              Dostava 2–4 dana
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
          </div>
        </div>
      </div>
    </header>
  );
}
