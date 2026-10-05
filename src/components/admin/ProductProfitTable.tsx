"use client";

import { useState } from "react";
import type { ProfitRow, DayProfit } from "@/lib/orders/profit";

const km = (v: number) => `${v.toLocaleString("bs-BA")} KM`;

/**
 * Tabela "Zarada po proizvodu" (zbir za izabrani period) sa klikom za
 * razvijanje — po proizvodu, dan-po-dan potrošnja na reklame i zarada za
 * ISTI period, da admin vidi da li je npr. neki dan bilo 0/1/2 prodaje.
 * byDay dolazi sa servera kao niz parova [naziv, dani] (Map se ne može
 * direktno proslijediti kroz server->client granicu).
 */
export default function ProductProfitTable({
  rows,
  byDay,
}: {
  rows: ProfitRow[];
  byDay: [string, DayProfit[]][];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const dayMap = new Map(byDay);

  return (
    <div className="adm-table-wrap" style={{ border: "none", marginTop: 14 }}>
      <table className="adm-table" style={{ minWidth: 720 }}>
        <thead>
          <tr>
            <th>Proizvod</th>
            <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Narudž.</th>
            <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Prihod</th>
            <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Nabavna</th>
            <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Reklame</th>
            <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Zarada</th>
            <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Po narudž.</th>
            <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Na stanju</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const days = dayMap.get(p.productName) ?? [];
            const isOpen = open === p.productName;
            return (
              <>
                <tr
                  key={p.productName}
                  className={days.length ? "adm-row-clickable" : undefined}
                  onClick={
                    days.length
                      ? () => setOpen(isOpen ? null : p.productName)
                      : undefined
                  }
                >
                  <td>
                    {days.length ? (isOpen ? "▾ " : "▸ ") : ""}
                    {p.productName}
                    {p.missingCost ? (
                      <span className="adm-hint"> · fali nabavna cijena</span>
                    ) : null}
                    {p.manualQty > 0 ? (
                      <span className="adm-hint"> · uklj. {p.manualQty} ručno</span>
                    ) : null}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{p.orders || "—"}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{km(p.revenue)}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                    {p.cost > 0 ? `−${km(p.cost)}` : "—"}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                    {p.adSpend > 0 ? `−${km(p.adSpend)}` : "—"}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <b style={{ color: p.profit >= 0 ? "#148a4b" : "#b3261e" }}>
                      {km(p.profit)}
                    </b>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                    {p.orders ? km(Math.round((p.profit / p.orders) * 100) / 100) : "—"}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                    {p.stock === null ? "—" : `${p.stock} kom`}
                  </td>
                </tr>
                {isOpen ? (
                  <tr key={`${p.productName}-days`}>
                    <td colSpan={8} style={{ padding: 0, background: "#f8f8f6" }}>
                      <table className="adm-table" style={{ minWidth: 0, width: "100%" }}>
                        <thead>
                          <tr>
                            <th>Dan</th>
                            <th style={{ textAlign: "right" }}>Narudž.</th>
                            <th style={{ textAlign: "right" }}>Prihod</th>
                            <th style={{ textAlign: "right" }}>Reklame</th>
                            <th style={{ textAlign: "right" }}>Zarada</th>
                          </tr>
                        </thead>
                        <tbody>
                          {days.map((d) => (
                            <tr key={d.day}>
                              <td>{d.day}</td>
                              <td style={{ textAlign: "right" }}>
                                {d.orders || "—"}
                              </td>
                              <td style={{ textAlign: "right" }}>{km(d.revenue)}</td>
                              <td style={{ textAlign: "right" }} className="adm-hint">
                                {d.adSpend > 0 ? `−${km(d.adSpend)}` : "—"}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <b style={{ color: d.profit >= 0 ? "#148a4b" : "#b3261e" }}>
                                  {km(d.profit)}
                                </b>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ) : null}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
