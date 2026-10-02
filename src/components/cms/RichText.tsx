import { Fragment, ReactNode } from "react";

// Siguran "rich text": NIKAD ne koristi dangerouslySetInnerHTML, pa iz
// admin teksta ne može doći XSS. Podržava:
//   **bold**, __italic__, ++veće++, --manje--,
//   novi red (Enter), bullet liste (red počinje s "- ")
// Legacy *italic* (jedna zvjezdica) se i dalje ČITA — stariji sadržaj je
// tako pisan — ali RichTextArea dugmad sad PIŠU __italic__, jer se jedna
// zvjezdica sudara sa **bold** kad se oboje kombinuje na istom tekstu
// (bold+italic bi dalo "***tekst***", što se ne da nedvosmisleno
// rastaviti nazad na dva odvojena markera).
//
// REKURZIVNO: kad se kombinuje više formata na istom tekstu, markeri se
// ugnijezde — "++**tekst**++". Prvi prolaz mora i UNUTRAŠNJI marker
// prepoznati, ne samo spoljni, inače se npr. bold "pojede" kao doslovan
// tekst unutar uvećanog raspona. Svaki rekurzivni poziv radi na STROGO
// kraćem tekstu (markeri su odsječeni), pa se sigurno završi.
//
// VIŠE REDOVA UNUTAR MARKERA: regex ([^*]+ i sl.) odavno radi preko
// granice reda (ne staje na \n), ali RichText je ranije SAM sjekao tekst
// na pojedinačne redove PRIJE poziva inline() — pa marker koji počne u
// jednom a završi u sljedećem redu nikad nije stizao do regexa kao
// cjelina, samo se vidio kao doslovan "**"/"++" tekst. Zato se sad
// inline() zove na CIJELOM pasusu odjednom (vidi flushParagraph), a
// pretvaranje preostalih \n u <br> radi se OVDJE, kroz pushText — i na
// tekstu IZMEĐU markera i na tekstu UNUTAR markera (rekurzija), pa
// "++**prvi red\ndrugi red**++" ispravno postane uvećan+podebljan tekst
// na dva reda, ne dva odvojena parčeta od kojih je jedno slovno smeće.
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|\+\+[^+]+\+\+|--[^-]+--)/g;

  function pushText(chunk: string, kp: string) {
    const parts = chunk.split("\n");
    parts.forEach((part, idx) => {
      if (part) out.push(part);
      if (idx < parts.length - 1) out.push(<br key={`${kp}-br${idx}`} />);
    });
  }

  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) pushText(text.slice(last, m.index), `${keyPrefix}-t${i}`);
    const tok = m[0];
    // Marker je 1 znak (legacy *italic*) ili 2 (sve ostalo) — odsijeci
    // tačno onoliko sa svake strane koliko je tok širok njegov marker.
    const markLen = tok.startsWith("**") || !tok.startsWith("*") ? 2 : 1;
    const inner = inline(tok.slice(markLen, -markLen), `${keyPrefix}-n${i}`);
    if (tok.startsWith("**")) {
      out.push(<strong key={`${keyPrefix}-b${i}`}>{inner}</strong>);
    } else if (tok.startsWith("__")) {
      out.push(<em key={`${keyPrefix}-i${i}`}>{inner}</em>);
    } else if (tok.startsWith("++")) {
      out.push(
        <span key={`${keyPrefix}-g${i}`} style={{ fontSize: "1.25em" }}>
          {inner}
        </span>
      );
    } else if (tok.startsWith("--")) {
      out.push(
        <span key={`${keyPrefix}-s${i}`} style={{ fontSize: "0.82em" }}>
          {inner}
        </span>
      );
    } else {
      out.push(<em key={`${keyPrefix}-i${i}`}>{inner}</em>);
    }
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) pushText(text.slice(last), `${keyPrefix}-tail`);
  return out;
}

export default function RichText({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");

  const nodes: ReactNode[] = [];
  let bullets: string[] = [];
  // Uzastopni ne-bullet redovi se skupe pa zajedno (kao JEDAN pasus)
  // prosljeđuju u inline() — to je ono što markeru dozvoljava da
  // pređe granicu reda.
  let paragraph: string[] = [];

  const flushBullets = (key: string) => {
    if (!bullets.length) return;
    nodes.push(
      <ul className="cms-bullets" key={`ul-${key}`}>
        {bullets.map((b, i) => (
          <li key={i}>{inline(b, `${key}-${i}`)}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  const flushParagraph = (key: string) => {
    if (!paragraph.length) return;
    nodes.push(
      <Fragment key={`p-${key}`}>{inline(paragraph.join("\n"), `p${key}`)}</Fragment>
    );
    paragraph = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (/^[-•]\s+/.test(trimmed)) {
      flushParagraph(`f${idx}`);
      bullets.push(trimmed.replace(/^[-•]\s+/, ""));
      return;
    }
    flushBullets(`f${idx}`);
    // Prazan red se dodaje U tekući pasus (postaje \n -> <br> kroz
    // pushText) umjesto da bude zaseban čvor — tako prazan red UNUTAR
    // markera (rijetko, ali moguće) ne prekine formatiranje na pola.
    paragraph.push(line);
  });
  flushBullets("end");
  flushParagraph("end");

  return <>{nodes}</>;
}
