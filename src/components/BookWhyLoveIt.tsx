const REASONS = [
  "Sama otkriva gdje šta ide, bez da joj stalno objašnjavaš",
  "Ista stranica se igra iznova, svaki put drugačije",
  "Čičak je prijatan na dodir, ne oštre ivice papirnih naljepnica",
  "Nosi se u torbi, radi bez interneta, bez baterija",
  "Raste s djetetom, od životinja i boja do prvih riječi",
  "Osjećaj uspjeha na svakoj strani, kad se čičak zalijepi na pravo mjesto",
];

export default function BookWhyLoveIt() {
  return (
    <section className="dawn-why">
      <div className="dawn-col">
        <h2 className="dawn-h2">Zašto djeca vole ovu knjigu</h2>
        <ul>
          {REASONS.map((r) => (
            <li key={r}>
              <span className="dawn-check" aria-hidden="true">
                ✓
              </span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
