import HomePageView from "@/components/HomePageView";
import { getHomeDraft } from "@/lib/home/repo";

// Pregled NACRTA početne — isti obrazac kao admin/preview/[id] za
// proizvode. ?bare=1 sakriva crnu traku (koristi se u iframe-u unutar
// editora).
export const dynamic = "force-dynamic";

export default async function HomePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ bare?: string; kategorija?: string; sve?: string }>;
}) {
  const { bare, kategorija, sve } = await searchParams;
  const content = await getHomeDraft();

  return (
    <>
      {bare ? null : (
        <div
          style={{
            background: "#111",
            color: "#fff",
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          PREGLED NACRTA POČETNE — ovo još nije objavljeno ·{" "}
          <a href="/admin/pocetna" style={{ color: "#ffb96b" }}>
            nazad u editor
          </a>
        </div>
      )}
      <HomePageView content={content} kategorija={kategorija} sve={sve === "1"} />
    </>
  );
}
