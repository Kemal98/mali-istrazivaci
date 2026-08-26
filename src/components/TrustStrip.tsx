import { RATING, REVIEWS_COUNT, FAMILIES_COUNT } from "@/lib/socialProof";

const statItems = [
  { icon: "⭐", main: `${RATING}/5`, sub: `${REVIEWS_COUNT} ocjena` },
  { icon: "👪", main: `${FAMILIES_COUNT}+`, sub: "porodica u BiH" },
  { icon: "🚚", main: "2–4 dana", sub: "po cijeloj BiH" },
  { icon: "🇧🇦", main: "Ručno pakujemo", sub: "u Bosni" },
];

export default function TrustStrip({
  variant = "default",
}: {
  variant?: "default" | "stats";
}) {
  if (variant === "stats") {
    return (
      <div className="tstrip">
        <div className="wrap">
          <div className="tstrip-in tstrip-in-4">
            {statItems.map((item) => (
              <div className="titem titem-stat" key={item.main}>
                <span className="titem-icon">{item.icon}</span>
                <div className="titem-text">
                  <span className="titem-main">{item.main}</span>
                  <span className="titem-sub">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tstrip">
      <div className="wrap">
        <div className="tstrip-in">
          <div className="titem ti1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7c-2 0-4-1.5-4-3.5S9 1 10.5 1 12 3 12 7zM12 7c2 0 4-1.5 4-3.5S15 1 13.5 1 12 3 12 7z" />
            </svg>
            Stiže u poklon kutiji
          </div>
          <div className="titem ti2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            Plaćanje pouzećem
          </div>
          <div className="titem ti3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="1" y="6" width="15" height="12" rx="2" />
              <path d="M16 10h4l3 3v5h-7z" />
              <circle cx="6" cy="19" r="2" />
              <circle cx="18" cy="19" r="2" />
            </svg>
            Dostava po cijeloj BiH
          </div>
        </div>
      </div>
    </div>
  );
}
