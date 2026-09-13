import { FAMILIES_COUNT } from "@/lib/socialProof";

// Ocjena hardkodirana na 4.8 samo za ovu stranicu (isto kao heroj i
// recenzije), ne sitewide RATING (4.9) iz socialProof.ts.
const PAGE_RATING = 4.8;

// Struktura/redoslijed prati tačno referentnu stranicu (screenshotovi
// koje je vlasnik poslao), prevedeno na bosansku ijekavicu — na izričit
// i ponovljen zahtjev ovaj put, za razliku od ranijeg pristupa na sajtu
// (vidi napomenu u odgovoru poslije ovog fajla o dvije namjerno
// izostavljene tvrdnje: "HIT među djevojčicama širom svijeta" i "bez
// ekrana" — nisu prevedene/dodane).
export default function BlingerStory() {
  return (
    <section className="dawn-story dawn-story-tight-top">
      <div className="dawn-col">
        {/* Sekcija 1 — social proof, stvaran broj (500+), ne tuđih 4500 */}
        <div className="dawn-story-block">
          <p className="dawn-story-proof-count">
            Preko {FAMILIES_COUNT}+ zadovoljnih roditelja
          </p>
          <p className="dawn-story-proof-stars" style={{ marginBottom: 18 }}>
            ⭐️⭐️⭐️⭐️⭐️ (prosječna ocjena {PAGE_RATING}/5)
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/blinger/giphy-3.gif"
            alt="Djeca koriste Sparkling Diamond aparat na kosi"
            loading="lazy"
            style={{ borderRadius: 20 }}
          />
        </div>

        {/* Sekcija 2 */}
        <div className="dawn-story-block">
          <p className="dawn-story-stmt">
            <span>
              Savršena igračka
              <br />
              koju djeca ne ispuštaju iz ruku.
            </span>
          </p>
          <p className="dawn-story-text">
            <span>
              <strong>
                Perlice se pričvrste za sekundu.
                <br />
                Bez ljepila. Bez makaza. Bez nereda.
                <br />
                Perlice se lijepe za svaku površinu.
              </strong>
            </span>
          </p>
        </div>

        {/* Sekcija 3 — slika već ima "STVORENO ZA MALE PRINCEZE!" u sebi */}
        <div className="dawn-story-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/blinger/stvoreno_za_male_princeze.png"
            alt="Dvije djevojčice koriste Sparkling Diamond i ukrašavaju kosu"
            loading="lazy"
            style={{ borderRadius: 20 }}
          />
        </div>

        {/* Sekcija 4 */}
        <div className="dawn-story-block">
          <p className="dawn-story-stmt">
            <span>
              Igra roditelja i kćerke sa ovim
              <br />
              aparatom je prezanimljiva!
            </span>
          </p>
          <p className="dawn-story-text">
            <span>Sati kreativne igre. Savršeno za rođendane i igru kod kuće.</span>
          </p>
        </div>

        {/* Sekcija 5 — slika već ima "VIŠE NAČINA ZA KORIŠTENJE!" u sebi */}
        <div className="dawn-story-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/blinger/vise-nacina-koristenja.png"
            alt="Dijamanti zalijepljeni na patiku, više načina korištenja"
            loading="lazy"
            style={{ borderRadius: 20 }}
          />
          <p className="dawn-story-text">
            <span>
              Ukrašavanje kose, noktiju, patika, narukvica,
              <br />
              <br />i svega što vam padne na pamet!
            </span>
          </p>
        </div>

        {/* Sekcija 6 */}
        <div className="dawn-story-block">
          <p className="dawn-story-stmt">
            <span>
              Igračka koja konačno
              <br />
              neće skupljati prašinu na polici!
            </span>
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/blinger/giphy-2.gif"
            alt="Sparkling Diamond aparat u upotrebi"
            loading="lazy"
            style={{ borderRadius: 20 }}
          />
        </div>

        {/* Sekcija 7 — zadnji novi blok, poslije ovoga ide postojeće
            "Šta stiže u tvojoj kutiji?" netaknuto */}
        <div className="dawn-story-block">
          <p className="dawn-story-text">
            <span>
              <strong>
                Diskovi se lako mijenjaju
                <br />
                za novu kombinaciju boja!
              </strong>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
