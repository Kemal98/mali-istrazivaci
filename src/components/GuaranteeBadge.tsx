export default function GuaranteeBadge() {
  return (
    <div className="guarantee">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
      <div>
        <b>14 dana garancija zadovoljstva</b>
        <p>
          Ako se djetetu ne svidi, javi se u roku od 14 dana i vraćamo
          novac. Bez objašnjavanja.
        </p>
      </div>
    </div>
  );
}
