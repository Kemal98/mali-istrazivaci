"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function HvalaContent() {
  const params = useSearchParams();
  const proizvod = params.get("proizvod") || "SAT MIRA set 3u1";
  const value = Number(params.get("value")) || 29;
  const productPrice = Number(params.get("pp"));
  const qty = Number(params.get("qty"));
  const eventId = params.get("eid");

  useEffect(() => {
    if (!window.fbq) return;

    if (productPrice && qty && eventId) {
      // Nova putanja (glavna SAT MIRA forma): value je samo cijena
      // proizvoda (bez dostave), eventID nosi se iz forme pa Meta
      // deduplicira ako se ova stranica refreshuje.
      window.fbq(
        "track",
        "Purchase",
        {
          value: productPrice,
          currency: "BAM",
          content_name: "SAT MIRA set 3u1",
          content_ids: ["sat-mira-3u1"],
          content_type: "product",
          contents: [{ id: "sat-mira-3u1", quantity: qty }],
          num_items: qty,
        },
        { eventID: eventId }
      );
    } else if (params.get("proizvod")) {
      // Stara putanja — npr. knjiga-checkout (BookCheckout.tsx) ne šalje
      // pp/qty/eid. Zadržava dosadašnje ponašanje bez izmjena tamo.
      window.fbq("track", "Purchase", {
        content_name: proizvod,
        value,
        currency: "BAM",
      });
    }
    // ako nema ni "proizvod" parametra, neko je samo otvorio /hvala
    // direktno — ne pali se lažna kupovina.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="co-bg" style={{ minHeight: "70vh" }}>
      <div className="wrap">
        <div
          style={{
            display: "block",
            maxWidth: "520px",
            margin: "60px auto",
            background: "var(--green-bg)",
            border: "2px solid var(--green)",
            borderRadius: "var(--r)",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.4rem", marginBottom: "10px" }}>✅</div>
          <h1
            style={{
              fontSize: "1.35rem",
              marginBottom: "8px",
              color: "var(--green-d)",
            }}
          >
            Narudžba primljena!
          </h1>
          <p style={{ fontWeight: 500, color: "var(--ink2s)" }}>
            Javljamo se na Viber za par sati da potvrdimo dostavu. Hvala
            ti! 🙏
          </p>
          <p
            style={{
              fontWeight: 600,
              color: "var(--ink3)",
              fontSize: ".85rem",
              marginTop: "16px",
            }}
          >
            {proizvod} · {value} KM
          </p>
          <p
            style={{
              fontWeight: 600,
              color: "var(--ink3)",
              fontSize: ".85rem",
              marginTop: "10px",
            }}
          >
            Pitanja u međuvremenu?{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{ color: "var(--blue)" }}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <Link
            href="/"
            className="btn btn-ghost"
            style={{ marginTop: "22px", display: "inline-flex" }}
          >
            Nazad na početnu
          </Link>
        </div>
      </div>
    </section>
  );
}
