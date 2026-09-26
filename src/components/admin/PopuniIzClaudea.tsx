"use client";

import { useState } from "react";
import { napraviPrompt, popuniStranicu } from "@/lib/cms/sabloni";
import type { Block, Hero } from "@/lib/cms/types";

// "Popuni iz Claude-a": 1) kopiraj prompt, 2) u Claude chatu dodaj link,
// 3) zalijepi odgovor ovdje — tekst se rasporedi u blokove po `uloga`.
// Mijenja samo nacrt u editoru; ništa se ne snima dok admin ne klikne Snimi.
export default function PopuniIzClaudea({
  hero,
  sections,
  onApply,
}: {
  hero: Hero;
  sections: Block[];
  onApply: (hero: Hero, sections: Block[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  if (!sections.some((s) => s.uloga || s.type === "faq")) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(napraviPrompt(sections));
      setMsg("Prompt kopiran. Zalijepi ga u Claude chat, dodaj link proizvoda i pošalji.");
    } catch {
      setMsg("Kopiranje nije uspjelo — označi tekst ispod ručno.");
      setText(napraviPrompt(sections));
    }
  }

  function apply() {
    const r = popuniStranicu(text, hero, sections);
    if (!r.popunjeno.length) {
      setMsg(
        "Nisam prepoznao format. Zalijepi odgovor u kojem redovi počinju sa NASLOV:, KORIST:, KORAK:…"
      );
      return;
    }
    onApply(r.hero, r.sections);
    setText("");
    setMsg(
      `Popunjeno: ${r.popunjeno.join(", ")}.` +
        (r.nedostaje.length ? ` Nije stiglo: ${r.nedostaje.join(", ")}.` : "") +
        " Pregledaj i klikni Snimi."
    );
  }

  return (
    <div className="adm-card">
      <div className="adm-card-title">✨ Popuni iz Claude-a</div>
      <p className="adm-hint" style={{ marginBottom: 10 }}>
        1) Klikni <b>KOPIRAJ PROMPT</b>. 2) U Claude chatu zalijepi prompt i umjesto
        [OVDJE ZALIJEPI LINK…] stavi link proizvoda. 3) Odgovor zalijepi ovdje i klikni{" "}
        <b>POPUNI STRANICU</b>. Slike ubaci ručno ili preko uvoza sa linka.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="adm-btn" onClick={copy}>
          📋 KOPIRAJ PROMPT
        </button>
        <button type="button" className="adm-btn" onClick={() => setOpen((v) => !v)}>
          {open ? "ZATVORI" : "📥 ZALIJEPI ODGOVOR"}
        </button>
      </div>
      {open ? (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"NASLOV: …\nKORIST: … | …\nKORAK: …"}
            style={{ width: "100%", fontFamily: "inherit" }}
          />
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            style={{ alignSelf: "flex-start" }}
            disabled={!text.trim()}
            onClick={apply}
          >
            POPUNI STRANICU
          </button>
        </div>
      ) : null}
      {msg ? (
        <p className="adm-hint" style={{ marginTop: 8 }}>
          {msg}
        </p>
      ) : null}
      <p className="adm-hint" style={{ marginTop: 10 }}>
        Galerija (tab Hero), 6–8 slika ovim redom: proizvod u upotrebi · GIF kako radi ·
        u ruci (vidi se veličina) · detalj materijala · šta je u paketu.
      </p>
    </div>
  );
}
