import { getSettings } from "@/lib/cms/repo";

export const metadata = {
  title: "Trenutno zatvoreno | Mali Istraživači",
  robots: { index: false, follow: false },
};

// Stranica na koju proxy.ts rewrituje SVE javne rute kad je
// settings.siteClosed uključeno (Admin → Postavke → "Zatvori cijeli
// sajt"). Admin dio ostaje dostupan — vidi proxy.ts.
export default async function ZatvorenoPage() {
  const settings = await getSettings();
  const poruka =
    settings.siteClosedMessage ||
    "Trenutno smo zatvoreni. Vraćamo se uskoro — hvala na strpljenju!";

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#faf8f5",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          textAlign: "center",
          background: "#fff",
          border: "1px solid #e3e5e9",
          borderRadius: 14,
          padding: "40px 32px",
        }}
      >
        <div style={{ fontSize: "2.4rem", marginBottom: 14 }}>🚧</div>
        <h1 style={{ fontSize: "1.3rem", marginBottom: 10, color: "#222" }}>
          Mali Istraživači
        </h1>
        <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.5 }}>
          {poruka}
        </p>
      </div>
    </section>
  );
}
