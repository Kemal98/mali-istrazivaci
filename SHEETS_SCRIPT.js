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
 * Napomena: ako kasnije mijenjaš kod skripte, moraš napraviti
 * "New deployment" ponovo (ili Manage deployments -> Edit -> New version)
 * da bi izmjene bile aktivne na postojećem URL-u.
 */
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
