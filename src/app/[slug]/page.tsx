import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CmsProductPage from "@/components/cms/CmsProductPage";
import {
  getPublishedBySlug,
  listPublishedReviews,
  listPublishedSlugs,
} from "@/lib/cms/repo";

// Javna stranica CMS proizvoda. Postojeće statične rute (/sat-mira,
// /hvala, /rotirajuce-zvecke...) imaju prioritet nad ovom dinamičkom,
// pa se ništa postojeće ne mijenja.
//
// Stranica se KEŠIRA (ISR). Baza je sad Supabase preko mreže, pa bi
// force-dynamic značio upit u bazu na svaki pregled — a javne stranice
// moraju ostati brze (reklame vode direktno na njih).
// Nakon "Objavi" se keš odmah osvježi preko revalidatePath() u
// /api/admin/products/[id], pa se izmjena vidi bez čekanja.
// revalidate je sigurnosna mreža ako revalidatePath promaši.
export const revalidate = 300;

// Objavljene stranice se prerenderuju pri buildu (zato su brze i kad je
// Supabase spor), a proizvodi objavljeni POSLIJE builda se renderuju na
// prvi zahtjev i onda keširaju — zato dynamicParams ostaje uključen.
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    return (await listPublishedSlugs()).map((slug) => ({ slug }));
  } catch {
    // Ako baza nije dostupna u trenutku builda, build ne smije pasti —
    // stranice se tada samo renderuju na zahtjev.
    return [];
  }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublishedBySlug(slug);
  if (!p) return {};
  const d = p.publishedData;
  const seo = d?.seo ?? {};
  const title = seo.title || `${d?.naziv ?? p.naziv} | Mali Istraživači`;
  const description = seo.description || "";
  return {
    title,
    description,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: seo.ogImage
        ? [seo.ogImage]
        : p.publishedHero?.slika
        ? [p.publishedHero.slika]
        : undefined,
    },
  };
}

export default async function CmsSlugPage({ params }: Props) {
  const { slug } = await params;
  const p = await getPublishedBySlug(slug);
  if (!p || !p.publishedHero || !p.publishedSections) notFound();

  const d = p.publishedData;
  const reviews = await listPublishedReviews(p.id);

  return (
    <CmsProductPage
      naziv={d?.naziv ?? p.naziv}
      hero={p.publishedHero}
      sections={p.publishedSections}
      reviews={reviews}
      cijena={d?.cijena ?? p.cijena}
      staraCijena={d?.staraCijena ?? p.staraCijena}
      badge={d?.badge ?? p.badge}
    />
  );
}
