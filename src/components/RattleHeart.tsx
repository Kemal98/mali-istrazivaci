// Isti vizuelni obrazac (srce + bold + lista) kao BookHeart.tsx na
// /edukativna-knjiga — namjerno ponovo iskorišten stil (podebljano,
// srca, kratka lista, rečenica na kraju) da izgleda kao referentna
// stranica, ali svaka rečenica je vlastita formulacija, ne prepisana.
const bullets = [
  "Vakuum osnova se čvrsto lijepi za glatke površine.",
  "Ne padaju i ne klize dok se beba igra.",
  "Beba ih okreće iznova. Jednostavan pokret, dug interes.",
];

export default function RattleHeart() {
  return (
    <section className="dawn-heart">
      <div className="dawn-col">
        <p className="dawn-heart-tag">♥️ 3 komada u jednom setu ♥️</p>
        <p className="dawn-heart-lead">
          Igračka koja zaokupi bebu dok ti završiš svoje.
        </p>
        <ul className="dawn-heart-list">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="dawn-heart-usecase">
          Razvija finu motoriku i koordinaciju pokreta, kroz igru.
        </p>
      </div>
    </section>
  );
}
