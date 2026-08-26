"use client";

import { useState } from "react";

// Prije 15h: poziv na akciju sa rokom za slanje isti dan.
// Poslije 15h: automatski se mijenja da ne obećava nešto što više ne važi.
function cutoffMessage(): string {
  const hour = new Date().getHours();
  if (hour < 15) {
    return "Naruči danas do 15h — šaljemo sutra ujutro.";
  }
  return "Narudžbe primljene danas šaljemo sutra ujutro.";
}

export default function ShippingCutoff() {
  const [message] = useState(cutoffMessage);
  return <>{message}</>;
}
