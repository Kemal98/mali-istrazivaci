import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Politika privatnosti | Mali Istraživači",
  description: "Kako Mali Istraživači prikupljaju i koriste vaše podatke.",
};

export default function PolitikaPrivatnostiPage() {
  return (
    <section style={{ background: "#faf8f5", minHeight: "100vh", padding: "48px 20px" }}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #e3e5e9",
          borderRadius: 14,
          padding: "36px 32px",
          lineHeight: 1.6,
          color: "#333",
        }}
      >
        <Link href="/" style={{ color: "#888", fontSize: ".85rem" }}>
          ← Nazad na početnu
        </Link>
        <h1 style={{ fontSize: "1.6rem", margin: "16px 0 6px" }}>Politika privatnosti</h1>
        <p style={{ color: "#888", fontSize: ".85rem", marginBottom: 24 }}>
          Mali Istraživači (Svijet malih istraživača)
        </p>

        <h2 style={{ fontSize: "1.1rem", marginTop: 24 }}>Koje podatke prikupljamo</h2>
        <p>
          Kad naručite proizvod, prikupljamo ime i prezime, broj telefona,
          adresu i grad — podatke neophodne da vam kurir dostavi narudžbu i
          naplati pouzećem. Ako nam pišete (email, Facebook Messenger,
          Instagram), čuvamo i tu prepisku radi odgovora na vaš upit.
        </p>

        <h2 style={{ fontSize: "1.1rem", marginTop: 24 }}>Kolačići i analitika</h2>
        <p>
          Sajt koristi Meta Pixel (Facebook/Instagram), Google Analytics i
          Microsoft Clarity da razumijemo kako posjetioci koriste sajt i da
          mjerimo učinak reklama. Ovi servisi mogu postavljati kolačiće u
          vašem pregledniku. Ne prodajemo vaše podatke trećim stranama.
        </p>

        <h2 style={{ fontSize: "1.1rem", marginTop: 24 }}>
          Zašto koristimo Facebook/Instagram poruke
        </h2>
        <p>
          Ako nam pišete preko Facebook stranice ili Instagrama, poruku
          primamo i u admin sistemu sajta (uz pomoć zvanične Meta Messenger
          Platform API-ja) da bismo lakše pratili i odgovarali na upite kupaca.
          Ne šaljemo automatske odgovore niti dijelimo te poruke sa trećim
          stranama.
        </p>

        <h2 style={{ fontSize: "1.1rem", marginTop: 24 }}>Koliko čuvamo podatke</h2>
        <p>
          Podatke o narudžbama čuvamo radi računovodstva i eventualnih
          reklamacija. Podatke možete zatražiti na uvid ili brisanje u bilo
          kom trenutku.
        </p>

        <h2 style={{ fontSize: "1.1rem", marginTop: 24 }}>Kontakt</h2>
        <p>
          Za sva pitanja o privatnosti i vašim podacima, pišite na{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--blue, #2563eb)" }}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
