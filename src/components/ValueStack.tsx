export type ValueStackItem = { label: string; price: string };

export default function ValueStack({
  items,
  total,
  yourPrice,
  delivery,
  title = "Šta bi platio odvojeno:",
  totalLabel = "Ukupna vrijednost",
  yourPriceLabel = "→ Tvoja cijena",
}: {
  items: ValueStackItem[];
  total: string;
  yourPrice?: string;
  delivery?: string;
  title?: string;
  totalLabel?: string;
  yourPriceLabel?: string;
}) {
  return (
    <div className="value-stack">
      <div className="value-stack-title">{title}</div>
      <ul className="value-stack-list">
        {items.map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <span className="value-stack-dots" aria-hidden="true" />
            <span className="value-stack-price">{item.price}</span>
          </li>
        ))}
      </ul>
      <div className="value-stack-total">
        <span>{totalLabel}</span>
        <span className="value-stack-total-price">{total}</span>
      </div>
      {yourPrice && (
        <div className="value-stack-yours">
          <span>{yourPriceLabel}</span>
          <span className="value-stack-yours-price">
            {yourPrice}
            {delivery && <small> + {delivery} dostava</small>}
          </span>
        </div>
      )}
    </div>
  );
}
