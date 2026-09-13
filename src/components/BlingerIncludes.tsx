const items = [
  "1x Sparkling Diamond aplikator",
  "5x diskova sa dijamantima",
  "75 dijamanata u 5 boja",
  "Za djecu 3+",
];

export default function BlingerIncludes() {
  return (
    <section className="dawn-includes">
      <div className="dawn-col">
        <h2 className="dawn-h2">Šta stiže u tvojoj kutiji?</h2>
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
