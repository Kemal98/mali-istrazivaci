export default function BookHero() {
  return (
    <header className="hero" id="top">
      <div className="wrap book-hero-grid">
        <div className="hero-head">
          <div className="hero-tag">65 kartica · 8 tema · Uzrast 2–6</div>
          <h1>Sjedne sam na pola sata — i usput nauči nove riječi.</h1>
        </div>
        <div className="hero-media">
          <div className="hero-badge">
            <b>15</b>KM
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/knjiga_proizvod2.png"
            alt="Interaktivna Montessori knjiga – Svijet malih istraživača"
          />
        </div>
        <div className="hero-body">
          <div className="hero-stats">
            <div className="hstat">
              <b>65</b>
              <small>kartica</small>
            </div>
            <div className="hstat">
              <b>8</b>
              <small>tema</small>
            </div>
            <div className="hstat">
              <b>0</b>
              <small>ekrana</small>
            </div>
          </div>
          <p className="hero-sub">
            Zadaci su takvi da mu ne moraš objašnjavati. Vidi sam kad je
            tačno — pa ne zove tebe.
          </p>
          <div className="hero-price">
            <span className="price-main">15 KM</span>
          </div>
          <p className="hero-delivery-note">
            + 10 KM dostava, plaća se kuriru
          </p>
          <ul className="hero-checklist">
            <li>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Kartice se skidaju i lijepe stotinama puta
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
              Sva naša slova — Č, Ć, Dž, Đ, Š, Ž
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
              Uz knjigu dobijaš PDF vodič &bdquo;30 igara&rdquo; — šaljemo
              na Viber odmah
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
              Bez ekrana i baterija — stane u torbu
            </li>
          </ul>
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
              NARUČI — PLATIŠ KURIRU
            </a>
          </div>
          <p className="hero-note">
            Ne plaćaš ništa unaprijed · Dostava po cijeloj BiH
          </p>
        </div>
      </div>
    </header>
  );
}
