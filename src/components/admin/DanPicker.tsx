"use client";

import { useRouter, useSearchParams } from "next/navigation";

/** Biraj tačno jedan dan (kalendar) da vidiš zaradu baš za taj dan — ide u URL (?dan=). */
export default function DanPicker({ today }: { today: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const dan = params.get("dan") ?? "";

  function set(v: string) {
    const next = new URLSearchParams(params.toString());
    if (v) next.set("dan", v);
    else next.delete("dan");
    router.push(`/admin/dashboard?${next.toString()}#zarada-po-danima`);
  }

  return (
    <div className="adm-filter-group" style={{ display: "inline-flex" }}>
      <label htmlFor="dan-picker">Prikaži zaradu za tačno jedan dan</label>
      <input
        id="dan-picker"
        type="date"
        max={today}
        value={dan}
        onChange={(e) => set(e.target.value)}
      />
      {dan ? (
        <button type="button" className="adm-btn adm-btn-sm" onClick={() => set("")}>
          OČISTI
        </button>
      ) : null}
    </div>
  );
}
