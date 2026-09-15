"use client";

// Jedan modal za sve potvrde brisanja/objave. Nikad window.confirm —
// tekst mora biti na bosanskom i jasan šta se tačno dešava.
export default function ConfirmModal({
  title,
  text,
  confirmLabel = "POTVRDI",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  text?: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="adm-modal-bg"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="adm-modal" role="dialog" aria-modal="true">
        <h2>{title}</h2>
        {text ? (
          <div className="adm-hint" style={{ marginTop: 6 }}>
            {text}
          </div>
        ) : null}
        <div className="adm-modal-foot">
          <button type="button" className="adm-btn" onClick={onCancel}>
            OTKAŽI
          </button>
          <button
            type="button"
            className={`adm-btn ${danger ? "adm-btn-danger" : "adm-btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Radim…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
