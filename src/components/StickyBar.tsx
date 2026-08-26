export default function StickyBar({
  price = "29 KM",
  oldPrice = "58 KM",
  rib = "Plaćanje pouzećem · 14 dana garancija",
  ctaLabel = "Naruči set",
}: {
  price?: string;
  oldPrice?: string;
  rib?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="sticky">
      <div className="sticky-rib">{rib}</div>
      <div className="sticky-row">
        <div className="sticky-price">
          {price} {oldPrice && <small>{oldPrice}</small>}
        </div>
        <a href="#naruci" className="btn btn-primary">
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
