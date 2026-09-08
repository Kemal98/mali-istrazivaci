const items = [
  "Blinger aparat za perlice",
  "180 perlica u različitim bojama",
  "Kutija za odlaganje i poklon",
];

export default function BlingerIncludes() {
  return (
    <section className="dawn-includes">
      <div className="dawn-col">
        <h2 className="dawn-h2">U paketu dobijaš:</h2>
        <ul>
          {items.map((t) => (
            <li key={t}>
              {t} <span className="dawn-check" aria-hidden="true">✓</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
