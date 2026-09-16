export const ORDER_STATUSES = [
  "NEW",
  "CONFIRMED",
  "PACKING",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Nazivi statusa u adminu — baza čuva engleski kod, korisnik vidi ovo. */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "Nova",
  CONFIRMED: "Potvrđena",
  PACKING: "Pakovanje",
  SHIPPED: "Poslana",
  DELIVERED: "Dostavljena",
  RETURNED: "Vraćena",
  CANCELLED: "Otkazana",
};

/** Boja badge-a po statusu (klase su u admin.css). */
export const STATUS_CLASS: Record<OrderStatus, string> = {
  NEW: "adm-st-new",
  CONFIRMED: "adm-st-confirmed",
  PACKING: "adm-st-packing",
  SHIPPED: "adm-st-shipped",
  DELIVERED: "adm-st-delivered",
  RETURNED: "adm-st-returned",
  CANCELLED: "adm-st-cancelled",
};

export function isOrderStatus(v: unknown): v is OrderStatus {
  return typeof v === "string" && (ORDER_STATUSES as readonly string[]).includes(v);
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;

  customerName: string;
  phone: string;
  phoneNormalized: string;
  email: string;
  city: string;
  address: string;
  postalCode: string;
  note: string;

  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;

  subtotal: number;
  shippingPrice: number;
  discount: number;
  totalPrice: number;

  paymentMethod: string;
  status: OrderStatus;

  courier: string;
  trackingNumber: string;
  shippingStatus: string;
  shippedAt: string | null;
  deliveredAt: string | null;

  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
  landingPage: string;
  referrer: string;

  sheetSynced: boolean;
  sheetSyncedAt: string | null;
  sheetError: string;
  sheetAttempts: number;

  source: string;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  createdAt: string;
  kind: string;
  field: string;
  oldValue: string;
  newValue: string;
  actor: string;
  note: string;
}

/** Marketing kontekst koji stigne sa checkouta (hvata ga UtmCapture). */
export interface OrderAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  landingPage?: string;
  referrer?: string;
}

/** Ulaz u createOrder() — ovo checkout forma pošalje na /api/orders. */
export interface CreateOrderInput {
  idempotencyKey: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  email?: string;
  postalCode?: string;
  note?: string;

  productId?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;

  /** Dodatna polja koja postojeći Apps Script očekuje — prolaze kroz. */
  sheetExtras?: Record<string, unknown>;

  attribution?: OrderAttribution;
}
