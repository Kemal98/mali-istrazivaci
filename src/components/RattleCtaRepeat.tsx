import ShippingCutoff from "./ShippingCutoff";
import BookOrderTrigger from "./BookOrderTrigger";

export default function RattleCtaRepeat() {
  return (
    <section className="dawn-repeat-cta">
      <div className="dawn-col">
        <h2 className="dawn-h2">Poruči ODMAH</h2>
        <p className="dawn-repeat-sub">
          <ShippingCutoff />
        </p>
        <BookOrderTrigger className="dawn-btn-black">
          PORUČI SADA
        </BookOrderTrigger>
      </div>
    </section>
  );
}
