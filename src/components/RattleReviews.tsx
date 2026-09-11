"use client";

import { useState } from "react";
import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";

// Stvarne recenzije i video snimci koje je poslao vlasnik (ne primjeri
// kao ranije) — samo očišćeni pravopis/dijakritike, sadržaj i ton su
// prenešeni onako kako su poslani. Video uz svaku karticu je pravi
// snimak korištenja, uparen sa recenzijom čiji sadržaj najbliže odgovara
// onome što se vidi na videu (kuhinja/restoran, kupanje, kupanje/opšte).
// Poster je stvarna sličica izvučena iz videa (ne crna podloga) — klik na
// nju otvara video uvećan u popupu.
const reviews = [
  {
    text: "Ovo je nova omiljena igračka kod nas u kući.Znala sam da će moj sin od 8 mjeseci baš da se zalijepi za ovo, jer je opsjednut sa svim što se vrti 😄 Tek je počeo da puže i ove zvečkice ga baš fino zaokupe u kuhinji dok ja pravim doručak ili sebi naspem još jednu kafu. Mali savjet, predobre su i za restorane,samo ih zalijepiš gore na sto i beba se zanima dok ti konačno pojedeš hranu dok je još topla 😄. Baš su praktične, nosim ih svuda sa sobom jer ih moja kćerka baš voli. Imaju dolje vakuum pa se mogu zalijepiti bukvalno gdje god i baš se fino vrte. Veličina im je taman kako treba i nema bojazni da će se dijete povrijediti dok se igra.",
    initial: "A",
    name: "Amela K.",
    video: "/img/rotirajuce-zvecke/recenzije/video-kuhinja.mp4",
    poster: "/img/rotirajuce-zvecke/recenzije/poster-kuhinja.png",
  },
  {
    text: "Kupila sam ih da budu igračke za kupanje za moju malu i obozava ih.Stalno se igra sa njima i u kadi i van nje.Vakuum je baš dobar,drže se fino i kad ima vode, a opet nisu teške za skinuti.Veličina im je taman i moja curica ih bez problema sama vrti. Baš su slatke i njoj su ovi leptirići i bubice na njima posebno zanimljivi",
    initial: "I",
    name: "Ilma S.",
    video: "/img/rotirajuce-zvecke/recenzije/video-kupanje.mp4",
    poster: "/img/rotirajuce-zvecke/recenzije/poster-kupanje.png",
  },
  {
    text: "Prvi put ih je koristila na kupanju i odmah ih je zavoljela.Bas je dugo zabave imoja curica ih stvarno voli.Razmišljam da uzmem još jedne i za unuka. Jednostavne su za koristiti i za sad mi djeluju baš sigurno, čak i kad ih stavi u usta i gricka.",
    initial: "Z",
    name: "Zineta H.",
    video: "/img/rotirajuce-zvecke/recenzije/video-pod.mp4",
    poster: "/img/rotirajuce-zvecke/recenzije/poster-pod.png",
  },
];

export default function RattleReviews() {
  const [openVideo, setOpenVideo] = useState<string | null>(null);

  return (
    <section className="dawn-reviews" id="recenzije">
      <div className="dawn-col">
        <h2 className="dawn-h2 dawn-h2-lg">
          Roditelji koji su već kupili kod nas ♥️
        </h2>
        <div className="dawn-rev-score">
          <span className="dawn-rev-num">{RATING}</span>
          <div>
            <div className="dawn-stars">★★★★★</div>
            <small>na osnovu {REVIEWS_COUNT} ocjena</small>
          </div>
        </div>
        <div className="dawn-rev-list">
          {reviews.map((r) => (
            <div className="dawn-rev-card" key={r.name}>
              <button
                type="button"
                className="dawn-rev-video-thumb"
                onClick={() => setOpenVideo(r.video)}
                aria-label="Pogledaj video"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.poster} alt="" />
                <span className="dawn-rev-play" aria-hidden="true">
                  ▶
                </span>
              </button>
              <div className="dawn-rev-who">
                <div className="dawn-rev-av">{r.initial}</div>
                <div>
                  <b>{r.name}</b>
                  <span className="dawn-rev-verified">Verifikovano</span>
                </div>
              </div>
              <p>&ldquo;{r.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>

      {openVideo && (
        <div
          className="dawn-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setOpenVideo(null)}
        >
          <div className="dawn-modal dawn-video-modal" role="dialog" aria-modal="true">
            <button
              type="button"
              className="dawn-modal-close"
              aria-label="Zatvori"
              onClick={() => setOpenVideo(null)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <video src={openVideo} controls autoPlay playsInline className="dawn-video-player" />
          </div>
        </div>
      )}
    </section>
  );
}
