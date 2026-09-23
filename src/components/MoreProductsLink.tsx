import Link from "next/link";

export default function MoreProductsLink() {
  return (
    <div className="more-products">
      <Link href="/" className="more-products-btn">
        Pogledaj ostale proizvode →
      </Link>
    </div>
  );
}
