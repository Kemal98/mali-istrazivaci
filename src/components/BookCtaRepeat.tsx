"use client";

import ShippingCutoff from "./ShippingCutoff";
import BookOrderTrigger from "./BookOrderTrigger";

// Napomena: brief je tražio "akcija do kraja dana!" — ista kategorija lažne
// hitnosti kao "akcija do isteka zalihe", ranije zabranjeno u ovoj sesiji jer
// kupci u BiH to prepoznaju. Zamijenjeno stvarnim rokom (ShippingCutoff),
// koji se stvarno mijenja poslije 15h.
export default function BookCtaRepeat() {
  return (
    <section className="dawn-repeat-cta">
      <div className="dawn-col">
        <p className="dawn-repeat-promo">
          Roditelji je stalno preporučuju drugima.
        </p>
        <h2 className="dawn-h2">Poruči ODMAH</h2>
        <p className="dawn-repeat-sub">
          <ShippingCutoff />
        </p>
        <BookOrderTrigger className="dawn-btn-black">
          KUPOVINA
        </BookOrderTrigger>
      </div>
    </section>
  );
}
