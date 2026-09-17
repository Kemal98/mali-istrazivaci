# Lista za pakovanje je javna ruta zaštićena tokenom u URL-u, ne login sesijom

`/pakovanje/[token]` namjerno NIJE pod `/admin/*` (koji `proxy.ts` štiti pravom sesijom). Osoba koja pakuje (vlasnikova majka, nije tehnički potkovana) treba samo da otvori sačuvanu prečicu na telefonu — bez lozinke, bez login ekrana. Zaštita je dovoljno dug slučajan token (`PACKING_LIST_TOKEN`) u samom URL-u, poređen timing-safe.

Svjesna žrtva: ovo NIJE prava autentifikacija — ko god sazna link vidi listu. Zato stranica pokazuje samo ime kupca i naziv/količinu proizvoda, nikad telefon, adresu ni cijenu. Ako obim ili osjetljivost poraste, ovo treba zamijeniti pravim (makar pojednostavljenim) loginom.
