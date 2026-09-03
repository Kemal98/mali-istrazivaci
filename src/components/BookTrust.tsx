// Napomena: referentni brief je tražio "14 dana garancija" ovdje, ali tu
// uslugu ne nudimo (izričito uklonjeno ranije u ovoj sesiji). Zamijenjeno
// stvarnom prednošću pouzeća — ne plaćaš dok paket ne stigne.
const lines = [
  "Ne plaćaš dok paket ne stigne",
  "Dostava 2–4 dana",
  "Cijena dostave 10 KM",
];

export default function BookTrust() {
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
