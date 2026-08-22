export default function BookHero() {
  return (
    <header className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-head">
          <div className="hero-tag">Montessori knjiga · Uzrast 2–6 godina</div>
          <h1>
            Interaktivna Montessori knjiga
            <span className="sub">
              Deset strana zadataka na čičak – uči kroz igru, bez ekrana.
            </span>
          </h1>
        </div>
        <div className="hero-media">
          <div className="hero-badge">
            <b>15</b>KM
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/knjiga.jpg"
            alt="Interaktivna Montessori knjiga – Svijet malih istraživača"
          />
        </div>
        <div className="hero-body">
          <div className="hero-stats">
            <div className="hstat">
              <b>10</b>
              <small>strana</small>
            </div>
            <div className="hstat">
              <b>BiH</b>
              <small>jezik</small>
            </div>
            <div className="hstat">
              <b>0</b>
              <small>ekrana</small>
            </div>
          </div>
          <p className="hero-sub">
            Knjiga &ldquo;Svijet malih istraživača&rdquo; sa dijelovima na
            čičak – dijete uči <strong>samostalno</strong>, kroz dodir i
            igru.
          </p>
          <div className="hero-price">
            <span className="price-main">15 KM</span>
          </div>
          <p
            style={{
              fontSize: ".8rem",
              fontWeight: 600,
              color: "var(--ink3)",
              marginTop: "-14px",
              marginBottom: "18px",
            }}
          >
            + 10 KM dostava, plaća se kuriru
          </p>
          <div className="hero-actions">
            <a href="#naruci" className="btn btn-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Naruči – 15 KM
            </a>
          </div>
          <div className="hero-trust">
            <span className="tg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Plaćanje pouzećem
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
              Dostava po BiH
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
