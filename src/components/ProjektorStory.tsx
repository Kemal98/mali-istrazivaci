// Originalne rečenice, oslonjene na iste stvarne činjenice sa referentne
// stranice (projektor u obliku žirafe baca sliku na tablu, dijete precrtava;
// perivi markeri; tabla se briše; uči boje i oblike; 3+). Bez tuđih slika
// i bez doslovno prepisanog marketing teksta — isti princip kao ostale
// podstranice na sajtu. Slike ćemo dodati kad stignu prave fotografije.
const POINTS = [
  {
    naslov: "Projektor pokaže, dijete precrta.",
    tekst:
      "Žirafa-projektor baca sličicu na tablu — dijete samo prati linije i crtež je gotov. Uspije iz prve, pa želi još jedan.",
  },
  {
    naslov: "Crtanje koje ih ne umori.",
    tekst:
      "Dok ti spremaš ručak ili radiš svoje, dijete mirno sjedi i crta sliku po sliku.",
  },
  {
    naslov: "Uči boje, oblike i obrasce kroz igru.",
    tekst:
      "Bira marker, prepoznaje oblik, prati liniju — fina motorika i pažnja rastu bez da to i primijeti.",
  },
  {
    naslov: "Bez nereda po zidovima.",
    tekst:
      "Markeri su perivi — silaze s ruku i odjeće. Tabla se obriše i crta se iznova.",
  },
  {
    naslov: "Sve u jednoj kutiji.",
    tekst:
      "Projektor, tabla sa stalkom i 12 markera — spremno za igru čim otvoriš pakovanje. Za uzrast 3+.",
  },
];

export default function ProjektorStory() {
  return (
    <section className="dawn-story">
      <div className="dawn-col">
        {POINTS.map((p) => (
          <div className="dawn-story-block" key={p.naslov}>
            <p className="dawn-story-stmt">
              <span>{p.naslov}</span>
            </p>
            <p className="dawn-story-text">
              <span>{p.tekst}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
