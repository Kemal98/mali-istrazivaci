import PriceBlock from "./PriceBlock";

export default function StickyBar({
  price = "29 KM",
  oldPrice = "58 KM",
  delivery = "10 KM",
  rib = "Plaćanje pouzećem · 14 dana garancija",
  ctaLabel = "Naruči set",
}: {
  price?: string;
  oldPrice?: string;
  delivery?: string;
  rib?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="sticky">
      <div className="sticky-rib">{rib}</div>
      <div className="sticky-row">
        <PriceBlock
          variant="compact"
          price={price}
          oldPrice={oldPrice}
          delivery={delivery}
        />
        <a href="#naruci" className="btn btn-primary">
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
