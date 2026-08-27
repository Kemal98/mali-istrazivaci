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
 *
 * META CONVERSIONS API (server-side Purchase, pored browser pixela):
 * 1. Events Manager -> tvoj pixel -> Settings -> odjeljak "Conversions API"
 *    -> "Generate access token" (ili "Set up" -> "Konfiguriši ručno").
 * 2. Zalijepi taj token ispod kao META_CAPI_ACCESS_TOKEN.
 * 3. Zalijepi svoju pravu domenu ispod kao SITE_URL.
 * 4. Deploy -> Manage deployments -> Edit -> New version (da izmjene
 *    postanu aktivne na postojećem URL-u).
 * Dok je META_CAPI_ACCESS_TOKEN prazan/placeholder, ovaj dio se samo
 * tiho preskače — narudžbe i dalje normalno idu u tabelu.
 */

const META_PIXEL_ID = "2651862191901133";
// TODO: zamijeni pravim CAPI tokenom iz Events Managera (Settings ->
// Conversions API -> Generate access token)
const META_CAPI_ACCESS_TOKEN = "TVOJ_CAPI_TOKEN";
// TODO: zamijeni pravom domenom sajta
const SITE_URL = "https://mali-istrazivaci.vercel.app";

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

  sendPurchaseToMeta_(data);

  return ContentService.createTextOutput(
    JSON.stringify({ result: "success" })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Šalje Purchase event Meti server-side (Conversions API), sa istim
 * eventId koji šalje i browser pixel na /hvala stranici — Meta ih
 * deduplicira u jedan event umjesto da broji dvaput. Ne baca grešku
 * naružbenom procesu ako ovo ne uspije (npr. token nije postavljen).
 */
function sendPurchaseToMeta_(data) {
  if (!META_CAPI_ACCESS_TOKEN || META_CAPI_ACCESS_TOKEN === "TVOJ_CAPI_TOKEN")
    return;
  if (!data.eventId) return; // stariji/knjiga-checkout ne šalje eventId

  try {
    const userData = {};
    if (data.telefon) {
      userData.ph = [sha256Hex_(normalizePhone_(String(data.telefon)))];
    }

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: data.eventId,
          action_source: "website",
          event_source_url: SITE_URL + "/hvala",
          user_data: userData,
          custom_data: {
            currency: "BAM",
            value: data.purchaseValue || 0,
            content_name: "SAT MIRA set 3u1",
            content_ids: ["sat-mira-3u1"],
            content_type: "product",
            contents: [{ id: "sat-mira-3u1", quantity: data.qty || 1 }],
            num_items: data.qty || 1,
          },
        },
      ],
      access_token: META_CAPI_ACCESS_TOKEN,
    };

    UrlFetchApp.fetch(
      "https://graph.facebook.com/v21.0/" + META_PIXEL_ID + "/events",
      {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      }
    );
  } catch (err) {
    // Ne prekidaj obradu narudžbe zbog CAPI greške — narudžba je već
    // upisana u tabelu, to je najvažnije.
    Logger.log("Meta CAPI greška: " + err);
  }
}

/** BiH broj -> samo cifre sa pozivnim brojem 387, bez vodeće nule/plusa. */
function normalizePhone_(raw) {
  let digits = raw.replace(/\D/g, "");
  if (digits.indexOf("00") === 0) digits = digits.slice(2);
  if (digits.indexOf("0") === 0) digits = "387" + digits.slice(1);
  if (digits.indexOf("387") !== 0) digits = "387" + digits;
  return digits;
}

function sha256Hex_(str) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    str,
    Utilities.Charset.UTF_8
  );
  return digest
    .map(function (byte) {
      const v = (byte < 0 ? byte + 256 : byte).toString(16);
      return v.length === 1 ? "0" + v : v;
    })
    .join("");
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
