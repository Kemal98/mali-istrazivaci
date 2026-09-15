import { Fragment, ReactNode } from "react";

// Siguran "rich text": NIKAD ne koristi dangerouslySetInnerHTML, pa iz
// admin teksta ne može doći XSS. Podržava:
//   **bold**, *italic*, novi red (Enter), bullet liste (red počinje s "- ")
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Razdvoji po **bold** i *italic*
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(<strong key={`${keyPrefix}-b${i}`}>{tok.slice(2, -2)}</strong>);
    } else {
      out.push(<em key={`${keyPrefix}-i${i}`}>{tok.slice(1, -1)}</em>);
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
