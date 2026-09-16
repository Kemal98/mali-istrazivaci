"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { newIdempotencyKey, submitOrder } from "@/lib/orders/submit";
import { useDawnQty } from "@/components/DawnQtyContext";
import { useBookCheckoutModal } from "@/components/BookCheckoutModalContext";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// GENERIČKI checkout za CMS proizvode.
//
// VAŽNO: mehanika je 1:1 ista kao postojeći RattleCheckout —
// isti <span id="naruci"> anchor (PixelEvents sluša klik na a[href="#naruci"]),
// isti fbq "Lead" event i isti redirect na /hvala. Ne pravi se paralelni
// checkout. Narudžba ide na /api/orders (baza + Google Sheet), a ne više
// direktno u Sheet iz browsera.
export default function CmsCheckout({
  naziv,
  cijena,
  slika,
  podnaslov,
  staraCijena,
  productId,
}: {
  naziv: string;
  cijena: number;
  slika?: string;
  podnaslov?: string;
  staraCijena?: number | null;
  productId?: string | null;
}) {
  const router = useRouter();
  const { qty, setQty } = useDawnQty();
  const { open, setOpen } = useBookCheckoutModal();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  // Jedan ključ po otvorenoj formi: dupli klik ili retry šalju isti
  // ključ, pa backend vrati postojeću narudžbu umjesto da napravi drugu.
  const orderKeyRef = useRef("");
  const DELIVERY = 10;
  const total = cijena * qty + DELIVERY;

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
    setSubmitting(true);
    setError(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const ime = `${formData.get("ime") || ""} ${
      formData.get("prezime") || ""
    }`.trim();

    if (!orderKeyRef.current) orderKeyRef.current = newIdempotencyKey();

    if (window.fbq) {
      window.fbq("track", "Lead", {
        content_name: naziv,
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
      productId: productId ?? null,
      productName: naziv,
      quantity: qty,
      unitPrice: cijena,
      shippingPrice: DELIVERY,
    });

    if (res.ok) {
      // Namjerno bez setSubmitting(false) na uspjehu — dugme ostaje
      // onemogućeno dok stranica prelazi na /hvala.
      router.push(
        `/hvala?proizvod=${encodeURIComponent(naziv)}&value=${total}`
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
            aria-label={`Naruči ${naziv}`}
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
              {slika ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={slika} alt={naziv} />
              ) : (
                <div className="dawn-modal-product-placeholder" aria-hidden="true" />
              )}
              <div>
                <b>{naziv}</b>
                {podnaslov ? <span>{podnaslov}</span> : null}
              </div>
              <div className="dawn-modal-price">
                {staraCijena ? (
                  <span className="dawn-modal-price-old">{staraCijena} KM</span>
                ) : null}
                <span className="dawn-modal-price-new">{cijena} KM</span>
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

              <button type="submit" className="dawn-btn-black" disabled={submitting}>
                {submitting ? "Šaljem…" : `PORUČI SADA (${total} KM) →`}
              </button>

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
