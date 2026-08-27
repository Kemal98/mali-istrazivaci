"use client";

import { useState } from "react";
import CtaButton from "./CtaButton";

export type FaqItem = { q: string; a: string };

const defaultFaqs: FaqItem[] = [
  {
    q: "Šta ako se djetetu ne svidi?",
    a: "Javi se u roku od 14 dana od preuzimanja i vraćamo novac. Bez objašnjavanja i bez pitanja. Trošak povrata snosimo mi.",
  },
  {
    q: "Šta tačno plaćam i kada?",
    a: "Set je 29 KM, dostava 10 KM — ukupno 39 KM. Ne plaćaš ništa unaprijed. Platiš kuriru gotovinom kad ti donese paket na vrata.",
  },
  {
    q: "Zaigra li se dijete duže od dva dana?",
    a: "Zato su tri igre, ne jedna. Kad se zasiti čička, prelazi na tangram. Kad riješi tangram, uzima drvenu igračku. Roditelji nam javljaju da se set koristi mjesecima — jer se kartice svaki put slažu drugačije. A ako se kod tvog djeteta ipak ne desi, imaš 14 dana povrat.",
  },
  {
    q: "Koju tačno drvenu igračku dobijam?",
    a: "Biramo je prema uzrastu koji upišeš. Za 2–3 godine šaljemo sortirku oblika ili slaganje. Za 4–6 godina drveni sat sa brojevima ili sličnu razvojnu igračku. Javljamo se na Viber prije slanja da potvrdimo — ako želiš nešto konkretno, reci nam tada.",
  },
  {
    q: "Kako znam da je ovo prava firma?",
    a: "Mi smo [NAZIV FIRME] iz [GRAD]. Piši nam na Viber na [TELEFON] prije narudžbe ako želiš — odgovaramo 9–20h. I plaćaš tek kad kurir donese paket, tako da ne rizikuješ ništa.",
  },
  {
    q: "Je li sve sigurno za malu djecu?",
    a: "Drvo je brušeno, bez oštrih ivica, boje su netoksične. Tangram pločice su oko 5 cm — prevelike za gutanje. Za djecu mlađu od 3 godine preporučujemo igru uz nadzor, kao i kod svake igračke sa dijelovima.",
  },
  {
    q: "Za koji uzrast je set?",
    a: "Za djecu 2–6 godina. Mlađa uživaju u slikama, čičku i slaganju oblika; starija rješavaju zadatke sa slovima, brojevima i mozgalicom. Isti set raste s djetetom.",
  },
  {
    q: "Koliko traje dostava?",
    a: "Dostava po cijeloj BiH traje 2 do 4 radna dana. Javljamo se na Viber isti ili sljedeći dan da potvrdimo narudžbu i uzrast djeteta.",
  },
  {
    q: "Šta ako paket stigne oštećen?",
    a: "Ne preuzimaj ga i ne plaćaj. Javi nam se — šaljemo novi o našem trošku.",
  },
  {
    q: "Mogu li naručiti dva ili više setova?",
    a: "Da — dva seta su 49 KM, ušteda 9 KM u odnosu na dva pojedinačna seta. Označi opciju u formi ili napiši u napomenu koliko setova i uzraste djece. Odličan je poklon za rođendane.",
  },
  {
    q: "Koliko dugo traje čičak?",
    a: "Knjiga je za višekratnu upotrebu – čičak izresci se skidaju i ponovo lijepe stotine puta, ne gube ljepljivost preko noći.",
  },
  {
    q: "Dostavljate li i van većih gradova?",
    a: "Da, dostavljamo po cijeloj Bosni i Hercegovini, ne samo u veće gradove.",
  },
];

export default function Faq({
  items = defaultFaqs,
  title = "Često postavljana pitanja",
  ctaText,
  defaultOpenIndex = null,
  schemaMarkup = false,
}: {
  items?: FaqItem[];
  title?: string;
  ctaText?: string;
  defaultOpenIndex?: number | null;
  schemaMarkup?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    defaultOpenIndex
  );

  const schema = schemaMarkup
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      }
    : null;

  return (
    <section className="faq-bg">
      <div className="wrap">
        <span className="kicker k-orange">Pitanja</span>
        <h2 className="h-sec">{title}</h2>
        <div className="faq-list">
          {items.map((item, i) => {
            const open = openIndex === i;
            return (
              <div className={`faq-item${open ? " open" : ""}`} key={item.q}>
                <button
                  className="faq-q"
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  {item.q} <span className="plus">+</span>
                </button>
                <div className="faq-a">
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
        {ctaText && <CtaButton text={ctaText} />}
      </div>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </section>
  );
}
