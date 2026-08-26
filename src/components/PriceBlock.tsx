type PriceBlockProps = {
  variant?: "full" | "compact";
  price?: string;
  oldPrice?: string;
  discount?: string;
  delivery?: string;
  dark?: boolean;
};

export default function PriceBlock({
  variant = "full",
  price = "29 KM",
  oldPrice = "58 KM",
  discount = "-50%",
  delivery = "10 KM",
  dark = false,
}: PriceBlockProps) {
  if (variant === "compact") {
    return (
      <span className="pb-compact">
        <span className="pb-compact-price">{price}</span>
        <span className="pb-compact-delivery">+ dostava {delivery}</span>
        {oldPrice && <span className="pb-compact-old">{oldPrice}</span>}
      </span>
    );
  }

  return (
    <div className={`pb-full${dark ? " pb-dark" : ""}`}>
      <div className="pb-row">
        <span className="pb-price">{price}</span>
        {oldPrice && <span className="pb-old">{oldPrice}</span>}
        {discount && <span className="pb-discount">{discount}</span>}
      </div>
      <div className="pb-delivery">+ {delivery} dostava</div>
    </div>
  );
}
