# Mali Istraživači — webshop

Webshop za dječije proizvode (trenutno 2 artikla, cilj ~10 u rotaciji), prodaja pretežno preko Facebook/Instagram reklama, plaćanje pouzećem (cash-on-delivery). Jedan operater (vlasnik) vodi marketing, narudžbe i logistiku.

## Language

**Narudžba**:
Jedan zapis nastao kad kupac popuni checkout formu — jedan proizvod, jedna količina, jedan kupac. Ide prvo u bazu (izvor istine), pa asinhrono u Google Sheet (legacy, za Meta CAPI).
_Avoid_: order, kupovina

**Prihod**:
Vrijednost prodatih proizvoda (`subtotal`) bez dostave. Dostavu plaća kupac kuriru — vlasnik s njom nema veze, pa se NIKAD ne računa kao zarada.
_Avoid_: bruto, promet (kad se misli na prihod — promet može uključivati i dostavu, pa je dvosmisleno)

**Kurir naplati**:
Ukupan iznos koji kurir uzima od kupca pri dostavi (`total_price` = proizvod + dostava). Operativna cifra za kurira, nije prihod.
_Avoid_: ukupno, total (bez konteksta — mora biti jasno da uključuje dostavu)

**Nabavna cijena**:
Koliko je vlasnik platio za jedan komad proizvoda dobavljaču. Trenutno se ne čuva nigdje u sistemu — računa se ručno na kalkulatoru. Zajedno s prihodom i troškom reklame daje pravu maržu.
_Avoid_: cost, trošak robe

**Status narudžbe**:
Jedno od 7 stanja (Bosanski nazivi) koje prati put narudžbe od prijema do isporuke ili povrata/otkazivanja. Mijenja se ručno u adminu ili u bulk akciji.
_Avoid_: status, state

**Red za pakovanje**:
Sve narudžbe u statusu Nova/Potvrđena/Pakovanje (još nisu poslane), od najstarije ka najnovijoj. Prikazano na `/pakovanje/[token]` — javna ruta bez logina, vidi [ADR 0001](./docs/adr/0001-lista-za-pakovanje-bez-logina.md).
_Avoid_: pending orders, queue
