"use client";

import { useEffect, useState } from "react";

// Prije 15h: poziv na akciju sa rokom za slanje isti dan.
// Poslije 15h: automatski se mijenja da ne obećava nešto što više ne važi.
//
// Sat se mora računati po Sarajevu, NE po satu servera (Vercel je u
// UTC-u) — ista greška kao ranije na dashboardu (vidi sarajevoStartOfDay
// u lib/cms/datum.ts), ovdje bi inače poruka o 15h satima bila pogrešna.
function sarajevoHour(): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Sarajevo",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
}

function cutoffMessage(hour: number): string {
  return hour < 15
    ? "Naruči danas do 15h — šaljemo sutra ujutro."
    : "Narudžbe primljene danas šaljemo sutra ujutro.";
}

export default function ShippingCutoff() {
  // Prvi render (server i klijent, prije hidracije) MORA biti identičan
  // da React ne prijavi "hydration mismatch" — zato se sat NE računa u
  // useState inicijalizatoru (to bi se izvršilo posebno na serveru i
  // posebno na klijentu, i dalo različit tekst ako se renderi dese tačno
  // oko promjene minuta/sata). Umjesto toga: oba prvo renderuju null,
  // a stvarni sat se postavlja tek POSLIJE mounta (useEffect), što React
  // ne provjerava pri hidraciji.
  const [hour, setHour] = useState<number | null>(null);

  useEffect(() => {
    setHour(sarajevoHour());
    const id = setInterval(() => setHour(sarajevoHour()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (hour === null) return null;
  return <>{cutoffMessage(hour)}</>;
}
