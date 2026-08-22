"use client";

import { useState } from "react";

export type FaqItem = { q: string; a: string };

const defaultFaqs: FaqItem[] = [
  {
    q: "Koju tačno drvenu igračku dobijam?",
    a: "Biramo je prema uzrastu tvog djeteta koji upišeš pri narudžbi. Za mlađu djecu (2–3 god.) šaljemo sortirku oblika ili slaganje, za stariju (4–6 god.) drveni sat sa brojevima ili sličnu razvojnu igračku. Uvijek je kvalitetno drvo i uvijek odgovara uzrastu.",
  },
  {
    q: "Za koji uzrast je set?",
    a: "Set je za djecu od 2 do 6 godina. Mlađa djeca uživaju u slikama, čičku i slaganju oblika, a starija rješavaju zadatke sa slovima, brojevima i mozgalicom. Set raste zajedno s djetetom.",
  },
  {
    q: "Kako funkcioniše plaćanje pouzećem?",
    a: "Ne plaćaš ništa unaprijed. Kada kurir donese paket, platiš gotovinom na kućnom pragu – i to je sve. Ne treba ti kartica ni internet plaćanje.",
  },
  {
    q: "Koliko traje dostava?",
    a: "Dostava po cijeloj BiH traje 2 do 4 radna dana. Zovemo te isti ili sljedeći dan da potvrdimo narudžbu i uzrast djeteta.",
  },
  {
    q: "Je li sve sigurno za malu djecu?",
    a: "Da. Drvo je glatko obrađeno bez oštrih ivica, boje su netoksične, a knjiga je od čvrstog materijala otpornog na kidanje. Sve je dizajnirano upravo za male ruke.",
  },
  {
    q: "Mogu li naručiti više setova?",
    a: "Naravno – napiši u polje Napomena koliko setova želiš i uzraste djece. Javimo se telefonom i dogovorimo detalje. Odličan je poklon za rođendane.",
  },
  {
    q: "Šta ako se djetetu ne svidi?",
    a: "Javi se u roku od 14 dana od preuzimanja i vraćamo ti novac – bez objašnjavanja.",
  },
  {
    q: "Koliko dugo traje knjiga? Da li se čičak istroši?",
    a: "Knjiga je za višekratnu upotrebu – čičak izresci se skidaju i ponovo lijepe stotine puta, ne gube ljepljivost preko noći.",
  },
  {
    q: "Da li mogu naručiti ako živim van većeg grada?",
    a: "Da, dostavljamo po cijeloj Bosni i Hercegovini, ne samo u veće gradove.",
  },
  {
    q: "Treba li baterije ili aplikacija?",
    a: "Ne – set je 100% bez ekrana, aplikacije i baterija. Samo igra rukama.",
  },
];

export default function Faq({ items = defaultFaqs }: { items?: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="faq-bg">
      <div className="wrap">
        <span className="kicker k-orange">Pitanja</span>
        <h2 className="h-sec">Često postavljana pitanja</h2>
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
      </div>
    </section>
  );
}
