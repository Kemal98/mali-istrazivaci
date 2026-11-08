import { getHomeDraft } from "@/lib/home/repo";
import { getUnifiedProducts } from "@/lib/home/rank";
import HomeEditor from "@/components/admin/HomeEditor";

export const dynamic = "force-dynamic";

export default async function PocetnaPage() {
  const [content, unified] = await Promise.all([getHomeDraft(), getUnifiedProducts()]);
  // "Hit proizvodi" se zakucava preko istog .link identifikatora koji
  // koristi i rang/prikaz (vidi src/lib/home/rank.ts) — pokriva i CMS i
  // legacy (SAT MIRA, Sparkling Diamond) proizvode.
  const products = unified
    .map((p) => ({ link: p.link, naziv: p.naziv }))
    .sort((a, b) => a.naziv.localeCompare(b.naziv));

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Početna stranica</h1>
          <p className="adm-hint">
            Ovo je NACRT — ništa se ne mijenja na pravom sajtu dok ne
            klikneš "Objavi". Koristi "Pregled" da vidiš kako izgleda prije
            objave.
          </p>
        </div>
      </div>
      <HomeEditor initial={content} products={products} />
    </>
  );
}
