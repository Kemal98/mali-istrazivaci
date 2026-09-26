import type { Block, BlockType, Hero } from "./types";

// Šabloni proizvod-stranica po vrsti proizvoda (Product Page Playbook,
// septembar 2026) + "Popuni stranicu": tekst koji vrati Claude u fiksnom
// formatu se rasporedi u blokove po njihovoj `uloga`.
//
// Bez alias importa i bez runtime ovisnosti — koristi ga i admin (browser) i
// skripta za upis šablona u bazu (scripts/seed-sabloni.mts).

type Uloga =
  | "ishod"
  | "problem"
  | "zasto_ne"
  | "koraci"
  | "koristi"
  | "sigurnost"
  | "raste"
  | "u_kutiji";

interface SablonBlok {
  type: BlockType;
  uloga?: Uloga;
  uputa: string;
  data: Record<string, unknown>;
}

export interface SablonDef {
  kljuc: "bebe" | "igracka" | "impulsni" | "problem";
  naziv: string;
  galerijaUputa: string;
  blokovi: SablonBlok[];
}

const prazniKoristi = (n: number) =>
  Array.from({ length: n }, () => ({ url: "", alt: "", naslov: "", tekst: "" }));

const RECENZIJE: SablonBlok = {
  type: "recenzije",
  uputa:
    "Recenzije se dodaju u tabu Recenzije. Samo stvarne — dok ih nema, sakrij ovaj blok (oko).",
  data: {
    naslov: "Roditelji koji su već kupili kod nas ♥️",
    prikaziOcjenu: true,
    ratingVrijednost: "",
    ratingBrojOcjena: "",
  },
};

const ZAVRSNI_CTA: SablonBlok = {
  type: "cta",
  uputa: "Završno dugme — kupac koji je sve pročitao naručuje bez vraćanja na vrh.",
  data: { naslov: "Poruči ODMAH", opis: "Plaćaš tek kad paket stigne.", ctaTekst: "PORUČI SADA" },
};

const U_KUTIJI: SablonBlok = {
  type: "u_kutiji",
  uloga: "u_kutiji",
  uputa:
    "Tačno šta dobija (komadi, dijelovi). U napomenu: šta NIJE uključeno (npr. baterije) i upozorenja (sitni dijelovi, magneti).",
  data: { naslov: "Šta stiže u tvojoj kutiji?", items: ["", ""], napomena: "" },
};

