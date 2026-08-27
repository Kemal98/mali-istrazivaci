"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/constants";

export default function HvalaContent() {
  const params = useSearchParams();
  const proizvod = params.get("proizvod") || "SAT MIRA set 3u1";
  const value = Number(params.get("value")) || 29;

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
            <a href={`tel:${PHONE_TEL}`} style={{ color: "var(--blue)" }}>
              {PHONE_DISPLAY}
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
