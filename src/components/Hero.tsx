import { FAMILIES_COUNT } from "@/lib/socialProof";

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-social">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 7.1-1.01L12 2z" />
          </svg>
          Izbor {FAMILIES_COUNT}+ porodica u BiH
        </div>

        <div className="hero-tag">
          <span className="tag-full">
            Jedini Montessori set na bosanskom · 3–6 godina
          </span>
          <span className="tag-short">
            Montessori set na bosanskom · 3–6 god.
          </span>
        </div>

        <h1>
          Sat mira za tebe.
          <br />
          Sat učenja za njega.
        </h1>

        <p className="hero-sub sub-full">
          Tri igre u jednoj kutiji – knjiga na čičak sa 65 kartica,
          drvena igračka po uzrastu i magnetni tangram. Bez ekrana, bez
          baterija, sve na bosanskom.
        </p>
        <p className="hero-sub sub-short">
          Tri igre u jednoj kutiji – knjiga na čičak, drvena igračka i
          tangram. Sve na bosanskom.
        </p>

        <div className="hero-trust hero-trust-tags">
          <span className="tg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 8V6a6 6 0 0112 0v2" />
              <rect x="4" y="8" width="16" height="13" rx="2" />
              <path d="M9 8v2a3 3 0 006 0V8" />
            </svg>
            Priprema za vrtić
          </span>
          <span className="tb">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 13l2-5a2 2 0 012-1h10a2 2 0 012 1l2 5" />
              <rect x="2" y="13" width="20" height="6" rx="2" />
              <circle cx="7" cy="19" r="1.5" />
              <circle cx="17" cy="19" r="1.5" />
            </svg>
            Za put i čekanje
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
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
            Č, Ć, Dž, Đ
          </span>
        </div>

        <div className="hero-media">
          <div className="hero-media-img">
            <div className="hero-badge">
              <b>29</b>KM
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/set_hero2.png"
              alt="Montessori set 3u1 na bosanskom – knjiga na čičak, drveni sat i magnetni tangram u poklon kutiji"
            />
          </div>
          <p
            style={{
              fontSize: ".78rem",
              fontWeight: 500,
              color: "var(--ink3)",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            Drvena igračka na slici je primjer – biramo je prema uzrastu
            djeteta.
          </p>
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

        <div className="hero-price">
          <span className="price-main">
            29 KM
            <span
              style={{
                fontSize: ".42em",
                fontWeight: 600,
                color: "var(--ink3)",
                marginLeft: "7px",
                whiteSpace: "nowrap",
              }}
            >
              + 10 KM dostava
            </span>
          </span>
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
    </header>
  );
}
