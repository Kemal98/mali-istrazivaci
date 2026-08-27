import { CONTACT_EMAIL } from "@/lib/constants";

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
              Montessori setovi i edukativne igračke za djecu na bosanskom
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
