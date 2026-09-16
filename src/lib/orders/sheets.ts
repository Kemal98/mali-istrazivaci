import "server-only";

import type { Order } from "./types";

/**
 * Google Sheets sync — ISKLJUČIVO server-side.
 *
 * `import "server-only"` gore: ako neko slučajno uveze ovaj modul u
 * "use client" komponentu, build padne s jasnom greškom umjesto da URL
 * tiho završi u JS bundleu koji svako može pročitati.
 *
 * VAŽNO — payload prema Apps Scriptu je BAJT-IDENTIČAN onome što su
 * checkout forme slale direktno iz browsera. Apps Script se NE mijenja i
 * NE mora se redeployati: nastavlja upisivati red u tabelu i slati Meta
 * CAPI Purchase (kojem trebaju eventId / purchaseValue / qty, pa ta polja
 * prolaze kroz nepromijenjena).
 *
 * Razlika prema starom načinu: ovaj poziv STVARNO čita odgovor. Stari
 * `mode: "no-cors"` iz browsera nije mogao vidjeti ni grešku ni uspjeh,
 * pa se narudžba mogla izgubiti bez ikakvog traga.
 */

const SHEETS_URL =
  process.env.GOOGLE_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbw2HAwC4MF3Z37SstIPtvMj60Z_KTkXVVD6JCA0gMBQbPCmdE7pKd9iLYbigsbsLgwv/exec";

// Apps Script odgovara nepredvidivo (mjereno: 0.1s, 1.5s, 3.7s, 4s, 5.7s,
// 8.8s). Sa 8s je jedan sync lažno prijavljen kao neuspio. Pošto se sync
// od sada radi POSLIJE odgovora kupcu (after()), čekanje više nikoga ne
// blokira, pa je granica podignuta.
const TIMEOUT_MS = 25000;

/** Datum u formatu koji je tabela dosad primala (bs-BA lokalizovan). */
export function sheetDatum(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("bs-BA", { timeZone: "Europe/Sarajevo" });
}

export interface SheetPayload {
  datum: string;
  ime: string;
  telefon: string;
  adresa: string;
  grad: string;
  uzrast: string;
  napomena: string;
  proizvod: string;
  kolicina: number;
  cijena: string;
  status: string;
  [extra: string]: unknown;
}

/** Sastavi payload iz narudžbe iz baze (koristi i retry iz admina). */
export function payloadFromOrder(
  order: Order,
  extras: Record<string, unknown> = {}
): SheetPayload {
  return {
    datum: sheetDatum(order.createdAt),
    ime: order.customerName,
    telefon: order.phone,
    adresa: order.address,
    grad: order.city,
    uzrast: "",
    napomena: order.note,
    proizvod: order.productName,
    kolicina: order.quantity,
    // tabela je uvijek primala UKUPAN iznos (proizvod + dostava) kao string
    cijena: `${order.totalPrice} KM`,
    status: "Novo",
    ...extras,
  };
}

export interface SheetResult {
  ok: boolean;
  error?: string;
  /**
   * Timeout je poseban slučaj: ne znamo je li Apps Script upisao red ili
   * nije. Ponovni pokušaj u tom slučaju MOŽE napraviti duplikat u tabeli,
   * pa admin na to upozori umjesto da tiho ponovi upis.
   */
  timedOut?: boolean;
}

/**
 * Pošalji narudžbu u Google Sheet. Nikad ne baca — vraća {ok:false,error}
 * da pozivalac može upisati sheet_error i nastaviti (narudžba je već u
 * bazi, njen uspjeh ne zavisi od ovoga).
 */
export async function sendToSheet(payload: SheetPayload): Promise<SheetResult> {
  if (!SHEETS_URL) return { ok: false, error: "GOOGLE_SCRIPT_URL nije postavljen" };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      redirect: "follow",
    });

    const text = await res.text();

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 300)}` };
    }
    // Apps Script vraća {"result":"success"}. Ako je deployment pokvaren,
    // Google umjesto toga vrati HTML stranicu sa greškom uz status 200 —
    // zato se gleda sadržaj, ne samo status.
    if (!text.includes("success")) {
      return {
        ok: false,
        error: `Neočekivan odgovor: ${text.slice(0, 300)}`,
      };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isTimeout = /abort/i.test(msg) || msg.includes("aborted");
    return {
      ok: false,
      timedOut: isTimeout,
      error: isTimeout
        ? `Nema odgovora od Google Sheetsa nakon ${TIMEOUT_MS / 1000}s. ` +
          `Nije poznato je li red upisan — provjerite tabelu prije ponovnog ` +
          `pokušaja, da ne nastane duplikat.`
        : msg,
    };
  } finally {
    clearTimeout(timer);
  }
}
