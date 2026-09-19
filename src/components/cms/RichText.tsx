import { Fragment, ReactNode } from "react";

// Siguran "rich text": NIKAD ne koristi dangerouslySetInnerHTML, pa iz
// admin teksta ne može doći XSS. Podržava:
//   **bold**, *italic*, ++veće++, --manje--,
//   novi red (Enter), bullet liste (red počinje s "- ")
// ++/-- pišu RichTextArea dugmad "A+"/"A−" (selektuj riječi, klikni
// dugme) — admin ne mora sam kucati sintaksu, ali i dalje radi ako je
// neko ukuca ručno.
// REKURZIVNO: kad se kombinuje bold + veličina na istom tekstu (npr.
// selektuješ pa klikneš B, pa selektuješ opet i klikneš A+), markeri se
// ugnijezde — "++**tekst**++". Prvi prolaz mora i UNUTRAŠNJI marker
// prepoznati, ne samo spoljni, inače se npr. bold "pojede" kao doslovan
// tekst unutar uvećanog raspona. Svaki rekurzivni poziv radi na STROGO
// kraćem tekstu (markeri su odsječeni), pa se sigurno završi.
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\+\+[^+]+\+\+|--[^-]+--)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const inner = inline(tok.slice(2, -2), `${keyPrefix}-n${i}`);
    if (tok.startsWith("**")) {
      out.push(<strong key={`${keyPrefix}-b${i}`}>{inner}</strong>);
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
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function RichText({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");

  const nodes: ReactNode[] = [];
  let bullets: string[] = [];

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

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (/^[-•]\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[-•]\s+/, ""));
      return;
    }
    flushBullets(`f${idx}`);
    if (trimmed === "") {
      nodes.push(<br key={`br${idx}`} />);
      return;
    }
    nodes.push(
      <Fragment key={`l${idx}`}>
        {inline(line, `l${idx}`)}
        {idx < lines.length - 1 ? <br /> : null}
      </Fragment>
    );
  });
  flushBullets("end");

  return <>{nodes}</>;
}
