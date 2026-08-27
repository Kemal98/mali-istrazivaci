import PriceBlock from "./PriceBlock";
import ShippingCutoff from "./ShippingCutoff";

export default function StickyBar({
  price = "29 KM",
  oldPrice = "",
  delivery = "10 KM",
  rib = "Plaćanje pouzećem · 14 dana garancija",
  ctaLabel = "Naruči set",
  phone,
  simplified = false,
}: {
  price?: string;
  oldPrice?: string;
  delivery?: string;
  rib?: string;
  ctaLabel?: string;
  phone?: string;
  simplified?: boolean;
}) {
  if (simplified) {
    return (
      <div className="sticky sticky-v2">
        <div className="sticky-cutoff-v2">
          <ShippingCutoff />
        </div>
        <div className="sticky-row-v2">
          <div className="sticky-price-v2">
            <div className="sticky-price-v2-top">
              <span className="sticky-price-main">{price}</span>
              {oldPrice && (
                <span className="sticky-price-old">{oldPrice}</span>
              )}
            </div>
            <div className="sticky-price-delivery">+ {delivery} dostava</div>
          </div>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="sticky-phone"
              aria-label="Pozovi nas"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </a>
          )}
          <a href="#naruci" className="btn btn-primary">
            {ctaLabel}
          </a>
        </div>
      </div>
    );
  }

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
