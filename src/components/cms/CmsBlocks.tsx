import BookOrderTrigger from "@/components/BookOrderTrigger";
import RichText from "./RichText";
import type { Block, Review } from "@/lib/cms/types";
import { recenzije as recenzijeLabel } from "@/lib/cms/plural";

// Svi renderi blokova. Namjerno koriste POSTOJEĆE .dawn-* klase iz
// globals.css, pa svaki novi proizvod automatski izgleda kao ostatak
// shopa (isti font, širine, radiusi, CTA stil, spacing, brand boje).
//
// VAŽNO za izgled: postojeće stranice grupišu "priču" u JEDNU
// <section class="dawn-story"> sa više .dawn-story-block djece. Od toga
// zavise dvije stvari u globals.css:
//   1) razmak između blokova (.dawn-story-block{margin-bottom:52px}),
//   2) desktop raspored slika-lijevo / slika-desno
//      (.dawn-story-block:nth-child(even) img{grid-column:2}).
// Zato CMS ne renderuje sekciju po bloku, nego grupiše uzastopne
// "story" blokove u jednu sekciju — tako CMS stranica izgleda isto kao
// ručno napisane stranice.

const H_SIZE: Record<string, string> = {
  S: "1.05rem",
  M: "1.2rem",
  L: "1.45rem",
  XL: "1.9rem",
};

const SPACER: Record<string, number> = { S: 14, M: 32, L: 64 };

type D = Record<string, unknown>;

function imgRadius(radius: boolean): React.CSSProperties {
  return { borderRadius: radius ? 20 : 0 };
}

/** Bijela ili tamna slova, zavisno od svjetline pozadine — čita se uvijek. */
function contrastColor(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#fff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const bl = parseInt(h.slice(4, 6), 16);
  if ([r, g, bl].some(Number.isNaN)) return "#fff";
  const luminance = (0.299 * r + 0.587 * g + 0.114 * bl) / 255;
  return luminance > 0.6 ? "#14161a" : "#fff";
}

/** Stil za "bedž" — kratak istaknuti tekst na obojenoj pozadini. */
function highlightStyle(bg: string): React.CSSProperties | undefined {
  if (!bg) return undefined;
  return {
    display: "inline-block",
    background: bg,
    color: contrastColor(bg),
    padding: "0.3em 0.85em",
    borderRadius: 999,
  };
}

/** Blokovi koji žive unutar zajedničke .dawn-story sekcije. */
function isStoryBlock(b: Block): boolean {
  if (b.type === "slika_tekst") {
    const layout = String((b.data as D).layout ?? "img-top");
    // side-by-side raspored ima svoj flex wrapper, pa ne smije ući u
    // desktop grid od .dawn-story-block — renderuje se kao svoja sekcija
    return layout === "img-top" || layout === "text-top";
  }
  return (
    b.type === "naslov" ||
    b.type === "tekst" ||
    b.type === "naslov_tekst" ||
    b.type === "slika" ||
    b.type === "gif" ||
    b.type === "video" ||
    b.type === "social_proof"
  );
}

/* --------------------------- story blokovi --------------------------- */

