const blocks = [
  {
    src: "/img/farma.png",
    alt: "Životinje sa farme u Montessori knjizi – magarac, ćurka, krava na čičak",
    statement: "Dijete uči imena i zvukove životinja.\nBez tableta, bez baterija.",
    text:
      "Magarac, ćurka, krava — sve su tu.\nZalijepi životinju na pravo mjesto na farmi.\nKad pogriješi, skine i pokuša ponovo.\nUči kroz igru, ne kroz ispravljanje.",
  },
  {
    src: "/img/alphabet.png",
    alt: "Bosanska abeceda u Montessori knjizi – slova DŽ, Ć, Đ na čičak",
    statement: "Sva slova našeg jezika.\nČak i Č, Ć, Dž, Đ, Š, Ž.",
    text:
      "Slaže bosansku abecedu, slovo po slovo.\nIsta slova koja uči u vrtiću i školi.\nČičak drži čvrsto — ne otpada kao naljepnice.\nJedna knjiga prati ga od 2. do 6. godine.",
  },
  {
    src: "/img/emocije.png",
    alt: "Emocije u Montessori knjizi – sretan, tužan, ljut, zaljubljen na čičak",
    statement: "Prepoznaje kako se osjeća.\nI kaže to naglas.",
    text:
      "Sretan, tužan, ljut, iznenađen.\nDijete pokaže na lice koje opisuje njegov dan.\nLakše govori o osjećajima kad ih prvo pokaže.",
  },
  {
    src: "/img/spelovanje.png",
    alt: "Dijete slaže prve riječi slova na čičak",
    statement: "Za stariju djecu — prve riječi.\nSlovo po slovo, sam.",
    text:
      "Isti set koji dvogodišnjak koristi za životinje,\nšestogodišnjak koristi za slaganje riječi.\nKnjiga raste s djetetom, ne baca se za godinu dana.",
  },
  {
    src: "/img/tutorijal.png",
    alt: "Montessori knjiga na čičak – naljepnice se lijepe i skidaju, koraci 1 do 4",
    statement: "Ljepi se i skida stotine puta.\nIsta knjiga, svaki dan drugačija igra.",
    text:
      "Nema ljepila, nema makaza, nema jednokratnih naljepnica.\nČičak izresci izdrže godine igranja.\nSpremno za igru za 30 sekundi.",
  },
];

export default function BookStory() {
  return (
    <section className="dawn-story">
      <div className="dawn-col">
        {blocks.map((b) => (
          <div className="dawn-story-block" key={b.src}>
            <p className="dawn-story-stmt">
              {b.statement.split("\n").map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.src} alt={b.alt} loading="lazy" />
            <p className="dawn-story-text">
              {b.text.split("\n").map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
