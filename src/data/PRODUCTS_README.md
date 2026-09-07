# Kako dodati novi proizvod

Mreža proizvoda na početnoj (`/`, sekcija "Najprodavanije") se puni
isključivo iz `src/data/products.json`. Da dodaš proizvod, ne diraš nijedan
`.tsx` fajl — samo dodaš novi objekat u taj JSON niz.

## Polja

| Polje           | Tip                  | Objašnjenje                                                                 |
| --------------- | -------------------- | ---------------------------------------------------------------------------- |
| `id`            | string               | Jedinstven, bez razmaka (npr. `"drveni-sat"`). Koristi se kao React key.     |
| `naziv`         | string               | Naziv koji se prikazuje na kartici i u naslovu.                              |
| `podnaslov`     | string               | Trenutno se ne prikazuje na kartici (rezervisano za proizvod-stranicu).      |
| `cijena`        | broj                 | Trenutna cijena, bez valute.                                                 |
| `staraCijena`   | broj \| `null`       | Precrtana cijena. `null` ako nema popusta.                                   |
| `valuta`        | string               | Skoro uvijek `"KM"`.                                                         |
| `badge`         | string \| `null`     | Tekst značke gore lijevo na slici (npr. `"NOVO"`, `"-30%"`). `null` = ništa.  |
| `uzrast`        | string[]             | Jedna ili obje vrijednosti: `"2-3"`, `"4-6"`. Koristi ih sekcija "Po uzrastu".|
| `kategorije`    | string[]             | Slobodan tekst, za buduće filtriranje (nije još povezano u UI).              |
| `slike`         | string[]             | Putanje iz `/public/img/`. Koristi se `slike[0]` na kartici.                 |
| `ocjena`        | broj                 | Npr. `4.9`.                                                                   |
| `brojRecenzija` | broj                 | Cijeli broj.                                                                  |
| `naStanju`      | boolean              | `false` prigušuje karticu i ispisuje "Rasprodano".                           |
| `link`          | string               | Kuda kartica vodi. Stvarna stranica (npr. `/sat-mira`) ili `"#"` dok ne postoji.|

## Primjer

```json
{
  "id": "drveni-sat",
  "naziv": "Drveni sat sa brojevima",
  "podnaslov": "Montessori igračka za učenje brojeva",
  "cijena": 20,
  "staraCijena": null,
  "valuta": "KM",
  "badge": "NOVO",
  "uzrast": ["4-6"],
  "kategorije": ["drvene-igracke"],
  "slike": ["/img/igracke-izbor1.png"],
  "ocjena": 4.8,
  "brojRecenzija": 5,
  "naStanju": true,
  "link": "#"
}
```

Zalijepi ovo kao novi element u nizu u `products.json`, sačuvaj — gotovo.
Mreža, "Po uzrastu" filter (`/?uzrast=4-6`) i "Rasprodano" stanje rade
automatski, ništa se ne rekompajlira ručno (Next.js sam prati promjenu na
sljedećem buildu/deployu).

## Trenutno stanje

`sat-mira` je jedini pravi proizvod — vodi na `/sat-mira` (postojeća,
netaknuta stranica koja nosi reklame). Ostalih 5 stavki su placeholderi,
jasno označeni sa `[PLACEHOLDER]` u nazivu i `link: "#"` — obriši ih ili
zamijeni pravim proizvodima kad budu spremni. Nemoj samo skinuti prefiks
iz naziva a ostaviti `link: "#"` — kartica bi izgledala kao pravi
proizvod koji nikuda ne vodi.
