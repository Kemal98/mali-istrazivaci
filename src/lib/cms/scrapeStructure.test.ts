import { describe, expect, it } from "vitest";
import { extractContentStructure } from "./scrapeStructure";

describe("extractContentStructure — inline bold/italic", () => {
  // Kontejner mora imati >40 znakova teksta da ga extractContentStructure
  // uopšte prepozna kao "opis" (vidi CONTAINER_SELECTORS) — zato svaki
  // fixture ima i rečenicu viška, da test mjeri FORMAT, ne taj prag.
  it("<strong>/<b> unutar pasusa postaje **bold**", () => {
    const html = `
      <div class="description">
        <p>Ovo je <strong>podebljan</strong> dio teksta, a ovo nije.</p>
        <p>Dodatna rečenica samo da kontejner pređe prag od 40 znakova.</p>
      </div>
    `;
    const out = extractContentStructure(html, "https://primjer.ba/proizvod");
    expect(out[0]).toEqual({
      kind: "text",
      text: "Ovo je **podebljan** dio teksta, a ovo nije.",
    });
  });

  it("<em>/<i> postaje __italic__", () => {
    const html = `
      <div class="description">
        <p>Riječ <em>naglašena</em> kurzivom.</p>
        <p>Dodatna rečenica samo da kontejner pređe prag od 40 znakova.</p>
      </div>
    `;
    const out = extractContentStructure(html, "https://primjer.ba/proizvod");
    expect(out[0]).toEqual({ kind: "text", text: "Riječ __naglašena__ kurzivom." });
  });

  it("<br> unutar pasusa postaje prelom reda, ne nestane u razmak", () => {
    const html = `
      <div class="description">
        <p>Prvi red.<br>Drugi red.</p>
        <p>Dodatna rečenica samo da kontejner pređe prag od 40 znakova.</p>
      </div>
    `;
    const out = extractContentStructure(html, "https://primjer.ba/proizvod");
    expect(out[0]).toEqual({ kind: "text", text: "Prvi red.\nDrugi red." });
  });

  it("pasus bez ikakvog formatiranja ostaje čist tekst (bez markera)", () => {
    const html = `
      <div class="description">
        <p>Sasvim običan tekst bez formatiranja.</p>
        <p>Dodatna rečenica samo da kontejner pređe prag od 40 znakova.</p>
      </div>
    `;
    const out = extractContentStructure(html, "https://primjer.ba/proizvod");
    expect(out[0]).toEqual({
      kind: "text",
      text: "Sasvim običan tekst bez formatiranja.",
    });
  });

  it("slika UNUTAR pasusa (prije i poslije teksta) se izvuče, ne nestane", () => {
    // Pravi obrazac sa Shopify prodavnica (igralica.com i sl.): slika i
    // tekst zajedno u istom <p>, ne kao zasebni elementi jedan za drugim.
    const html = `
      <div class="description">
        <p style="text-align: center;">
          <img alt="" src="https://cdn.example.com/zauvek_finallna.png">
          <br>
          <span style="color:#fff"> <strong>UHVATITE SVAKU ČAROLIJU</strong> </span>
        </p>
        <p>Dodatna rečenica samo da kontejner pređe prag od 40 znakova teksta.</p>
      </div>
    `;
    const out = extractContentStructure(html, "https://primjer.ba/proizvod");
    expect(out[0]).toEqual({ kind: "image", url: "https://cdn.example.com/zauvek_finallna.png" });
    expect(out[1]).toEqual({ kind: "text", text: "**UHVATITE SVAKU ČAROLIJU**" });
  });

  it("slika NASRED teksta (tekst-slika-tekst u istom <p>) ostaje ispravnim redoslijedom", () => {
    const html = `
      <div class="description">
        <p>Prvi dio teksta prije slike.<img src="https://cdn.example.com/gif.gif">Drugi dio teksta poslije slike.</p>
      </div>
    `;
    const out = extractContentStructure(html, "https://primjer.ba/proizvod");
    expect(out).toEqual([
      { kind: "text", text: "Prvi dio teksta prije slike." },
      { kind: "gif", url: "https://cdn.example.com/gif.gif" },
      { kind: "text", text: "Drugi dio teksta poslije slike." },
    ]);
  });

  it("slika unutar <strong> (ugniježđeno) se i dalje izvuče kao zasebna stavka", () => {
    const html = `
      <div class="description">
        <p>- Uputstvo za korišćenje<strong><br><br><img src="https://cdn.example.com/bolje.jpg"></strong></p>
        <p>Dodatna rečenica samo da kontejner pređe prag od 40 znakova teksta.</p>
      </div>
    `;
    const out = extractContentStructure(html, "https://primjer.ba/proizvod");
    expect(out[0]).toEqual({ kind: "text", text: "- Uputstvo za korišćenje" });
    expect(out[1]).toEqual({ kind: "image", url: "https://cdn.example.com/bolje.jpg" });
  });

  it("naslov (h2) ostaje poseban 'heading' item, ne ulazi u tekst", () => {
    const html = `
      <div class="description">
        <h2>Naslov proizvoda</h2>
        <p>Opis ispod naslova, dovoljno dug da kontejner pređe prag od 40 znakova.</p>
      </div>
    `;
    const out = extractContentStructure(html, "https://primjer.ba/proizvod");
    expect(out[0]).toEqual({ kind: "heading", text: "Naslov proizvoda" });
    expect(out[1]?.kind).toBe("text");
  });
});
