const items = [
  "Deset strana zadataka na čičak",
  "Sva slova bosanskog jezika — Č Ć Dž Đ Š Ž",
  "PDF vodič „30 igara” — šaljemo na Viber odmah",
  "Bez ekrana, bez baterija",
];

export default function BookIncludes() {
  return (
    <section className="dawn-includes">
      <div className="dawn-col">
        <h2 className="dawn-h2">U paketu dobijaš:</h2>
        <ul>
          {items.map((t) => (
            <li key={t}>
              {t} <span className="dawn-check">✓</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
