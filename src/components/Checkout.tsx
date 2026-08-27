"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GOOGLE_SCRIPT_URL, PHONE_TEL, PHONE_DISPLAY } from "@/lib/constants";
import GuaranteeBadge from "./GuaranteeBadge";
import ShippingCutoff from "./ShippingCutoff";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const AGE_OPTIONS = [
  { value: "2 godine", label: "2" },
  { value: "3 godine", label: "3" },
  { value: "4 godine", label: "4" },
  { value: "5 godina", label: "5" },
  { value: "6 godina", label: "6" },
];

function isValidBHPhone(raw: string) {
  const digits = raw.replace(/[\s-]/g, "");
  return /^06\d{7}$/.test(digits) || /^\+3876\d{7}$/.test(digits);
}

const viberHref = `viber://chat?number=${encodeURIComponent(
  PHONE_TEL.replace(/[\s-]/g, "")
)}`;

export default function Checkout() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [extraSet, setExtraSet] = useState(false);
  const [selectedAge, setSelectedAge] = useState("");
  const [dvoje, setDvoje] = useState(false);
  const [dvojeGodine, setDvojeGodine] = useState("");
  const [ageError, setAgeError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const DELIVERY = 10;
  const productPrice = extraSet ? 49 : 29;
  const total = productPrice + DELIVERY;
  const uzrastValue = dvoje
    ? dvojeGodine.trim()
      ? `Dvoje djece: ${dvojeGodine.trim()}`
      : ""
    : selectedAge;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const telValue = String(formData.get("tel") || "");

    const ageOk = Boolean(uzrastValue);
    const phoneOk = isValidBHPhone(telValue);
    setAgeError(!ageOk);
    setPhoneError(!phoneOk);
    if (!ageOk || !phoneOk) return;

    setSubmitting(true);

    const data = {
      datum: new Date().toLocaleString("bs-BA"),
      ime: formData.get("ime"),
      telefon: telValue,
      adresa: formData.get("adresa"),
      grad: formData.get("grad"),
      uzrast: uzrastValue,
      napomena: formData.get("napomena"),
      proizvod: extraSet ? "SAT MIRA set 3u1 x2" : "SAT MIRA set 3u1",
      cijena: `${total} KM`,
      status: "Novo",
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (window.fbq) {
        window.fbq("track", "Lead", {
          content_name: "SAT MIRA set",
          value: total,
          currency: "BAM",
        });
      }

      // Purchase se pali na /hvala (kad se stranica stvarno prebaci), ne
      // ovdje — ali eventID se generiše ovdje, na uspješan submit, i nosi
      // se kroz URL. Ako korisnik refresha /hvala, isti eventID stigne
      // Meti dvaput i ona to sama deduplicira (ne broji dvaput), umjesto
      // da svaki refresh broji kao nova kupovina.
      const brojSetova = extraSet ? 2 : 1;
      const eventId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      router.push(
        `/hvala?proizvod=${encodeURIComponent(data.proizvod)}&value=${total}` +
          `&pp=${productPrice}&qty=${brojSetova}&eid=${eventId}`
      );
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
        <h2 className="h-sec">Ostavi podatke — ne plaćaš ništa sada</h2>

        <GuaranteeBadge />
        <p className="co-cutoff">
          ⏰ <ShippingCutoff />
        </p>

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
                      inputMode="numeric"
                      id="tel"
                      name="tel"
                      required
                      placeholder="npr. 061 123 456"
                      onChange={() => setPhoneError(false)}
                    />
                    {phoneError && (
                      <p className="field-error">
                        Unesi ispravan broj (npr. 061 123 456 ili +38761 123
                        456).
                      </p>
                    )}
                  </div>
                  <div className="field-row">
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
                  </div>
                  <div className="field">
                    <label>Koliko godina ima dijete? *</label>
                    <div className="age-btns">
                      {AGE_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          className={`age-btn${
                            !dvoje && selectedAge === opt.value
                              ? " active"
                              : ""
                          }`}
                          onClick={() => {
                            setDvoje(false);
                            setSelectedAge(opt.value);
                            setAgeError(false);
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`age-btn age-btn-multi${
                          dvoje ? " active" : ""
                        }`}
                        onClick={() => {
                          setDvoje(true);
                          setSelectedAge("");
                          setAgeError(false);
                        }}
                      >
                        Dvoje djece
                      </button>
                    </div>
                    {dvoje && (
                      <input
                        type="text"
                        required
                        value={dvojeGodine}
                        onChange={(e) => {
                          setDvojeGodine(e.target.value);
                          setAgeError(false);
                        }}
                        placeholder="Koliko godina imaju? npr. 3 i 5 godina"
                        style={{ marginTop: "10px" }}
                      />
                    )}
                    {ageError && (
                      <p className="field-error">Izaberi uzrast djeteta.</p>
                    )}
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
                    <img src="/img/set_hero2.png" alt="SAT MIRA set" />
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
                  <label className="upsell">
                    <input
                      type="checkbox"
                      checked={extraSet}
                      onChange={(e) => setExtraSet(e.target.checked)}
                    />
                    <span>
                      Dodaj još jedan set – 49 KM za dva (ušteda 9 KM)
                      <small>Za drugo dijete ili kao poklon.</small>
                    </span>
                  </label>

                  <div className="sum-row">
                    <span>
                      SAT MIRA set 3u1{extraSet ? " x2" : ""}
                    </span>
                    <span>{productPrice} KM</span>
                  </div>
                  <div className="sum-row">
                    <span>Dostava</span>
                    <span>{DELIVERY} KM</span>
                  </div>
                  <div className="sum-row sum-total">
                    <span>UKUPNO — platiš kuriru</span>
                    <span>{total} KM</span>
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

                  <div className="next-steps">
                    <div className="next-steps-title">
                      Šta se dešava dalje:
                    </div>
                    <ul className="next-steps-list">
                      <li>
                        1️⃣ Pakujemo set ručno, šaljemo isti ili sljedeći dan
                      </li>
                      <li>
                        2️⃣ Kurir stiže za 2–4 dana — platiš njemu {total} KM
                      </li>
                    </ul>
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
                    {submitting
                      ? "Šaljem..."
                      : `POŠALJI NARUDŽBU — ${total} KM POUZEĆEM`}
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
                      Greška – pokušaj ponovo ili nam piši na
                      info@maliistrazivaci.ba.
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
                    Bez plaćanja unaprijed · Javljamo se na Viber · 14
                    dana garancija povrata
                  </p>
                  <p className="co-commit">
                    Slanjem ne preuzimaš obavezu — možeš odustati kad te
                    nazovemo.
                  </p>
                </div>
              </div>
            </div>
          </form>
        <p className="co-viber">
          Ne voliš forme? Piši nam na Viber:{" "}
          <a href={viberHref}>{PHONE_DISPLAY}</a> — dogovorimo za minut.
        </p>
      </div>
    </section>
  );
}
