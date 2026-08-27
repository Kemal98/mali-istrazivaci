export const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw2HAwC4MF3Z37SstIPtvMj60Z_KTkXVVD6JCA0gMBQbPCmdE7pKd9iLYbigsbsLgwv/exec";

// TODO: zamijeni pravim brojem telefona kad bude poznat
export const PHONE_TEL = "+38760000000";
export const PHONE_DISPLAY = "06X XXX XXX";

// Sezonska poruka u sekciji ponude, ispod cijene — mijenjaj kroz godinu.
// PAZI: ne stavljaj ovdje svoj rok naručivanja (npr. "naruči do petka") —
// to se kosi sa BONUS_DEADLINE rokom prikazanim drugdje na stranici (top
// traka, bonus blok, završni CTA) i kupac ne zna koji rok vrijedi. Ova
// poruka je samo sezonski kontekst, bez vlastitog datuma/roka.
// Primjeri za rotaciju:
//   Kolovoz/septembar: "Naruči ovih dana i stiže prije prve sedmice vrtića."
//   Novembar/decembar: "Stiže na vrijeme za Novu godinu uz redovnu dostavu."
//   Mart/april: "Za dane kad je vani još hladno."
//   Juni/juli: "Za dugu vožnju do mora."
export const SEASONAL_MESSAGE =
  "Naruči ovih dana i stiže prije prve sedmice vrtića.";
