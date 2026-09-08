export const META_PIXEL_ID = "2651862191901133";

export const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw2HAwC4MF3Z37SstIPtvMj60Z_KTkXVVD6JCA0gMBQbPCmdE7pKd9iLYbigsbsLgwv/exec";

export const CONTACT_EMAIL = "svijetistrazivaca@gmail.com";

// Narudžbe knjige su privremeno isključene — vrati na true kad se ponovo
// otvore. Dijeljeno između BookHero.tsx (dugme na vrhu) i BookCheckout.tsx
// (forma na dnu) da oba mjesta uvijek pokazuju isto stanje.
export const BOOK_ORDERS_ENABLED = false;

// Blinger je nov proizvod, tek se gradi stranica — cijena je privremena
// (nema stvarnog broja), nema prave fotografije. Namjerno isključeno dok
// se to ne potvrdi, da se ne prime prave narudžbe za nešto što možda još
// nije stvarno spremno za prodaju. Prebaci na true kad potvrdiš cijenu,
// sliku i da imaš zalihe.
export const BLINGER_ORDERS_ENABLED = false;

// Isto kao BLINGER_ORDERS_ENABLED — cijena i slike su sad stvarne, ali
// zalihe nisu potvrđene. Prebaci na true kad potvrdiš da imaš zalihe.
export const RATTLE_ORDERS_ENABLED = false;

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
