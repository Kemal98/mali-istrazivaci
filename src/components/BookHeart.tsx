const bullets = [
  "Deset strana zadataka u jednoj knjizi.",
  "Čičak drži čvrsto — ne otpada kao naljepnice.",
  "Ne troši se — lijepi i skida stotine puta.",
  "Dijete se vraća istim stranama iznova.",
];

export default function BookHeart() {
  return (
    <section className="dawn-heart">
      <div className="dawn-col">
        <p className="dawn-heart-tag">♥️ Sve na bosanskom jeziku ♥️</p>
        <p className="dawn-heart-lead">
          Knjiga koja zaokupi dijete dok ti završiš svoje.
        </p>
        <ul className="dawn-heart-list">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="dawn-heart-usecase">
          Idealno kad ti treba 20 minuta mira — kuhaš, radiš, piješ kafu.
        </p>
      </div>
    </section>
  );
}