function StoryInner({ block }: { block: Block }) {
  const d = block.data as D;
  const s = (k: string, fb = "") =>
    d[k] === undefined || d[k] === null ? fb : String(d[k]);
  const bo = (k: string, fb = false) => (d[k] === undefined ? fb : Boolean(d[k]));

  switch (block.type) {
    case "naslov":
      return (
        <p
          className="dawn-story-stmt"
          style={{
            fontSize: H_SIZE[s("velicina", "L")] ?? H_SIZE.L,
            fontWeight: bo("bold", true) ? 800 : 600,
            textAlign: (s("align", "center") || "center") as "center",
          }}
        >
          <span style={highlightStyle(s("istaknutoBoja"))}>
            <RichText text={s("tekst")} />
          </span>
        </p>
      );

    case "tekst": {
      const velicina = s("velicina");
      return (
        <p
          className="dawn-story-text"
          style={{
            textAlign: (s("align", "center") || "center") as "center",
            ...(velicina && H_SIZE[velicina] ? { fontSize: H_SIZE[velicina] } : {}),
          }}
        >
          <span style={highlightStyle(s("istaknutoBoja"))}>
            {bo("bold") ? (
              <strong>
                <RichText text={s("tekst")} />
              </strong>
            ) : (
              <RichText text={s("tekst")} />
            )}
          </span>
        </p>
      );
    }

    case "naslov_tekst":
      return (
        <>
          <p
            className="dawn-story-stmt"
            style={{ textAlign: (s("align", "center") || "center") as "center" }}
          >
            <span style={highlightStyle(s("istaknutoBoja"))}>
              <RichText text={s("naslov")} />
            </span>
          </p>
          <p
            className="dawn-story-text"
            style={{ textAlign: (s("align", "center") || "center") as "center" }}
          >
            <span>
              {bo("bold", true) ? (
                <strong>
                  <RichText text={s("tekst")} />
                </strong>
              ) : (
                <RichText text={s("tekst")} />
              )}
            </span>
          </p>
        </>
      );

    case "slika":
    case "gif": {
      const url = s("url");
      if (!url) return null;
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={s("alt")}
            loading="lazy"
            decoding="async"
            style={imgRadius(bo("radius", true))}
          />
          {s("caption") ? (
            <p className="dawn-story-text">
              <span>{s("caption")}</span>
            </p>
          ) : null}
        </>
      );
    }

    case "video": {
      const url = s("url");
      if (!url) return null;
      return (
        <video
          src={url}
          controls={bo("controls", true)}
          autoPlay={bo("autoplay")}
          muted={bo("muted", true)}
          loop={bo("loop")}
          playsInline
          preload="metadata"
          style={{
            width: "100%",
            borderRadius: 20,
            display: "block",
            background: "#000",
            marginBottom: 18,
          }}
        />
      );
    }

    case "slika_tekst": {
      const layout = s("layout", "img-top");
      const media = s("url") ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={s("url")}
          alt={s("alt")}
          loading="lazy"
          decoding="async"
          style={imgRadius(bo("radius", true))}
        />
      ) : null;
      const copy = s("tekst") ? (
        <p className="dawn-story-text">
          <span>
            <RichText text={s("tekst")} />
          </span>
        </p>
      ) : null;
      return (
        <>
          {s("naslov") ? (
            <p className="dawn-story-stmt">
              <span>
                <RichText text={s("naslov")} />
              </span>
            </p>
          ) : null}
          {layout === "text-top" ? (
            <>
              {copy}
              {media}
            </>
          ) : (
            <>
              {media}
              {copy}
            </>
          )}
        </>
      );
    }

    case "social_proof":
      return (
        <>
          {s("linija1") ? (
            <p className="dawn-story-proof-count">{s("linija1")}</p>
          ) : null}
          {s("zvjezdice") || s("linija2") ? (
            <p className="dawn-story-proof-stars" style={{ marginBottom: 18 }}>
              {s("zvjezdice")}
              {s("linija2") ? ` (${s("linija2")})` : ""}
            </p>
          ) : null}
        </>
      );

    default:
      return null;
  }
}

/* --------------------------- samostalne sekcije --------------------------- */

