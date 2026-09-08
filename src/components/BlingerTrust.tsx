// Namjerno bez "X dana garancija" linije — nema uspostavljene politike
// povrata za ovaj (novi) proizvod, pa se ne izmišlja (ista logika kao
// BookTrust.tsx za knjigu).
const lines = ["Ne plaćaš dok paket ne stigne", "Dostava 2–4 dana", "Cijena dostave 10 KM"];

export default function BlingerTrust() {
  return (
    <section className="dawn-trust">
      <div className="dawn-col">
        <h2 className="dawn-h2">Kupovina bez rizika (plaća se pouzećem)</h2>
        <ul>
          {lines.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