export const SABLONI: SablonDef[] = [
  {
    kljuc: "bebe",
    naziv: "Za bebe (sigurnost, materijal, pranje)",
    galerijaUputa:
      "Hero galerija 6–8 slika: 1) beba/roditelj koristi proizvod (sigurna pozicija), 2) GIF kako radi, 3) u ruci — vidi se veličina, 4) detalj materijala, 5) šta je u paketu. Bez slika s kineskim tekstom.",
    blokovi: [
      {
        type: "naslov_tekst",
        uloga: "problem",
        uputa:
          "Problem roditelja: 2–3 rečenice konkretne situacije iz života + 1 rečenica kako proizvod to mijenja. Bez zastrašivanja i medicinskih tvrdnji.",
        data: { naslov: "", tekst: "", bold: true, align: "center" },
      },
      {
        type: "gif",
        uputa: "GIF ili slika: proizvod u upotrebi s bebom (sigurna pozicija).",
        data: { url: "", alt: "", radius: true, fullWidth: false, caption: "" },
      },
      {
        type: "koraci",
        uloga: "koraci",
        uputa: "Kako se koristi i čisti — 3 kratka koraka.",
        data: { naslov: "Kako se koristi", items: ["", "", ""] },
      },
      {
        type: "koristi",
        uloga: "koristi",
        uputa:
          "3–5 koristi. Svaka: kratak ishod + detalj s mjerom/materijalom/brojem. Jedna neka bude o sigurnosti.",
        data: { naslov: "", items: prazniKoristi(4) },
      },
      {
        type: "benefiti",
        uloga: "sigurnost",
        uputa:
          "Sigurnost i materijali kao činjenice: materijal, bez BPA (samo ako je tačno), uzrast, pranje/čišćenje.",
        data: { naslov: "Sigurnost i materijali", items: ["", "", ""] },
      },
      U_KUTIJI,
      RECENZIJE,
      ZAVRSNI_CTA,
    ],
  },
  {
    kljuc: "igracka",
    naziv: "Dječija igračka (uzrast, kako se igra, poklon)",
    galerijaUputa:
      "Hero galerija 6–8 slika: 1) dijete se igra, 2) GIF igre, 3) dijete drži proizvod — vidi se veličina, 4) detalj, 5) šta je u kutiji. Uzrast napiši u naslov.",
    blokovi: [
      {
        type: "tekst",
        uloga: "ishod",
        uputa: "Kako se igra u JEDNOJ rečenici — ista poruka kao u oglasu.",
        data: { tekst: "", bold: true, align: "center" },
      },
      {
        type: "gif",
        uputa: "GIF: dijete se igra, vidi se kako radi (3–5 sekundi).",
        data: { url: "", alt: "", radius: true, fullWidth: false, caption: "" },
      },
      {
        type: "koraci",
        uloga: "koraci",
        uputa: "Kako se igra — 3 koraka.",
        data: { naslov: "Kako se igra", items: ["", "", ""] },
      },
      {
        type: "koristi",
        uloga: "koristi",
        uputa:
          "3–5 koristi, pomiješaj: šta dobija dijete (zabava, vještina) i šta dobija roditelj (mir, bez ekrana, bez nereda).",
        data: { naslov: "", items: prazniKoristi(4) },
      },
      {
        type: "benefiti",
        uloga: "raste",
        uputa: "Raste s djetetom: šta radi u kojem uzrastu (npr. „3 god: …“, „5 god: …“).",
        data: { naslov: "Raste s djetetom", items: ["", "", ""] },
      },
      U_KUTIJI,
      RECENZIJE,
      ZAVRSNI_CTA,
    ],
  },
  {
    kljuc: "impulsni",
    naziv: "Impulsni proizvod (15–30 KM, kratka stranica)",
    galerijaUputa:
      "Hero galerija 5–6 slika: 1) proizvod u upotrebi, 2) GIF demonstracija, 3) u ruci — veličina, 4) šta je u paketu. Odluka se donosi u sekundama.",
    blokovi: [
      {
        type: "tekst",
        uloga: "ishod",
        uputa: "Glavni ishod u JEDNOJ rečenici — ista poruka kao u oglasu.",
        data: { tekst: "", bold: true, align: "center" },
      },
      {
        type: "gif",
        uputa: "Jedan GIF: proizvod radi (3–5 sekundi).",
        data: { url: "", alt: "", radius: true, fullWidth: false, caption: "" },
      },
      {
        type: "koristi",
        uloga: "koristi",
        uputa: "Tačno 3 koristi, kratko, svaka s konkretnim detaljem.",
        data: { naslov: "", items: prazniKoristi(3) },
      },
      U_KUTIJI,
      RECENZIJE,
      ZAVRSNI_CTA,
    ],
  },
  {
    kljuc: "problem",
    naziv: "Rješava konkretan problem (prije/poslije)",
    galerijaUputa:
      "Hero galerija 6–8 slika: 1) rezultat, 2) prije/poslije, 3) GIF kako radi, 4) u ruci — veličina, 5) šta je u paketu.",
    blokovi: [
      {
        type: "naslov_tekst",
        uloga: "problem",
        uputa:
          "Problem odmah: konkretna scena koju kupac prepoznaje (2–3 rečenice) + kako proizvod to mijenja.",
        data: { naslov: "", tekst: "", bold: true, align: "center" },
      },
      {
        type: "slika",
        uputa: "Slika prije/poslije ili rezultat.",
        data: { url: "", alt: "", radius: true, fullWidth: false, caption: "" },
      },
      {
        type: "naslov_tekst",
        uloga: "zasto_ne",
        uputa:
          "Zašto obična rješenja ne rade (šta je kupac već probao) i šta je ovdje drugačije. Kratko, tačne tvrdnje.",
        data: { naslov: "", tekst: "", bold: true, align: "center" },
      },
      {
        type: "koraci",
        uloga: "koraci",
        uputa: "Kako radi — 3 koraka.",
        data: { naslov: "Kako radi", items: ["", "", ""] },
      },
      {
        type: "koristi",
        uloga: "koristi",
        uputa: "3–5 koristi, svaka s mjerom/materijalom/brojem.",
        data: { naslov: "", items: prazniKoristi(4) },
      },
      U_KUTIJI,
      RECENZIJE,
      ZAVRSNI_CTA,
    ],
  },
];

