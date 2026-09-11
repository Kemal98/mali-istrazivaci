export const META_PIXEL_ID = "2651862191901133";

// Microsoft Clarity — besplatna analitika (snimci sesija, heatmape).
// Project ID iz clarity.microsoft.com -> Setup -> Install tracking code.
export const CLARITY_PROJECT_ID = "ygt72mg3p1";

// Google Analytics 4 — brojevi (posjete, izvori saobraćaja, koliko dugo
// ostaju). Measurement ID iz analytics.google.com -> Data stream -> Web.
export const GA_MEASUREMENT_ID = "G-61J7H2693T";

export const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw2HAwC4MF3Z37SstIPtvMj60Z_KTkXVVD6JCA0gMBQbPCmdE7pKd9iLYbigsbsLgwv/exec";

export const CONTACT_EMAIL = "svijetistrazivaca@gmail.com";

// Narudžbe knjige — ponovo uključeno na izričit zahtjev (bilo isključeno
// od ranije u sesiji; ne znam tačan izvorni razlog pauze, samo da je
// eksplicitno zatraženo da forma opet radi).
export const BOOK_ORDERS_ENABLED = true;

// Blinger — uključeno na izričit zahtjev. Cijena i slika su stvarne.
export const BLINGER_ORDERS_ENABLED = true;

// Rotirajuće zvečke — uključeno na izričit zahtjev. Cijena i slika su
// stvarne.
export const RATTLE_ORDERS_ENABLED = true;

// Projektor za crtanje — nova podstranica. Isključeno dok se ne potvrde
// stvarne fotografije proizvoda, tvoja prodajna cijena (26/35 KM je uzeto
// s referentne stranice, nije potvrđeno da je to tvoja cijena) i zalihe.
export const PROJECTOR_ORDERS_ENABLED = false;

export const SOCIAL_INSTAGRAM =
  "https://www.instagram.com/svijetmalihistrazivaca/";
export const SOCIAL_FACEBOOK =
  "https://www.facebook.com/profile.php?id=61573686568473";

// Sezonska poruka u sekciji ponude, ispod cijene — mijenjaj kroz godinu.
// PAZI: ne stavljaj ovdje svoj rok naručivanja (npr. "naruči do petka") —
// ako ga kupac ne ispoštuje na vrijeme, poruka djeluje neistinito. Ova
// poruka je samo sezonski kontekst, bez vlastitog datuma/roka.
// Primjeri za rotaciju:
//   Kolovoz/septembar: "Naruči ovih dana i stiže prije prve sedmice vrtića."
//   Novembar/decembar: "Stiže na vrijeme za Novu godinu uz redovnu dostavu."
//   Mart/april: "Za dane kad je vani još hladno."
//   Juni/juli: "Za dugu vožnju do mora."
export const SEASONAL_MESSAGE =
  "Naruči ovih dana i stiže prije prve sedmice vrtića.";
