/**
 * Google Apps Script za primanje narudžbi sa Checkout forme.
 *
 * POSTAVKA:
 * 1. Napravi novi Google Sheet (sheets.new).
 * 2. U prvi red (A1:J1) upiši zaglavlja, ovim redoslijedom:
 *    Datum | Ime | Telefon | Adresa | Grad | Uzrast | Napomena | Proizvod | Cijena | Status
 * 3. Extensions -> Apps Script.
 * 4. Obriši sadržaj i zalijepi ovaj fajl.
 * 5. Deploy -> New deployment -> tip "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Deploy, autoriziraj pristup svom Google nalogu.
 * 7. Kopiraj "Web app URL" i zalijepi ga kao GOOGLE_SCRIPT_URL u
 *    src/components/Checkout.tsx.
 *
 * UREĐENJE TABELE (jednokratno):
 * U editoru, pored dugmeta "Run" izaberi funkciju "setupSheet" iz padajućeg
 * menija (umjesto doPost), pa klikni Run. Ovo formatira zaglavlje, fiksira
 * prvi red, dodaje padajući meni za Status i boji redove po statusu.
 * Bezbjedno je pokrenuti je više puta.
 *
 * Napomena: ako kasnije mijenjaš kod skripte, moraš napraviti
 * "New deployment" ponovo (ili Manage deployments -> Edit -> New version)
 * da bi izmjene bile aktivne na postojećem URL-u. Za setupSheet to nije
 * potrebno jer se ne pokreće preko web app URL-a, nego ručno iz editora.
 */

const STATUS_OPTIONS = [
  "Novo",
  "Pozvano",
  "Potvrđeno",
  "Poslano",
  "Isporučeno",
  "Otkazano",
];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.datum,
    data.ime,
    data.telefon,
    data.adresa,
    data.grad,
    data.uzrast,
    data.napomena,
    data.proizvod,
    data.cijena,
    data.status,
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ result: "success" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastCol = 10; // A..J
  const maxRows = Math.max(sheet.getMaxRows(), 500);

  // Zaglavlje: bold, boja, fiksiran red, širine kolona
  const header = sheet.getRange(1, 1, 1, lastCol);
  header.setFontWeight("bold");
  header.setBackground("#2e7d32");
  header.setFontColor("#ffffff");
  header.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  const widths = [140, 160, 120, 200, 120, 140, 220, 180, 90, 120];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // Padajući meni za Status (kolona J)
  const statusRange = sheet.getRange(2, 10, maxRows - 1, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_OPTIONS, true)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(rule);

  // Filter na cijelu tabelu
  const fullRange = sheet.getRange(1, 1, maxRows, lastCol);
  const existingFilter = sheet.getFilter();
  if (existingFilter) existingFilter.remove();
  fullRange.createFilter();

  // Uslovno bojanje reda po statusu (na osnovu kolone J)
  sheet.clearConditionalFormatRules();
  const dataRange = sheet.getRange(2, 1, maxRows - 1, lastCol);
  const rules = [
    { value: "Novo", color: "#fff3cd" },
    { value: "Pozvano", color: "#cfe2ff" },
    { value: "Potvrđeno", color: "#d1ecf1" },
    { value: "Poslano", color: "#e2d9f3" },
    { value: "Isporučeno", color: "#d4edda" },
    { value: "Otkazano", color: "#f8d7da" },
  ].map((r) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$J2="' + r.value + '"')
      .setBackground(r.color)
      .setRanges([dataRange])
      .build()
  );
  sheet.setConditionalFormatRules(rules);

  SpreadsheetApp.getUi().alert("Tabela je uređena!");
}
