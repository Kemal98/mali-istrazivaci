export default function StickyBar() {
  return (
    <div className="sticky">
      <div className="sticky-rib">
        3 igre · 60 minuta · 0 ekrana – akcija do isteka zalihe
      </div>
      <div className="sticky-row">
        <div className="sticky-price">
          24 KM <small>44 KM</small>
        </div>
        <a href="#naruci" className="btn btn-primary">
          Naruči set
        </a>
      </div>
    </div>
  );
}
