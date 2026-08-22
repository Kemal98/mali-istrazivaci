export default function StickyBar({
  price = "29 KM",
  oldPrice = "45 KM",
  rib = "3 igre · 60 minuta · 0 ekrana – akcija do isteka zalihe",
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
