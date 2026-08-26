import type { CSSProperties } from "react";

export default function CtaButton({
  text,
  href = "#naruci",
  note = "Bez plaćanja unaprijed · 14 dana povrat",
  style,
}: {
  text: string;
  href?: string;
  note?: string | null;
  style?: CSSProperties;
}) {
  return (
    <div className="cta-block">
      <a href={href} className="btn btn-primary" style={style}>
        {text}
      </a>
      {note && <p className="cta-note">{note}</p>}
    </div>
  );
}
