// Poštanski brojevi za A2B izvoz. Kupac grad upiše slobodnim tekstom
// (nema padajuće liste), pa se poredi bez dijakritike/veličine slova.
// Nepoznat grad ostaje bez broja — admin ga dopiše ručno prije upload-a
// u A2B, izvoz zbog toga NIKAD ne smije pući.
const POSTAL_CODES: Record<string, string> = {
  sarajevo: "71000",
  "banja luka": "78000",
  tuzla: "75000",
  mostar: "88000",
  zenica: "72000",
  bijeljina: "76300",
  prijedor: "79101",
  brcko: "76100",
  doboj: "74000",
  cazin: "77220",
  zivinice: "75270",
  gracanica: "75320",
  visoko: "71300",
  konjic: "88400",
  livno: "80101",
  trebinje: "89101",
  gorazde: "73000",
  travnik: "72270",
  bihac: "77000",
  gradacac: "76250",
  kakanj: "72240",
  zavidovici: "72220",
  srebrenik: "75350",
  lukavac: "75300",
  capljina: "88300",
  "siroki brijeg": "88220",
  "sanski most": "79260",
  foca: "73300",
  "velika kladusa": "77230",
  ilidza: "71210",
  "istocno sarajevo": "71123",
  "istocno novo sarajevo": "71123",
  vogosca: "71320",
  "hadzici": "71240",
  "bugojno": "70230",
  "gracac": "75320",
  "jajce": "70101",
  "kiseljak": "71250",
  "fojnica": "71270",
  "olovo": "71340",
  "visegrad": "73240",
  "bratunac": "75420",
  "srebrenica": "75430",
  "zvornik": "75400",
  "kalesija": "75260",
  "banovici": "75290",
  "derventa": "74400",
  "gradiska": "78400",
  "laktasi": "78250",
  "modrica": "74480",
  "bileca": "89230",
  "citluk": "88260",
  "posusje": "88240",
  "ljubuski": "88320",
  "tomislavgrad": "80240",
  "bosanska krupa": "77240",
  "kljuc": "79280",
  "bosanski petrovac": "77250",
  "buzim": "77245",
};

function normalizeCity(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // skini dijakritiku (č,ć,š,ž,đ -> c,c,s,z,d)
    .replace(/\s+/g, " ");
}

/** Poštanski broj za grad, ili "" ako nije u tabeli — admin ga tad upisuje ručno. */
export function postalCodeFor(city: string): string {
  return POSTAL_CODES[normalizeCity(city)] ?? "";
}
