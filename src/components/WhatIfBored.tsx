export default function WhatIfBored() {
  return (
    <section className="reassure-bg" id="zaigra">
      <div className="wrap">
        <span className="kicker k-green">Pitanje koje nam svi postave</span>
        <h2 className="h-sec">A šta ako se zaigra dva dana pa zaboravi?</h2>
        <p className="sub-sec">
          To je najčešće pitanje koje dobijamo — i razlog zašto smo napravili
          tri igre, ne jednu.
        </p>
        <p className="reassure-p">
          Kad se zasiti čička, prelazi na tangram. Kad riješi tangram, uzima
          drvenu igračku. A knjiga svaki put izgleda drugačije, jer se
          kartice slažu iznova — ne kao naljepnice koje se potroše.
        </p>

        {/* TODO: provjeri autentičnost citata prije objave — potvrdi da je
            Merima K. iz Tuzle zaista poslala baš ovu poruku, ili zamijeni
            stvarnim citatom iz Vibera/poruka kupaca. */}
        <blockquote className="reassure-quote">
          &ldquo;Mislila sam da će trajati sedmicu. Još ga vadi skoro svaki
          dan.&rdquo;
          <cite>— Merima K., Tuzla, nakon šest sedmica</cite>
        </blockquote>

        <p className="reassure-guarantee">
          Ako se kod tvog djeteta ipak ne desi – javi se u 14 dana i vraćamo
          novac. Bez pitanja.
        </p>
      </div>
    </section>
  );
}
