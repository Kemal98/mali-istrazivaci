"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

// Zamijeni sa svojim Google Apps Script Web App URL-om (vidi SHEETS_SCRIPT.js za upute)
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw2HAwC4MF3Z37SstIPtvMj60Z_KTkXVVD6JCA0gMBQbPCmdE7pKd9iLYbigsbsLgwv/exec";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function Checkout() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) {
      successRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [submitted]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      datum: new Date().toLocaleString("bs-BA"),
      ime: formData.get("ime"),
      telefon: formData.get("tel"),
      adresa: formData.get("adresa"),
      grad: formData.get("grad"),
      uzrast: formData.get("uzrast"),
      napomena: formData.get("napomena"),
      proizvod: "SAT MIRA set 3u1",
      cijena: "29 KM",
      status: "Novo",
    };

    if (window.fbq) {
      window.fbq("track", "Lead", {
        content_name: "SAT MIRA set",
        value: 29,
        currency: "BAM",
      });
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="co-bg" id="naruci">
      <div className="wrap">
        <span className="kicker k-green">Posljednji korak</span>
        <h2 className="h-sec">Popuni – zovemo te isti dan</h2>
        <p className="co-crumbs">
          <span className="done">Košarica</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          Dostava i plaćanje
        </p>

        {!submitted && (
          <form onSubmit={handleSubmit}>
            <div className="co-grid">
              <div className="co-card">
                <div className="card-head">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="1" y="6" width="15" height="12" rx="2" />
                    <path d="M16 10h4l3 3v5h-7z" />
                    <circle cx="6" cy="19" r="2" />
                    <circle cx="18" cy="19" r="2" />
                  </svg>
                  <h3>Podaci za dostavu</h3>
                </div>
                <div className="card-body">
                  <div className="field">
                    <label htmlFor="ime">Ime i prezime *</label>
                    <input
                      type="text"
                      id="ime"
                      name="ime"
                      required
                      placeholder="npr. Amina Hodžić"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="tel">Broj telefona *</label>
                    <input
                      type="tel"
                      id="tel"
                      name="tel"
                      required
                      placeholder="npr. 061 123 456"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="adresa">Ulica i broj *</label>
                    <input
                      type="text"
                      id="adresa"
                      name="adresa"
                      required
                      placeholder="npr. Titova 15"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="grad">Grad *</label>
                    <input
                      type="text"
                      id="grad"
                      name="grad"
                      required
                      placeholder="npr. Sarajevo"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="uzrast">
                      Koliko godina ima dijete? *
                    </label>
                    <input
                      type="text"
                      id="uzrast"
                      name="uzrast"
                      required
                      placeholder="npr. 4 godine – biramo igračku po uzrastu"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="napomena">
                      Napomena{" "}
                      <span
                        style={{ color: "var(--ink3)", fontWeight: 500 }}
                      >
                        (opcionalno)
                      </span>
                    </label>
                    <textarea
                      id="napomena"
                      name="napomena"
                      rows={2}
                      placeholder="npr. trebam 2 seta, ili ostavi prazno"
                    />
                  </div>
                </div>
              </div>

              <div className="co-card sum-card">
                <div className="card-head">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  <h3>Vaša narudžba</h3>
                </div>
                <div className="card-body">
                  <div className="sum-prod">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/img/kutija.jpg" alt="SAT MIRA set" />
                    <div>
                      <div className="spn">SAT MIRA – set 3u1</div>
                      <div className="spq">Montessori set 2–6 godina</div>
                    </div>
                  </div>
                  <ul className="sum-inc">
                    <li>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Montessori igra na čičak
                    </li>
                    <li>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Drvena igračka po uzrastu
                    </li>
                    <li>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Drvena mozgalica
                    </li>
                    <li>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Poklon kutija
                    </li>
                  </ul>
                  <div className="sum-row">
                    <span>Dostava</span>
                    <span style={{ color: "var(--green-d)", fontWeight: 700 }}>
                      Besplatno
                    </span>
                  </div>
                  <div className="sum-row sum-total">
                    <span>Ukupno</span>
                    <span>29 KM</span>
                  </div>

                  <div className="pay-label">Način plaćanja</div>
                  <div className="pay-row">
                    <div className="pay-dot" />
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    <div>
                      <div className="pay-name">Pouzećem</div>
                      <div className="pay-desc">
                        Platiš kuriru kad preuzmeš paket
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-green"
                    disabled={submitting}
                    style={{
                      width: "100%",
                      marginTop: "17px",
                      borderRadius: "12px",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {submitting ? "Šaljem..." : "Potvrdi narudžbu"}
                  </button>
                  {error && (
                    <p
                      style={{
                        color: "var(--orange-d)",
                        fontWeight: 600,
                        fontSize: ".85rem",
                        marginTop: "10px",
                        textAlign: "center",
                      }}
                    >
                      Greška – pokušaj ponovo ili nas nazovi direktno.
                    </p>
                  )}
                  <p className="sub-note">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
                    </svg>
                    Bez plaćanja unaprijed · Zovemo te da potvrdimo
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}

        {submitted && (
          <div
            ref={successRef}
            style={{
              display: "block",
              maxWidth: "520px",
              margin: "30px auto 0",
              background: "var(--green-bg)",
              border: "2px solid var(--green)",
              borderRadius: "var(--r)",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2.4rem", marginBottom: "10px" }}>✅</div>
            <h3
              style={{
                fontSize: "1.35rem",
                marginBottom: "8px",
                color: "var(--green-d)",
              }}
            >
              Narudžba primljena!
            </h3>
            <p style={{ fontWeight: 500, color: "var(--ink2s)" }}>
              Zovemo te uskoro na broj koji si ostavio/la da potvrdimo
              dostavu i uzrast djeteta. Hvala ti! 🙏
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
