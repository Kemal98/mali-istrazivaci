import type { DayPoint } from "@/lib/orders/stats";

/**
 * Grafikon narudžbi i prometa po danima.
 *
 * Namjerno BEZ biblioteke za grafikone: projekat je nema, a dodavanje
 * jedne (recharts ~500 KB) samo za ovo bi bilo skupo. Ovo je čist SVG
 * koji se renderuje na serveru — u browser ne ide ni jedan kilobajt JS-a
 * za grafikon.
 *
 * Stupci = broj narudžbi (lijeva skala), linija = promet u KM (desna).
 */
export default function OrdersChart({ data }: { data: DayPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="adm-hint">Nema podataka za prikaz u ovom periodu.</p>
    );
  }

  const W = 900;
  const H = 240;
  const padL = 38;
  const padR = 46;
  const padT = 14;
  const padB = 34;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxOrders = Math.max(1, ...data.map((d) => d.orders));
  const maxRevenue = Math.max(1, ...data.map((d) => d.revenue));

  const bandW = innerW / data.length;
  const barW = Math.max(2, Math.min(26, bandW * 0.6));

  const x = (i: number) => padL + bandW * i + bandW / 2;
  const yOrders = (v: number) => padT + innerH - (v / maxOrders) * innerH;
  const yRevenue = (v: number) => padT + innerH - (v / maxRevenue) * innerH;

  // linija prometa
  const linePts = data.map((d, i) => `${x(i)},${yRevenue(d.revenue)}`).join(" ");

  // horizontalne linije mreže — 4 nivoa
  const grid = [0, 0.25, 0.5, 0.75, 1];

  // koliko oznaka datuma prikazati da se ne slijepe
  const labelEvery = Math.max(1, Math.ceil(data.length / 12));

  const dayLabel = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${Number(d)}.${Number(m)}.`;
  };

  return (
    <>
      <div className="adm-chart-wrap">
        <svg
          className="adm-chart"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Narudžbe i promet po danima"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* mreža + skale */}
          {grid.map((g) => {
            const y = padT + innerH - g * innerH;
            return (
              <g key={g}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={y}
                  y2={y}
                  stroke="#e8eaee"
                  strokeWidth="1"
                />
                <text
                  x={padL - 7}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#8b919b"
                >
                  {Math.round(maxOrders * g)}
                </text>
                <text
                  x={W - padR + 7}
                  y={y + 3.5}
                  textAnchor="start"
                  fontSize="10"
                  fill="#e0632a"
                >
                  {Math.round(maxRevenue * g)}
                </text>
              </g>
            );
          })}

          {/* stupci = narudžbe */}
          {data.map((d, i) => {
            const y = yOrders(d.orders);
            const h = padT + innerH - y;
            return (
              <rect
                key={d.day}
                x={x(i) - barW / 2}
                y={y}
                width={barW}
                height={Math.max(0, h)}
                rx="2"
                fill="#14161a"
                opacity={d.orders ? 0.85 : 0}
              >
                <title>
                  {dayLabel(d.day)} — {d.orders} narudžbi, {d.revenue} KM
                </title>
              </rect>
            );
          })}

          {/* linija = promet */}
          {data.length > 1 ? (
            <polyline
              points={linePts}
              fill="none"
              stroke="#e0632a"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          {data.map((d, i) => (
            <circle
              key={`p-${d.day}`}
              cx={x(i)}
              cy={yRevenue(d.revenue)}
              r={data.length > 40 ? 1.6 : 2.8}
              fill="#e0632a"
            >
              <title>
                {dayLabel(d.day)} — {d.revenue} KM
              </title>
            </circle>
          ))}

          {/* datumi */}
          {data.map((d, i) =>
            i % labelEvery === 0 || i === data.length - 1 ? (
              <text
                key={`l-${d.day}`}
                x={x(i)}
                y={H - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#8b919b"
              >
                {dayLabel(d.day)}
              </text>
            ) : null
          )}
        </svg>
      </div>

      <div className="adm-chart-legend">
        <span>
          <i style={{ background: "#14161a" }} />
          Narudžbe (lijeva skala)
        </span>
        <span>
          <i style={{ background: "#e0632a" }} />
          Vrijednost proizvoda u KM (desna skala)
        </span>
      </div>
    </>
  );
}
