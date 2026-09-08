const items = ["3 rotirajuća spinera (leptir, bubamara, pčela)", "Torbica za nošenje", "Spremno za igru"];

export default function RattleIncludes() {
  return (
    <section className="dawn-includes">
      <div className="dawn-col">
        <h2 className="dawn-h2">U paketu dobijaš:</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/rotirajuce-zvecke/u-paketu.webp"
          alt="Zvečke u torbici za nošenje i pričvršćene na auto-sjedalicu"
          loading="lazy"
          style={{ borderRadius: 4, marginBottom: 20 }}
        />
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