export function sablonHero(naziv: string): Hero {
  return {
    slika: "",
    galerija: [],
    naslovLinija1: "",
    naslovLinija2: "",
    prikaziCijenu: true,
    prikaziBadge: true,
    prikaziRating: false,
    ratingTekst: "",
    ratingVrijednost: "",
    ratingBrojOcjena: "",
    ctaTekst: "PORUČI SADA",
    prikaziCtaPodtekst: false,
    ctaPodtekst: "",
    alt: naziv,
    prikaziPovjerenje: true,
  };
}

export function sablonSekcije(def: SablonDef): Block[] {
  return def.blokovi.map((b, i) => ({
    id: `blk_tpl_${def.kljuc}_${i}`,
    type: b.type,
    hidden: false,
    data: JSON.parse(JSON.stringify(b.data)),
    uputa: b.uputa,
    ...(b.uloga ? { uloga: b.uloga } : {}),
  }));
}

/* ------------------------------ prompt za Claude ------------------------------ */

const ULOGA_FORMAT: Record<Uloga, string> = {
  ishod: "ISHOD: jedna rečenica s glavnim ishodom (šta kupac dobija), do 15 riječi",
  problem:
    "PROBLEM_NASLOV: kratak naslov problema, do 8 riječi\nPROBLEM: 2–3 rečenice konkretne scene iz života roditelja + 1 rečenica kako proizvod to mijenja",
  zasto_ne:
    "ZASTO_NASLOV: kratak naslov, npr. „Zašto makaze nisu rješenje“\nZASTO: 2–3 rečenice zašto uobičajeno rješenje ne radi i šta je ovdje drugačije",
  koraci: "KORAK: jedan korak korištenja, jedna kratka rečenica (napiši tačno 3 reda KORAK)",
  koristi:
    "KORIST: kratak naslov ishoda | 1–2 rečenice s konkretnim detaljem (mjera, materijal, broj) (napiši 3–5 redova KORIST)",
  sigurnost:
    "SIGURNOST: jedna činjenica o sigurnosti/materijalu/pranju/uzrastu (3–4 reda; samo ono što piše u izvoru)",
  raste: "RASTE: uzrast: šta dijete radi s proizvodom u tom uzrastu (3 reda)",
  u_kutiji:
    "U_KUTIJI: jedna stavka iz paketa, npr. „1x olovka“ (jedan red po stavci)\nNAPOMENA: šta NIJE uključeno i upozorenja (ako ima), jedna rečenica",
};

export function napraviPrompt(sections: Block[]): string {
  const uloge = [...new Set(sections.map((s) => s.uloga).filter(Boolean))] as Uloga[];
  const imaFaq = sections.some((s) => s.type === "faq");
  const linije = [
    "NASLOV: šta je proizvod + za koga (+ uzrast ako je bitan), do 60 znakova",
    "PODNASLOV: (opcionalno) kratko pojašnjenje, do 40 znakova",
    ...uloge.map((u) => ULOGA_FORMAT[u]).filter(Boolean),
    ...(imaFaq
      ? [
          "PITANJE: pitanje koje kupac stvarno postavlja (uzrast, sigurnost, kako se koristi/čisti) (4–6 pitanja)\nODGOVOR: odgovor na prethodno pitanje, 1–2 rečenice",
        ]
      : []),
  ];
  return `Pišeš tekst za prodajnu stranicu proizvoda u online shopu za roditelje u Bosni i Hercegovini (Mali Istraživači). Kupci dolaze s Facebook/Instagram oglasa, na mobitelu, plaćaju pouzećem.

Proizvod (link ili opis): [OVDJE ZALIJEPI LINK ILI OPIS PROIZVODA]

Pravila:
- Piši na bosanskom jeziku, ijekavica, jednostavno i toplo, kao roditelj roditelju.
- Konkretno: mjere, materijali, brojevi. Bez praznih pridjeva („vrhunski“, „revolucionarni“, „najbolji“).
- Test: ako bi rečenica mogla stajati na tuđem proizvodu, prepiši je.
- Ništa ne izmišljaj. Ako podatak (materijal, certifikat, uzrast) nije u izvoru, izostavi ga.
- Bez medicinskih tvrdnji, bez zastrašivanja, bez lažne hitnosti.
- Ne spominji cijenu, dostavu ni povrat — to stranica već prikazuje.

Vrati SAMO redove u ovom formatu, bez ikakvog drugog teksta, bez markdowna, svaki red počinje ključem velikim slovima i dvotačkom:

${linije.join("\n")}`;
}

/* ------------------------------ popuni stranicu ------------------------------ */

