"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RATTLE_ORDERS_ENABLED } from "@/lib/constants";
import { newIdempotencyKey, submitOrder } from "@/lib/orders/submit";
import { useDawnQty } from "./DawnQtyContext";
import { useBookCheckoutModal } from "./BookCheckoutModalContext";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function RattleCheckout() {
  const router = useRouter();
  const { qty, setQty } = useDawnQty();
  const { open, setOpen } = useBookCheckoutModal();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  // Jedan ključ po otvorenoj formi: dupli klik ili retry šalju isti ključ,
  // pa backend vrati postojeću narudžbu umjesto da napravi drugu.
  const orderKeyRef = useRef("");
  const DELIVERY = 10;
  const productPrice = 19;
  const total = productPrice * qty + DELIVERY;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!RATTLE_ORDERS_ENABLED) return;
    setSubmitting(true);
    setError(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const ime = `${formData.get("ime") || ""} ${
      formData.get("prezime") || ""
    }`.trim();

    const proizvod = "Vesele rotirajuće zvečke";
    if (!orderKeyRef.current) orderKeyRef.current = newIdempotencyKey();

    if (window.fbq) {
      window.fbq("track", "Lead", {
        content_name: proizvod,
        value: total,
        currency: "BAM",
      });
    }

    const res = await submitOrder({
      idempotencyKey: orderKeyRef.current,
      customerName: ime,
      phone: String(formData.get("tel") || ""),
      address: String(formData.get("adresa") || ""),
      city: String(formData.get("grad") || ""),
      // "Prazan" CMS zapis samo za nabavnu cijenu — vidi ADR 0002.
      productId: "prod_static_zvecke",
      productName: proizvod,
      quantity: qty,
      unitPrice: productPrice,
      shippingPrice: DELIVERY,
    });

    if (res.ok) {
      // Dugme ostaje onemogućeno do redirecta — namjerno nema
      // setSubmitting(false) na uspjehu, da se ne može kliknuti dvaput
      // dok stranica prelazi na /hvala.
      router.push(
        `/hvala?proizvod=${encodeURIComponent(proizvod)}&value=${total}`
      );
      return;
    }

    setError(true);
    setSubmitting(false);
  }

  return (
    <>
      <span id="naruci" aria-hidden="true" />
      {open && (
        <div
          className="dawn-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="dawn-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Naruči Vesele rotirajuće zvečke"
          >
            <button
              ref={closeBtnRef}
              type="button"
              className="dawn-modal-close"
              aria-label="Zatvori"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="dawn-modal-product">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/rotirajuce-zvecke/hero.png" alt="Vesele rotirajuće zvečke" />
              <div>
                <b>Vesele rotirajuće zvečke</b>
                <span>3 komada u setu</span>
              </div>
              <div className="dawn-modal-price">
                <span className="dawn-modal-price-old">39 KM</span>
                <span className="dawn-modal-price-new">19 KM</span>
              </div>
            </div>

            <div className="dawn-modal-qty">
              <span>Količina</span>
              <div className="dawn-qty" role="group" aria-label="Količina">
                <button type="button" onClick={() => setQty(qty - 1)} aria-label="Smanji količinu">−</button>
                <span className="dawn-qty-val">{qty}</span>
                <button type="button" onClick={() => setQty(qty + 1)} aria-label="Povećaj količinu">+</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="dawn-checkout-fields">
              <div className="dawn-field-row">
                <div className="dawn-field">
                  <label htmlFor="ime">Ime *</label>
                  <input type="text" id="ime" name="ime" required placeholder="Amina" />
                </div>
                <div className="dawn-field">
                  <label htmlFor="prezime">Prezime *</label>
                  <input type="text" id="prezime" name="prezime" required placeholder="Hodžić" />
                </div>
              </div>
              <div className="dawn-field">
                <label htmlFor="tel">Broj telefona *</label>
                <input type="tel" id="tel" name="tel" required placeholder="npr. 061 123 456" />
              </div>
              <div className="dawn-field">
                <label htmlFor="adresa">Ulica i broj *</label>
                <input type="text" id="adresa" name="adresa" required placeholder="Titova 15" />
              </div>
              <div className="dawn-field">
                <label htmlFor="grad">Mjesto *</label>
                <input type="text" id="grad" name="grad" required placeholder="Sarajevo" />
              </div>

              <div className="dawn-modal-delivery">
                <span className="dawn-modal-delivery-dot" aria-hidden="true" />
                Kurirska dostava, plaćanje pouzećem
                <b>{DELIVERY} KM</b>
              </div>

              {RATTLE_ORDERS_ENABLED ? (
                <button type="submit" className="dawn-btn-black" disabled={submitting}>
                  {submitting ? "Šaljem…" : `PORUČI SADA (${total} KM) →`}
                </button>
              ) : (
                <div className="dawn-checkout-paused">
                  Narudžbe ovog proizvoda trenutno nisu dostupne.
                </div>
              )}
              {error && (
                <p className="dawn-checkout-error">
                  Greška, pokušaj ponovo ili nam piši na mail.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
