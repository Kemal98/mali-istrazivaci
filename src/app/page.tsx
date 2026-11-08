import type { Metadata } from "next";
import HomePageView from "@/components/HomePageView";
import { getHomePublished } from "@/lib/home/repo";
import { defaultHomeContent } from "@/lib/home/types";

export const metadata: Metadata = {
  title: "Mali Istraživači – Igračke za djecu, dostava po cijeloj BiH",
  description:
    "Pažljivo birane igračke za djecu svih uzrasta. Plaćanje pouzećem, dostava po cijeloj BiH.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ kategorija?: string; sve?: string }>;
}) {
  const { kategorija, sve } = await searchParams;
  // Prije prve objave u /admin/pocetna, published je null — koristi se
  // siguran default (stvarni tekstovi, sekcije bez fotografije se same
  // sakriju) da "/" nikad ne bude prazna/pokvarena stranica.
  const content = (await getHomePublished()) ?? defaultHomeContent();

  return <HomePageView content={content} kategorija={kategorija} sve={sve === "1"} />;
}
