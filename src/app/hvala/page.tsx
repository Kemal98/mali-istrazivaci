import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HvalaContent from "@/components/HvalaContent";

export const metadata: Metadata = {
  title: "Narudžba primljena | Mali Istraživači",
  description:
    "Hvala na narudžbi — javljamo se uskoro na Viber da potvrdimo detalje.",
};

export default function HvalaPage() {
  return (
    <>
      <Nav logoHref="/" />
      <Suspense fallback={null}>
        <HvalaContent />
      </Suspense>
      <Footer />
    </>
  );
}
