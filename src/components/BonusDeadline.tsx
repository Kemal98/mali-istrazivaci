"use client";

import { useState } from "react";

// Automatski računa nadolazeću nedjelju (23:59) kao rok za bonus.
// Ako je danas nedjelja, rok je danas.
function nextSundayLabel(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = nedjelja
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntilSunday);

  const dd = String(target.getDate()).padStart(2, "0");
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const yyyy = target.getFullYear();
  return `${dd}.${mm}.${yyyy}.`;
}

export default function BonusDeadline() {
  const [label] = useState(nextSundayLabel);
  return <>{label}</>;
}
