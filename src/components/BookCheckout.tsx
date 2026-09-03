"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GOOGLE_SCRIPT_URL } from "@/lib/constants";
import { useDawnQty } from "./DawnQtyContext";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Narudžbe knjige su privremeno isključene — vrati na true kad se
// ponovo otvore (i po želji razdvoji thank-you stranicu, vidi razgovor).
const BOOK_ORDERS_ENABLED = false;

export default function BookCheckout() {
  const router = useRouter();
  const { qty } = useDawnQty();
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const DELIVERY = 10;
  const productPrice = 15;
  const total = productPrice * qty + DELIVERY;

  // Bilo koji "NARUČI" link na stranici vodi na href="#naruci" (tako ostaje
  // netaknuto praćenje InitiateCheckout u PixelEvents.tsx). Kad se hash
  // promijeni na #naruci, otvaramo formu — nije dovoljan samo scroll.
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#naruci") setRevealed(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!BOOK_ORDERS_ENABLED) return;
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
      uzrast: "",
      napomena: formData.get("napomena"),
      proizvod: "Interaktivna Montessori knjiga",
      kolicina: qty,
      cijena: `${total} KM`,
      status: "Novo",
    };

    if (window.fbq) {
      window.fbq("track", "Lead", {
        content_name: "Interaktivna Montessori knjiga",
        value: total,
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
      router.push(
        `/hvala?proizvod=${encodeURIComponent(data.proizvod)}&value=${total}`
      );
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dawn-checkout" id="naruci">
      <div className="dawn-col">
        {!revealed ? (
          <div className="dawn-checkout-summary">
            <div className="dawn-checkout-line">
              <span>Interaktivna Montessori knjiga × {qty}</span>
              <span>{total} KM</span>
            </div>
            <p className="dawn-checkout-note">
              Uključena dostava od {DELIVERY} KM · Plaćanje pouzećem
            </p>
            <button
              type="button"
              className="dawn-btn-black"
              onClick={() => setRevealed(true)}
            >
              NARUČI — PLATIŠ KURIRU
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="dawn-checkout-fields">
            <div className="dawn-field">
              <label htmlFor="ime">Ime i prezime *</label>
              <input
                type="text"
                id="ime"
                name="ime"
                required
                placeholder="npr. Amina Hodžić"
              />
            </div>
            <div className="dawn-field">
              <label htmlFor="tel">Telefon *</label>
              <input
                type="tel"
                id="tel"
                name="tel"
                required
                placeholder="npr. 061 123 456"
              />
            </div>
            <div className="dawn-field">
              <label htmlFor="adresa">Adresa *</label>
              <input
                type="text"
                id="adresa"
                name="adresa"
                required
                placeholder="npr. Titova 15"
              />
            </div>
            <div className="dawn-field">
              <label htmlFor="grad">Grad *</label>
              <input
                type="text"
                id="grad"
                name="grad"
                required
                placeholder="npr. Sarajevo"
              />
            </div>
            <div className="dawn-field">
              <label htmlFor="napomena">Napomena (opcionalno)</label>
              <textarea id="napomena" name="napomena" rows={2} />
            </div>

            <div className="dawn-checkout-line">
              <span>Ukupno ({qty} kom + dostava)</span>
              <span>{total} KM</span>
            </div>

            {BOOK_ORDERS_ENABLED ? (
              <button
                type="submit"
                className="dawn-btn-black"
                disabled={submitting}
              >
                {submitting ? "Šaljem…" : "POTVRDI NARUDŽBU"}
              </button>
            ) : (
              <div className="dawn-checkout-paused">
                Narudžbe knjige trenutno nisu dostupne.
              </div>
            )}
            {error && (
              <p className="dawn-checkout-error">
                Greška — pokušaj ponovo ili nam piši na mail.
              </p>
            )}
            <p className="dawn-cta-note">
              Ne plaćaš ništa unaprijed · Dostava po cijeloj BiH
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
