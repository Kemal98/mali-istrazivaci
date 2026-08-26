export default function Guarantee() {
  return (
    <section className="guarantee-bg" id="garancija">
      <div className="wrap">
        <div className="guarantee-seal">
          <div className="guarantee-seal-ring" aria-hidden="true" />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <span className="guarantee-seal-num">14</span>
          <span className="guarantee-seal-txt">
            DANA GARANCIJA
            <br />
            POVRATA NOVCA
          </span>
        </div>

        <h2 className="h-sec">14 dana. Bez objašnjavanja.</h2>
        <p className="sub-sec">
          Ako se djetetu ne svidi — javi se u roku od 14 dana od preuzimanja i
          vraćamo novac. Ne tražimo razlog, ne tražimo da vraćaš u
          originalnom pakovanju, ne tražimo ništa.
        </p>
        <p className="guarantee-p">
          <strong>Rizik je na nama, ne na tebi.</strong> Zato i plaćaš tek
          kad kurir donese paket.
        </p>
      </div>
    </section>
  );
}
