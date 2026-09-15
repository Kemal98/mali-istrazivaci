import BookOrderTrigger from "@/components/BookOrderTrigger";
import type { Hero } from "@/lib/cms/types";
import { ocjene } from "@/lib/cms/plural";

// Hero za CMS proizvode. Identične .dawn-* klase kao postojeće hero
// sekcije (BlingerHero/RattleHero), pa je vizuelni identitet isti.
export default function CmsHero({
  hero,
  cijena,
  staraCijena,
  badge,
}: {
  hero: Hero;
  cijena: number | null;
  staraCijena: number | null;
  badge: string;
}) {
  return (
    <section className="dawn-product" id="top">
      <div className="dawn-col">
        {hero.slika ? (
          <div className="dawn-product-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.slika} alt={hero.alt || hero.naslovLinija1} />
          </div>
        ) : null}

        <h1 className="dawn-h1 dawn-h1-lg">
          {hero.naslovLinija1}
          {hero.naslovLinija2 ? (
            <>
              <br />
              {hero.naslovLinija2}
            </>
          ) : null}
        </h1>

        {/* Bez teksta iznad -> jednoredni .dawn-rating (identično kao na
            ručno pisanim stranicama). Sa tekstom -> dvoredni "stack". */}
        {hero.prikaziRating ? (
          hero.ratingTekst ? (
            <a href="#recenzije" className="dawn-rating dawn-rating-stack">
              <span className="dawn-rating-cta">
                <strong>{hero.ratingTekst}</strong>
              </span>
              <span className="dawn-rating-sub">
                <span className="dawn-stars" aria-hidden="true">
                  ♥♥♥♥♥
                </span>
                {hero.ratingVrijednost} ({hero.ratingBrojOcjena}{" "}
                {ocjene(Number(hero.ratingBrojOcjena) || 0)})
              </span>
            </a>
          ) : (
            <a href="#recenzije" className="dawn-rating">
              <span className="dawn-stars" aria-hidden="true">
                ♥♥♥♥♥
              </span>
              {hero.ratingVrijednost} ({hero.ratingBrojOcjena}{" "}
              {ocjene(Number(hero.ratingBrojOcjena) || 0)})
            </a>
          )
        ) : null}

        {hero.prikaziCijenu && cijena !== null ? (
          <div className="dawn-price-row">
            {staraCijena !== null ? (
              <span className="dawn-price-old">{staraCijena} KM</span>
            ) : null}
            <span className="dawn-price-new">{cijena} KM</span>
            {hero.prikaziBadge && badge ? (
              <span className="dawn-badge-sale">{badge}</span>
            ) : null}
          </div>
        ) : null}

        <BookOrderTrigger className="dawn-btn-black dawn-btn-pulse">
          {hero.ctaTekst || "PORUČI SADA"}
        </BookOrderTrigger>

        {hero.prikaziCtaPodtekst && hero.ctaPodtekst ? (
          <p className="dawn-pay-line dawn-pay-line-below">{hero.ctaPodtekst}</p>
        ) : null}
      </div>
    </section>
  );
}
