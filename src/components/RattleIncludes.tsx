const items = ["3 rotirajuća spinera (leptir, bubamara, pčela)", "Torbica za nošenje", "Spremno za igru"];

export default function RattleIncludes() {
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
        <p className="dawn-includes-note">
          Dolazi u urednoj torbici — lijep poklon za bebu i tek rođene.
        </p>
      </div>
    </section>
  );
}
