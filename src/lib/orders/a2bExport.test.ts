import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { buildA2bWorkbook } from "./a2bExport";
import type { Order } from "./types";

function fakeOrder(patch: Partial<Order>): Order {
  return {
    id: "ord_1",
    orderNumber: "MI-000251",
    createdAt: "2026-10-06T10:00:00.000Z",
    updatedAt: "2026-10-06T10:00:00.000Z",
    customerName: "Amina Hodžić",
    phone: "+38761400866",
    phoneNormalized: "61400866",
    email: "",
    city: "Sarajevo",
    address: "Armije bih 386",
    postalCode: "",
    note: "",
    productId: null,
    productName: "SAT MIRA set 3u1",
    quantity: 1,
    unitPrice: 29,
    bundleLabel: "",
    subtotal: 29,
    shippingPrice: 10,
    discount: 0,
    totalPrice: 39,
    costPrice: 0,
    costTotal: 0,
    paymentMethod: "pouzecem",
    status: "NEW",
    courier: "",
    trackingNumber: "",
    shippingStatus: "",
    shippedAt: null,
    deliveredAt: null,
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmContent: "",
    utmTerm: "",
    fbclid: "",
    landingPage: "",
    referrer: "",
    sheetSynced: false,
    sheetSyncedAt: null,
    sheetError: "",
    sheetAttempts: 0,
    source: "web",
    linkedOrderId: "",
    ...patch,
  };
}

describe("buildA2bWorkbook", () => {
  it("list se zove 'Report', ima tačan header red i kontrolni red", async () => {
    const { buffer } = await buildA2bWorkbook([fakeOrder({})]);
    const wb = new ExcelJS.Workbook();
    // exceljs-ovi tipovi očekuju noviji Buffer oblik nego naš @types/node —
    // u runtime-u je ovo stvaran, ispravan Buffer, samo se tipovi sudaraju.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(buffer as any);
    const sheet = wb.getWorksheet("Report");
    expect(sheet).toBeDefined();

    const header = sheet!.getRow(1).values as unknown[];
    expect(header[1]).toBe("ID Broj Posiljke");
    expect(header[2]).toBe("Ime i Prezime");
    expect(header[20]).toBe("Povrat otkupnine u sigurnosnoj vrecici");

    const controlRow = sheet!.getRow(2).values as unknown[];
    expect(controlRow[1]).toBe("Kontrolni red ostaje prazan");
    expect(controlRow[2]).toBeUndefined();
  });

  it("upisuje narudžbu na red 3, adresa razdvojena, telefon sa vodećom nulom", async () => {
    const { buffer } = await buildA2bWorkbook([fakeOrder({})]);
    const wb = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(buffer as any);
    const sheet = wb.getWorksheet("Report")!;
    const row = sheet.getRow(3).values as unknown[];

    expect(row[2]).toBe("Amina Hodžić"); // Ime i Prezime
    expect(row[4]).toBe("Armije bih"); // Ulica
    expect(row[5]).toBe(386); // Broj (gole cifre -> broj)
    expect(row[8]).toBe("061400866"); // Kontakt telefon, vodeća nula
    expect(row[9]).toBe(1); // Broj koleta
    expect(row[10]).toBe("1,000"); // Tezina
    expect(row[11]).toBe("39,00"); // Otkupnina = totalPrice
    expect(row[12]).toBe("MI-000251"); // Interna referenca
    // Plaća/Način plaćanja/Povrat.../Dostava Subotom/... ostaju prazni
    expect(row[15]).toBe("");
    expect(row[17]).toBe("");
  });

  it("vraća brojeve narudžbi kojima fali poštanski broj", async () => {
    const { missingPostal } = await buildA2bWorkbook([
      fakeOrder({ id: "ord_a", orderNumber: "MI-000251", city: "Sarajevo", postalCode: "" }),
      fakeOrder({ id: "ord_b", orderNumber: "MI-000252", city: "Doboj 74000", postalCode: "" }),
    ]);
    expect(missingPostal).toEqual(["MI-000251"]);
  });

  it("cross-sell dodatak (linked_order_id) se spaja u JEDAN red sa glavnom narudžbom", async () => {
    const glavna = fakeOrder({
      id: "ord_glavna",
      orderNumber: "MI-000251",
      totalPrice: 39,
      linkedOrderId: "",
    });
    const dodatak = fakeOrder({
      id: "ord_dodatak",
      orderNumber: "MI-000252",
      totalPrice: 15,
      shippingPrice: 0,
      linkedOrderId: "ord_glavna",
    });
    const { buffer } = await buildA2bWorkbook([glavna, dodatak]);
    const wb = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(buffer as any);
    const sheet = wb.getWorksheet("Report")!;

    // Samo JEDAN red narudžbe (red 3) — dodatak se NE pojavljuje kao svoj red.
    expect(sheet.getRow(4).values).toEqual([]);

    const row = sheet.getRow(3).values as unknown[];
    expect(row[11]).toBe("54,00"); // Otkupnina = 39 (glavna) + 15 (dodatak)
    expect(row[12]).toBe("MI-000251+MI-000252"); // Interna referenca spaja oba broja
  });

  it("dodatak bez glavne narudžbe u istom izvozu ide kao samostalna pošiljka", async () => {
    const dodatak = fakeOrder({
      id: "ord_dodatak",
      orderNumber: "MI-000252",
      totalPrice: 15,
      linkedOrderId: "ord_ne_postoji_u_ovom_izvozu",
    });
    const { buffer } = await buildA2bWorkbook([dodatak]);
    const wb = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(buffer as any);
    const sheet = wb.getWorksheet("Report")!;
    const row = sheet.getRow(3).values as unknown[];
    expect(row[11]).toBe("15,00");
    expect(row[12]).toBe("MI-000252");
  });
});
