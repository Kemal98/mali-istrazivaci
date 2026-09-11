const lines = ["Ne plaćaš dok paket ne stigne", "Dostava 2–4 dana", "Cijena dostave 10 KM"];

export default function RattleTrust() {
  return (
    <section className="dawn-trust">
      <div className="dawn-col">
        <h2 className="dawn-h2 dawn-h2-sm">Kupovina bez rizika (plaća se pouzećem)</h2>
        <ul className="dawn-trust-list-sm">
          {lines.map((t) => (
            <li key={t}>
              {t} <span className="dawn-check" aria-hidden="true">✓</span>
            </li>
          ))}
        </ul>
        <div className="dawn-guarantee-badge">
          🛡️ 14 dana garancije za povrat — bez pitanja
        </div>
      </div>
    </section>
  );
}
