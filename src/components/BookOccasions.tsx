const OCCASIONS = [
  { emoji: "🚗", tekst: "Duga vožnja ili put do mora" },
  { emoji: "🏥", tekst: "Čekaonica kod doktora ili frizera" },
  { emoji: "🌧️", tekst: "Kišni dan kod kuće" },
  { emoji: "🍳", tekst: "Dok spremaš ručak ili radiš" },
];

export default function BookOccasions() {
  return (
    <section className="dawn-occasions">
      <div className="dawn-col">
        <h2 className="dawn-h2">Kad ti dobro dođe</h2>
        <div className="dawn-occasions-grid">
          {OCCASIONS.map((o) => (
            <div className="dawn-occasion" key={o.tekst}>
              <span aria-hidden="true">{o.emoji}</span>
              {o.tekst}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
