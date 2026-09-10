const items = [
  "Projektor za crtanje (u obliku žirafe)",
  "Tabla za crtanje sa stalkom",
  "12 perivih markera u boji",
  "Spužvica / brisač za tablu",
];

export default function ProjektorIncludes() {
  return (
    <section className="dawn-includes">
      <div className="dawn-col">
        <h2 className="dawn-h2">U paketu dobijaš:</h2>
        <ul>
          {items.map((t) => (
            <li key={t}>
              {t}{" "}
              <span className="dawn-check" aria-hidden="true">
                ✓
              </span>
            </li>
          ))}
        </ul>
        <p className="dawn-includes-note">
          Uredna kutija — lijep poklon za rođendan ili za polazak u vrtić.
        </p>
      </div>
    </section>
  );
}