export interface PopuniRezultat {
  hero: Hero;
  sections: Block[];
  popunjeno: string[];
  nedostaje: string[];
}

function parsiraj(text: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  let zadnji: { key: string; idx: number } | null = null;
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.replace(/^[\s*\-•>#]+/, "").replace(/\*\*/g, "").trimEnd();
    const m = line.match(/^([A-ZŠĐČĆŽ_]{3,20})\s*:\s*(.*)$/);
    if (m) {
      const key = m[1];
      const arr = out.get(key) ?? [];
      arr.push(m[2].trim());
      out.set(key, arr);
      zadnji = { key, idx: arr.length - 1 };
    } else if (zadnji && line.trim()) {
      const arr = out.get(zadnji.key)!;
      arr[zadnji.idx] = `${arr[zadnji.idx]}\n${line.trim()}`.trim();
    }
  }
  return out;
}

export function popuniStranicu(text: string, hero: Hero, sections: Block[]): PopuniRezultat {
  const v = parsiraj(text);
  const jedan = (k: string) => (v.get(k)?.[0] ?? "").trim();
  const svi = (k: string) => (v.get(k) ?? []).map((x) => x.trim()).filter(Boolean);
  const popunjeno: string[] = [];
  const nedostaje: string[] = [];

  const noviHero = { ...hero };
  if (jedan("NASLOV")) {
    noviHero.naslovLinija1 = jedan("NASLOV");
    popunjeno.push("naslov");
  } else nedostaje.push("naslov");
  if (jedan("PODNASLOV")) noviHero.naslovLinija2 = jedan("PODNASLOV");

  const noveSekcije = sections.map((b) => {
    const d = { ...b.data };
    const oznaci = (ok: boolean, ime: string) => (ok ? popunjeno : nedostaje).push(ime);
    switch (b.uloga) {
      case "ishod":
        if (jedan("ISHOD")) d.tekst = jedan("ISHOD");
        oznaci(Boolean(jedan("ISHOD")), "rečenica ishoda");
        break;
      case "problem":
        if (jedan("PROBLEM_NASLOV")) d.naslov = jedan("PROBLEM_NASLOV");
        if (jedan("PROBLEM")) d.tekst = jedan("PROBLEM");
        oznaci(Boolean(jedan("PROBLEM")), "problem");
        break;
      case "zasto_ne":
        if (jedan("ZASTO_NASLOV")) d.naslov = jedan("ZASTO_NASLOV");
        if (jedan("ZASTO")) d.tekst = jedan("ZASTO");
        oznaci(Boolean(jedan("ZASTO")), "zašto obična rješenja ne rade");
        break;
      case "koraci":
        if (svi("KORAK").length) d.items = svi("KORAK");
        oznaci(svi("KORAK").length > 0, "koraci");
        break;
      case "sigurnost":
        if (svi("SIGURNOST").length) d.items = svi("SIGURNOST");
        oznaci(svi("SIGURNOST").length > 0, "sigurnost i materijali");
        break;
      case "raste":
        if (svi("RASTE").length) d.items = svi("RASTE");
        oznaci(svi("RASTE").length > 0, "raste s djetetom");
        break;
      case "u_kutiji":
        if (svi("U_KUTIJI").length) d.items = svi("U_KUTIJI");
        if (jedan("NAPOMENA")) d.napomena = jedan("NAPOMENA");
        oznaci(svi("U_KUTIJI").length > 0, "šta je u kutiji");
        break;
      case "koristi": {
        const stare = (Array.isArray(d.items) ? d.items : []) as Record<string, string>[];
        const nove = svi("KORIST").map((line, i) => {
          const [naslov, ...ostalo] = line.split("|");
          return {
            url: stare[i]?.url ?? "",
            alt: stare[i]?.alt ?? "",
            naslov: naslov.trim(),
            tekst: ostalo.join("|").trim(),
          };
        });
        if (nove.length) d.items = nove;
        oznaci(nove.length > 0, "koristi");
        break;
      }
    }
    if (b.type === "faq") {
      const p = svi("PITANJE");
      const o = v.get("ODGOVOR") ?? [];
      if (p.length) {
        d.items = p.map((pitanje, i) => ({ pitanje, odgovor: (o[i] ?? "").trim() }));
        popunjeno.push("česta pitanja");
      }
    }
    return { ...b, data: d };
  });

  return { hero: noviHero, sections: noveSekcije, popunjeno, nedostaje };
}