function SoloBlock({ block, reviews }: { block: Block; reviews: Review[] }) {
  const d = block.data as D;
  const s = (k: string, fb = "") =>
    d[k] === undefined || d[k] === null ? fb : String(d[k]);
  const bo = (k: string, fb = false) => (d[k] === undefined ? fb : Boolean(d[k]));
  const items = (): string[] => (Array.isArray(d.items) ? (d.items as string[]) : []);

  switch (block.type) {
    case "slika_tekst": {
      // img-left / img-right — dvije kolone na desktopu, jedna na mobilnom
      const layout = s("layout", "img-right");
      const media = s("url") ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={s("url")}
          alt={s("alt")}
          loading="lazy"
          decoding="async"
          style={{ ...imgRadius(bo("radius", true)), width: "100%", display: "block" }}
        />
      ) : null;
      const copy = (
        <div>
          {s("naslov") ? (
            <p className="dawn-story-stmt">
              <RichText text={s("naslov")} />
            </p>
          ) : null}
          {s("tekst") ? (
            <p className="dawn-story-text">
              <RichText text={s("tekst")} />
            </p>
          ) : null}
        </div>
      );
      return (
        <section className="dawn-story">
          <div className="dawn-col">
            <div
              className={`cms-two-col${layout === "img-right" ? " cms-two-col-rev" : ""}`}
            >
              {media}
              {copy}
            </div>
          </div>
        </section>
      );
    }

    case "benefiti":
      if (!items().length) return null;
      return (
        <section className="dawn-includes">
          <div className="dawn-col">
            {s("naslov") ? <h2 className="dawn-h2">{s("naslov")}</h2> : null}
            <ul>
              {items().map((t) => (
                <li key={t}>
                  {t}{" "}
                  <span className="dawn-check" aria-hidden="true">
                    ✓
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "koraci":
      if (!items().length) return null;
      return (
        <section className="dawn-story">
          <div className="dawn-col">
            {s("naslov") ? (
              <p className="dawn-story-stmt">
                <span>{s("naslov")}</span>
              </p>
            ) : null}
            <ol className="dawn-step-list">
              {items().map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </div>
        </section>
      );

    case "u_kutiji":
      return (
        <section className="dawn-includes">
          <div className="dawn-col">
            {s("naslov") ? <h2 className="dawn-h2">{s("naslov")}</h2> : null}
            <ul>
              {items().map((t) => (
                <li key={t}>
                  {t}{" "}
                  <span className="dawn-check" aria-hidden="true">
                    ✓
                  </span>
                </li>
              ))}
            </ul>
            {s("napomena") ? (
              <p className="dawn-includes-note">
                <strong>{s("napomena")}</strong>
              </p>
            ) : null}
          </div>
        </section>
      );

    case "trust":
      return (
        <section className="dawn-trust">
          <div className="dawn-col">
            {s("naslov") ? (
              <h2 className="dawn-h2 dawn-h2-sm">{s("naslov")}</h2>
            ) : null}
            <ul className="dawn-trust-list-sm">
              {items().map((t) => (
                <li key={t}>
                  {t}{" "}
                  <span className="dawn-check" aria-hidden="true">
                    ✓
                  </span>
                </li>
              ))}
            </ul>
            {s("badge") ? (
              <div className="dawn-guarantee-badge">{s("badge")}</div>
            ) : null}
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="dawn-repeat-cta">
          <div className="dawn-col">
            {s("naslov") ? <h2 className="dawn-h2">{s("naslov")}</h2> : null}
            {s("opis") ? <p className="dawn-repeat-sub">{s("opis")}</p> : null}
            <BookOrderTrigger className="dawn-btn-black">
              {s("ctaTekst", "PORUČI SADA")}
            </BookOrderTrigger>
          </div>
        </section>
      );

    case "spacer":
      return <div style={{ height: SPACER[s("size", "M")] ?? 32 }} />;

    case "galerija": {
      const gal = (Array.isArray(d.items) ? d.items : []) as {
        url: string;
        alt?: string;
      }[];
      if (!gal.length) return null;
      return (
        <section className="dawn-story">
          <div className="dawn-col">
            <div className="cms-gallery">
              {gal
                .filter((g) => g.url)
                .map((g, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={`${g.url}-${i}`}
                    src={g.url}
                    alt={g.alt ?? ""}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
            </div>
          </div>
        </section>
      );
    }

    case "recenzije": {
      // Bez ijedne recenzije blok se ne prikazuje ("na osnovu 0 recenzija"
      // bi odbilo kupca više nego da sekcije nema).
      if (!reviews.length) return null;
      return (
        <section className="dawn-reviews" id="recenzije">
          <div className="dawn-col">
            {s("naslov") ? (
              <h2 className="dawn-h2 dawn-h2-lg">{s("naslov")}</h2>
            ) : null}
            {bo("prikaziOcjenu", true) ? (
              <div className="dawn-rev-score">
                <span className="dawn-rev-num">{s("ratingVrijednost", "4.8")}</span>
                <div>
                  <div className="dawn-stars">★★★★★</div>
                  <small>
                    na osnovu {s("ratingBrojOcjena") || reviews.length}{" "}
                    {recenzijeLabel(
                      Number(s("ratingBrojOcjena")) || reviews.length
                    )}
                  </small>
                </div>
              </div>
            ) : null}
            <div className="dawn-rev-list">
              {reviews.map((r) => (
                <div className="dawn-rev-card" key={r.id}>
                  {r.slika ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={r.slika}
                      alt=""
                      loading="lazy"
                      style={{ width: "100%", borderRadius: 8, marginBottom: 14 }}
                    />
                  ) : null}
                  <div className="dawn-rev-who">
                    <div className="dawn-rev-av">
                      {r.inicijal || r.ime.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <b>{r.ime}</b>
                      {r.verified ? (
                        <span className="dawn-rev-verified">Verifikovano</span>
                      ) : null}
                    </div>
                  </div>
                  <p>&ldquo;{r.tekst}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "koristi": {
      const list = (Array.isArray(d.items) ? d.items : []) as {
        url?: string;
        alt?: string;
        naslov?: string;
        tekst?: string;
      }[];
      return (
        <section className="cms-koristi">
          <div className="dawn-col cms-koristi-col">
            {s("naslov") ? <h2 className="dawn-h2">{s("naslov")}</h2> : null}
            <div className="cms-koristi-grid">
              {list.map((k, i) => (
                <div className="cms-korist" key={i}>
                  {k.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={k.url} alt={k.alt ?? ""} loading="lazy" decoding="async" />
                  ) : null}
                  <div>
                    {k.naslov ? <h3>{k.naslov}</h3> : null}
                    {k.tekst ? (
                      <p>
                        <RichText text={k.tekst} />
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "faq": {
      const list = (Array.isArray(d.items) ? d.items : []) as {
        pitanje?: string;
        odgovor?: string;
      }[];
      return (
        <section className="cms-faq" id="pitanja">
          <div className="dawn-col">
            {s("naslov") ? <h2 className="dawn-h2">{s("naslov")}</h2> : null}
            <div className="cms-faq-list">
              {list.map((q, i) => (
                <details key={i} open={i === 0}>
                  <summary>{q.pitanje}</summary>
                  {q.odgovor ? (
                    <p>
                      <RichText text={q.odgovor} />
                    </p>
                  ) : null}
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "divider":
      return (
        <div className="dawn-col">
          <hr className="cms-divider" />
        </div>
      );

    default:
      return null;
  }
}

/* Prazni blokovi (npr. iz šablona, još nepopunjeni) se kupcu ne prikazuju,
 * a prazne stavke u listama se izbacuju — tako nedovršen šablon ne ostavlja
 * prazne rupe na stranici. */
function cleanBlock(b: Block): Block | null {
  const d = b.data as D;
  const t = (k: string) => (typeof d[k] === "string" ? (d[k] as string).trim() : "");
  const list = (k: string): unknown[] => (Array.isArray(d[k]) ? (d[k] as unknown[]) : []);
  switch (b.type) {
    case "naslov":
    case "tekst":
      return t("tekst") ? b : null;
    case "naslov_tekst":
      return t("naslov") || t("tekst") ? b : null;
    case "slika":
    case "gif":
    case "video":
      return t("url") ? b : null;
    case "slika_tekst":
      return t("url") || t("naslov") || t("tekst") ? b : null;
    case "benefiti":
    case "koraci":
    case "u_kutiji":
    case "trust": {
      const items = list("items").filter((x) => typeof x === "string" && x.trim());
      if (!items.length && b.type !== "trust") return null;
      return { ...b, data: { ...d, items } };
    }
    case "koristi": {
      const items = list("items").filter((x) => {
        const o = (x ?? {}) as D;
        return Boolean(o.naslov || o.tekst || o.url);
      });
      return items.length ? { ...b, data: { ...d, items } } : null;
    }
    case "faq": {
      const items = list("items").filter((x) => Boolean(((x ?? {}) as D).pitanje));
      return items.length ? { ...b, data: { ...d, items } } : null;
    }
    case "galerija":
      return list("items").length ? b : null;
    default:
      return b;
  }
}

function visibleBlocks(sections: Block[]): Block[] {
  const out: Block[] = [];
  for (const b of sections) {
    if (b.hidden) continue;
    const c = cleanBlock(b);
    if (c) out.push(c);
  }
  return out;
}

/* Prvi neprekinuti niz "story" blokova (odmah nakon hero-a) ide u
 * desktop sticky uvod (vidi CmsProductPage) — ostatak se renderuje kao
 * i dosad. Sakriveni blokovi (hidden) se preskaču pri odlučivanju gdje
 * niz staje, isto kao što groupBlocks() dolje ignoriše hidden blokove. */
export function splitIntroSections(sections: Block[]): {
  lead: Block[];
  rest: Block[];
} {
  const visible = visibleBlocks(sections);
  // Stranice iz novih šablona (blokovi imaju `uloga`) u desnu kolonu pored
  // fiksne slike puštaju i liste/koristi/kutiju, ne samo tekst i slike —
  // inače bi desna kolona ostala skoro prazna. Stari proizvodi ostaju kako
  // su bili (dogovor: postojeći se ne diraju).
  const izSablona = sections.some((b) => b.uloga);
  const uUvod = (b: Block) =>
    isStoryBlock(b) ||
    (izSablona && INTRO_SOLO.includes(b.type));
  const lead: Block[] = [];
  for (const b of visible) {
    if (!uUvod(b)) break;
    lead.push(b);
  }
  const leadIds = new Set(lead.map((b) => b.id));
  return { lead, rest: sections.filter((s) => !leadIds.has(s.id)) };
}

/** Uvodni opis — jednostavna jedna kolona (bez naizmjeničnog rasporeda),
 * jer na desktopu sjedi pored fiksne hero slike u .dawn-intro-right. */
const INTRO_SOLO: Block["type"][] = ["koraci", "koristi", "benefiti", "u_kutiji", "faq"];

export function IntroDescription({ blocks }: { blocks: Block[] }) {
  if (!blocks.length) return null;
  return (
    <div className="dawn-intro-right">
      {blocks.map((b) =>
        isStoryBlock(b) ? (
          <div className="dawn-story-block" key={b.id}>
            <StoryInner block={b} />
          </div>
        ) : (
          <SoloBlock key={b.id} block={b} reviews={[]} />
        )
      )}
    </div>
  );
}

/* --------------------------- grupisanje --------------------------- */

type Group =
  | { kind: "story"; key: string; blocks: Block[] }
  | { kind: "solo"; key: string; block: Block };

function groupBlocks(blocks: Block[]): Group[] {
  const out: Group[] = [];
  for (const b of blocks) {
    if (isStoryBlock(b)) {
      const last = out[out.length - 1];
      if (last && last.kind === "story") last.blocks.push(b);
      else out.push({ kind: "story", key: b.id, blocks: [b] });
    } else {
      out.push({ kind: "solo", key: b.id, block: b });
    }
  }
  return out;
}

export function CmsBlocks({
  sections,
  reviews,
}: {
  sections: Block[];
  reviews: Review[];
}) {
  const groups = groupBlocks(visibleBlocks(sections));

  return (
    <>
      {groups.map((g, gi) =>
        g.kind === "story" ? (
          <section
            key={g.key}
            // prva story grupa se, kao i na ručno pisanim stranicama,
            // privlači uz hero da nema dvostruki razmak ispod dugmeta
            className={`dawn-story${gi === 0 ? " dawn-story-tight-top" : ""}`}
          >
            <div className="dawn-col">
              {g.blocks.map((b) => (
                <div className="dawn-story-block" key={b.id}>
                  <StoryInner block={b} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <SoloBlock key={g.key} block={g.block} reviews={reviews} />
        )
      )}
    </>
  );
}

export default CmsBlocks;
