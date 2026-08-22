export default function TrustStrip() {
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
          <div className="titem ti4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 011.98-3A2.5 2.5 0 019.5 2z" />
              <path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-1.98-3A2.5 2.5 0 0014.5 2z" />
            </svg>
            Razvija pažnju i govor
          </div>
        </div>
      </div>
    </div>
  );
}
