# Statičke proizvod-stranice dobijaju "prazan" CMS zapis samo za nabavnu cijenu

Četiri proizvoda (SAT MIRA, knjiga, zvečke, projektor) imaju svoje stare, ručno pisane stranice i checkout komponente (`Checkout.tsx`, `BookCheckout.tsx`, `RattleCheckout.tsx`, `ProjektorCheckout.tsx`) — nisu renderovane kroz CMS `[slug]` rutu. Da bi svaki od njih ipak imao mjesto za nabavnu cijenu (koju admin uređuje u istom Product editoru kao i CMS proizvode), za svaki je napravljen CMS zapis sa `id = prod_static_*`, statusom trajno `draft`, i praznim hero/sections.

Svjesno: ovi zapisi se NIKAD neće objaviti niti prikazati na sajtu. Slug im se poklapa s pravom stranicom (npr. `sat-mira`), ali to je bezopasno — Next.js uvijek prvo razriješi statičku rutu (`src/app/sat-mira/page.tsx`) prije `[slug]` catch-alla, pa čak i greškom objavljen zapis ne bi promijenio šta se prikazuje na `/sat-mira`. `kategorija` polje im nosi napomenu "Interno — nabavna cijena" da se ne pobrkaju sa pravim CMS proizvodima u `/admin/products`.

Checkout komponente tih stranica sad šalju `productId: "prod_static_*"` da narudžba pri kreiranju povuče nabavnu cijenu (vidi `service.ts createOrder`).
