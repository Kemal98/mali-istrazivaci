/**
 * Google Apps Script za primanje narudžbi sa Checkout forme.
 *
 * POSTAVKA:
 * 1. Napravi novi Google Sheet (sheets.new).
 * 2. Extensions -> Apps Script.
 * 3. Obriši sadržaj i zalijepi ovaj fajl.
 * 4. Deploy -> New deployment -> tip "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Deploy, autoriziraj pristup svom Google nalogu.
 * 6. Kopiraj "Web app URL" i zalijepi ga kao GOOGLE_SCRIPT_URL u
 *    src/lib/constants.ts.
 * 7. Pokreni "setupSheet" (vidi UREĐENJE TABELE ispod) — to će samo
 *    upisati zaglavlja (Datum..Cijena (broj)) u prvi red ako su prazna
 *    (ne dira ih ako već imaš svoj tekst), formatirati tabelu i napraviti
 *    drugi tab "Analitika" sa zbrojevima.
 *
 * UREĐENJE TABELE (jednokratno, ali bezbjedno pokrenuti i ponovo kad
 * god želiš da se Analitika osvježi):
 * U editoru, pored dugmeta "Run" izaberi funkciju "setupSheet" iz padajućeg
 * menija (umjesto doPost), pa klikni Run. Ovo:
 * - upiše nazive kolona u prvi red gdje su prazne (ne prepisuje već
 *   postojeći tvoj tekst u zaglavlju),
 * - formatira zaglavlje, fiksira prvi red, širine kolona,
 * - dodaje padajući meni za Status i boji redove po statusu,
 * - upiše formulu u kolonu L (Cijena (broj)) koja iz kolone Cijena
 *   ("58 KM") izvuče čist broj (58) — to je ono što Analitika zbraja,
 * - napravi/osvježi drugi tab zvan "Analitika" sa: ukupno narudžbi,
 *   ukupno komada, ukupan prihod, prosječna vrijednost narudžbe i
 *   raspored po statusu (Novo/Pozvano/.../Otkazano — broj i prihod za
 *   svaki).
 * Narudžbe (doPost) uvijek idu u PRVI (najlijeviji) tab, bez obzira koji
 * je tab otvoren u browseru — bitno je da Analitika ostane desno od
 * njega, ne lijevo.
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
const SITE_URL = "https://maliistrazivaci.ba";

const STATUS_OPTIONS = [
  "Novo",
  "Pozvano",
  "Potvrđeno",
  "Poslano",
  "Isporučeno",
  "Otkazano",
];

// A..L, ovim redoslijedom. "Cijena (broj)" je pomoćna kolona koju
// setupSheet() sam popuni formulom — ne upisuje se iz forme.
const HEADERS = [
  "Datum",
  "Ime",
  "Telefon",
  "Adresa",
  "Grad",
  "Uzrast",
  "Napomena",
  "Proizvod",
  "Cijena",
  "Status",
  "Količina",
  "Cijena (broj)",
];

function doPost(e) {
  // Prvi (najlijeviji) tab, ne getActiveSheet() — getActiveSheet() bi
  // pokupio koji je tab bio zadnji otvoren u browseru (npr. ako gledaš
  // "Analitika" tab kad kupac pošalje narudžbu, ona bi otišla u pogrešan
  // tab). Narudžbe uvijek idu u tab na poziciji 0.
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents);

  // Različite forme šalju količinu pod različitim imenom: SAT MIRA
  // (Checkout.tsx) šalje "qty" (1 ili 2, iz "dodaj još jedan set"
  // checkboxa), knjiga/Blinger/zvečke (BookCheckout.tsx i kopije) šalju
  // "kolicina" (iz +/- birača). Ovo hvata oboje, 1 ako ni jedno nije poslano.
  const kolicina = data.kolicina || data.qty || 1;

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
    kolicina,
  ]);
  // Kolonu L (Cijena (broj)) ne upisujemo ovdje — jedna ARRAYFORMULA u
  // L2 (postavljena od setupSheet()) sama izračuna vrijednost i za ovaj
  // novi red, čim se tabela osvježi.

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

/**
 * JEDNOKRATNO ČIŠĆENJE: obriši sve testne narudžbe (redovi sa "TEST" i
 * slično, iz debagovanja) i sve prazne redove ispod njih, do kraja tabele.
 * Sve što je OD reda 9 naniže se briše — prilagodi PRVI_RED_ZA_BRISANJE
 * ako ti je zadnja PRAVA narudžba na drugom redu.
 *
 * Pokreni jednom: pored dugmeta Run izaberi "obrisiTestPodatke", klikni
 * Run. Poslije toga je slobodno izbrisati i ovu funkciju iz koda, ili je
 * samo ostaviti (bezbjedna je pokrenuti je više puta, samo neće imati šta
 * da obriše drugi put).
 */
