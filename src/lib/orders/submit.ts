import { getAttribution } from "./attribution";

/**
 * Klijentski helper koji checkout forme koriste umjesto direktnog
 * fetch-a na Google Apps Script.
 *
 * Šta se za kupca mijenja: ništa. Ista forma, isti tekst, isti redirect
 * na /hvala, ista cijena. Razlika je samo gdje request ide — sada na
 * vlastiti backend, koji narudžbu prvo spremi u bazu pa je proslijedi u
 * Google Sheet.
 */

export interface SubmitOrderInput {
  idempotencyKey: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
  productId?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;
  /** Polja koja postojeći Apps Script koristi za Meta CAPI (eventId itd.). */
  sheetExtras?: Record<string, unknown>;
}

export interface SubmitOrderResult {
  ok: boolean;
  orderNumber?: string;
  error?: string;
}

/**
 * Napravi idempotency ključ za JEDAN pokušaj naručivanja.
 *
 * Komponenta ga generiše jednom i drži u ref-u: ako kupac dvaput klikne
 * ili mreža napravi retry, backend prepozna isti ključ i vrati POSTOJEĆU
 * narudžbu umjesto da napravi drugu.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const HVALA_FLAG_KEY = "hvala_ok";

/**
 * Dozvoljava JEDAN naredni Purchase pixel fire na /hvala.
 *
 * Zašto: /hvala?proizvod=X&value=Y je dosad palio Meta Purchase event
 * SAMO na osnovu URL parametara, bez provjere da je narudžba stvarno
 * uspjela. Bilo ko ko pogodi/otvori taj URL (bot, radoznao posjetitelj,
 * refresh, povratak na stranicu) upisao je Meta-i lažnu kupovinu — zato
 * su se u Ads Manageru vidjele konverzije bez odgovarajuće narudžbe.
 * Zastavica se postavlja TEK nakon što backend potvrdi narudžbu (ok:true)
 * i odmah se potroši (pročita i obriše) u HvalaContent, pa ni refresh
 * /hvala stranice ne pali drugi Purchase za istu narudžbu.
 */
export function markHvalaPurchaseAllowed() {
  try {
    sessionStorage.setItem(HVALA_FLAG_KEY, "1");
  } catch {
    // privatni mod i sl. — pixel se tad jednostavno ne pali, bolje nego pucanje
  }
}

export function consumeHvalaPurchaseAllowed(): boolean {
  try {
    const ok = sessionStorage.getItem(HVALA_FLAG_KEY) === "1";
    sessionStorage.removeItem(HVALA_FLAG_KEY);
    return ok;
  } catch {
    return false;
  }
}

export async function submitOrder(
  input: SubmitOrderInput
): Promise<SubmitOrderResult> {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, attribution: getAttribution() }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      orderNumber?: string;
      error?: string;
    };

    if (!res.ok) {
      return { ok: false, error: data?.error || "Greška pri slanju narudžbe." };
    }
    return { ok: true, orderNumber: data.orderNumber };
  } catch {
    return {
      ok: false,
      error: "Nema veze sa internetom. Pokušajte ponovo.",
    };
  }
}
