import BookOrderTrigger from "./BookOrderTrigger";

export default function BlingerCtaRepeat() {
  return (
    <section className="dawn-repeat-cta">
      <div className="dawn-col">
        <h2 className="dawn-h2">Akcija do kraja dana!</h2>
        <BookOrderTrigger className="dawn-btn-black">
          PORUČI SADA
        </BookOrderTrigger>
      </div>
    </section>
  );
}
