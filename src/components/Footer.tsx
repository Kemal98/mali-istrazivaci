export default function Footer() {
  return (
    <footer id="kontakt">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="foot-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo.png" alt="Mali Istraživači" />
              Mali Istraživači
            </div>
            <p>
              Montessori setovi i edukativne igračke za djecu na bosanskom
              jeziku. Svaki paket ručno pakujemo u BiH.
            </p>
          </div>
          <div className="foot-col">
            <h4>Kontakt</h4>
            <ul>
              <li>
                <a href="tel:+38760000000">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>{" "}
                  06X XXX XXX
                </a>
              </li>
              <li>
                <a href="mailto:info@maliistrazivaci.ba">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16v16H4z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>{" "}
                  info@maliistrazivaci.ba
                </a>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Stranica</h4>
            <ul>
              <li>
                <a href="#set">Šta dobijaš</a>
              </li>
              <li>
                <a href="#knjiga">Iz knjige</a>
              </li>
              <li>
                <a href="#recenzije">Recenzije</a>
              </li>
              <li>
                <a href="#naruci">Naruči</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          © 2026 Mali Istraživači · Učenje kroz igru
        </div>
      </div>
    </footer>
  );
}
