import BookOrderTrigger from "./BookOrderTrigger";

// Traka fiksirana na dnu ekrana, samo na mobitelu (isti pristup kao
// postojeći StickyBar.tsx na glavnoj stranici) — po referentnom
// screenshotu, crna traka koja ostaje na dnu dok se skrola kroz stranicu.
export default function BookStickyBar() {
  return (
    <BookOrderTrigger className="dawn-sticky-bar" aria-label="Poruči ovdje">
      Poruči ovdje
    </BookOrderTrigger>
  );
}
