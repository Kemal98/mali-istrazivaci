import {
  CONTACT_EMAIL,
  SOCIAL_FACEBOOK,
  SOCIAL_INSTAGRAM,
} from "@/lib/constants";

const DEFAULT_PAGE_LINKS = [
  { href: "#set", label: "Šta dobijaš" },
  { href: "#knjiga", label: "Iz knjige" },
  { href: "#kako-radi", label: "Kako radi" },
  { href: "#recenzije", label: "Recenzije" },
  { href: "#naruci", label: "Naruči" },
];

export default function Footer({
  pageLinks = DEFAULT_PAGE_LINKS,
}: {
  pageLinks?: { href: string; label: string }[];
}) {
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
              Montessori setovi i edukativne igračke za djecu na našem
              jeziku. Svaki paket ručno pakujemo u BiH.
            </p>
          </div>
          <div className="foot-col">
            <h4>Kontakt</h4>
            <ul>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16v16H4z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>{" "}
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>{" "}
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>{" "}
                  Facebook
                </a>
              </li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Stranica</h4>
            <ul>
              {pageLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
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
