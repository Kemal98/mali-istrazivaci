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