function obrisiTestPodatke() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const PRVI_RED_ZA_BRISANJE = 9;
  const maxRow = sheet.getMaxRows();
  if (maxRow >= PRVI_RED_ZA_BRISANJE) {
    sheet.deleteRows(PRVI_RED_ZA_BRISANJE, maxRow - PRVI_RED_ZA_BRISANJE + 1);
  }
  SpreadsheetApp.getUi().alert(
    "Gotovo — obrisano redova " + PRVI_RED_ZA_BRISANJE + " do " + maxRow + "."
  );
}

/**
 * Google Sheets na neengleskim lokalizacijama (npr. bosanski/hrvatski/
 * njemački) traži ";" između argumenata formule umjesto ",". setFormula()
 * to ne prevodi sam — formula sa "," na takvom sheetu ispadne #ERROR!.
 * Nijedna formula u ovom fajlu nema zarez unutar navodnika (u tekstu),
 * pa je bezbjedno zamijeniti sve zareze zarezom/tačka-zarezom ovisno o
 * lokalizaciji trenutnog sheeta.
 */
function fx_(ss, formula) {
  const locale = (ss.getSpreadsheetLocale() || "").toLowerCase();
  const needsSemicolon = locale.indexOf("en") !== 0; // en_US, en_GB... koriste zarez
  return needsSemicolon ? formula.replace(/,/g, ";") : formula;
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // isti tab kao doPost, ne getActiveSheet()
  const lastCol = HEADERS.length; // A..L
  const maxRows = Math.max(sheet.getMaxRows(), 500);

  // Zaglavlje: upiši naziv samo gdje je ćelija prazna (ne prepisuje tvoj
  // već postojeći tekst), pa formatiraj cijeli red bold/zeleno.
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  const existing = headerRange.getValues()[0];
  const merged = HEADERS.map((h, i) => (existing[i] ? existing[i] : h));
  headerRange.setValues([merged]);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#2e7d32");
  headerRange.setFontColor("#ffffff");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  const widths = [140, 160, 120, 200, 120, 140, 220, 180, 90, 120, 90, 110];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // Kolona L: čist broj izvučen iz kolone I ("58 KM" -> 58), jedna
  // ARRAYFORMULA koja sama pokrije sve postojeće i buduće redove.
  sheet
    .getRange(2, 12)
    .setFormula(
      fx_(
        ss,
        '=ARRAYFORMULA(IF(I2:I="","",IFERROR(VALUE(SUBSTITUTE(I2:I," KM","")),"")))'
      )
    );

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

  setupAnalytics_(ss, sheet);

  SpreadsheetApp.getUi().alert("Tabela i Analitika su uređene!");
}

/**
 * Napravi (ili osvježi) drugi tab "Analitika" sa zbirnim brojevima —
 * sve su to formule koje čitaju iz sheet-a s narudžbama, tako da se
 * same ažuriraju čim stigne nova narudžba ili promijeniš Status.
 */
function setupAnalytics_(ss, dataSheet) {
  const name = dataSheet.getName();
  let a = ss.getSheetByName("Analitika");
  if (!a) a = ss.insertSheet("Analitika");
  a.clear();
  a.clearConditionalFormatRules();

  const q = function (col) {
    return "'" + name + "'!" + col + "2:" + col;
  };

  a.getRange("A1").setValue("Analitika narudžbi");
  a.getRange("A1").setFontWeight("bold").setFontSize(14);

  a.getRange("A3").setValue("Ukupno narudžbi");
  a.getRange("B3").setFormula(fx_(ss, "=COUNTA(" + q("A") + ")"));
  a.getRange("A4").setValue("Ukupno komada (količina)");
  a.getRange("B4").setFormula(fx_(ss, "=SUM(" + q("K") + ")"));
  a.getRange("A5").setValue("Ukupan prihod (KM)");
  a.getRange("B5").setFormula(fx_(ss, "=SUM(" + q("L") + ")"));
  a.getRange("A6").setValue("Prosječna vrijednost narudžbe (KM)");
  a.getRange("B6").setFormula(fx_(ss, "=IFERROR(ROUND(B5/B3,2),0)"));

  a.getRange("A3:A6").setFontWeight("bold");
  a.getRange("B3:B6").setHorizontalAlignment("right");

  a.getRange("A8").setValue("Po statusu");
  a.getRange("A8").setFontWeight("bold").setFontSize(12);
  a.getRange("A9:C9").setValues([["Status", "Broj narudžbi", "Prihod (KM)"]]);
  a.getRange("A9:C9").setFontWeight("bold").setBackground("#2e7d32").setFontColor("#ffffff");

  STATUS_OPTIONS.forEach((status, i) => {
    const row = 10 + i;
    a.getRange(row, 1).setValue(status);
    a.getRange(row, 2).setFormula(
      fx_(ss, '=COUNTIF(' + q("J") + ',"' + status + '")')
    );
    a.getRange(row, 3).setFormula(
      fx_(ss, '=SUMIF(' + q("J") + ',"' + status + '",' + q("L") + ')')
    );
  });

  a.setColumnWidth(1, 220);
  a.setColumnWidth(2, 140);
  a.setColumnWidth(3, 140);
  a.setFrozenRows(1);
}
