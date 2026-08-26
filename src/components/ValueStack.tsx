export type ValueStackItem = { label: string; price: string };

export default function ValueStack({
  items,
  total,
  title = "Šta bi platio odvojeno:",
  totalLabel = "Ukupna vrijednost",
}: {
  items: ValueStackItem[];
  total: string;
  title?: string;
  totalLabel?: string;
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
    </div>
  );
}
