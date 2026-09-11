"use client";

import { useState } from "react";
import { RATING, REVIEWS_COUNT } from "@/lib/socialProof";

// Stvarne recenzije i video snimci/slike koje je poslao vlasnik (ne
// primjeri kao ranije) — samo očišćen pravopis/razmaci, sadržaj i ton su
// prenešeni onako kako su poslani. Medij uz svaku karticu je stvaran
// snimak korištenja, uparen sa recenzijom čiji sadržaj najbliže odgovara
// onome što se vidi na njemu. Poster/foto je stvarna sličica (ne crna
// podloga) — klik otvara medij uvećan u popupu.
const reviews = [
  {
    text: "Ovo je nova omiljena igračka kod nas u kući.Znala sam da će moj sin od 8 mjeseci baš da se zalijepi za ovo,jer je opsjednut sa svim što se vrti... Tek je počeo da puže i ove zvečkice ga baš fino zaokupe u kuhinji dok ja pravim doručak ili sebi naspem još jednu kafu... Mali savjet,predobre su i za restorane,samo ih zalijepiš gore na sto i beba se zanima dok ti konačno pojedeš hranu dok je još topla. ",
    initial: "A",
    name: "Amela K.",
    media: {
      type: "video" as const,
      src: "/img/rotirajuce-zvecke/recenzije/video-kuhinja.mp4",
      poster: "/img/rotirajuce-zvecke/recenzije/poster-kuhinja.png",
    },
  },
  {
    text: "Kupila sam ih da budu igračke za kupanje za moju malu i obožava ih. Stalno se igra sa njima i u kadi i van nje. Vakuum je baš dobar, drže se fino i kad ima vode, a opet nisu teške za skinuti. Veličina im je taman i moja curica ih bez problema sama vrti. Baš su slatke i njoj su ovi leptirići i bubice na njima posebno zanimljivi.",
    initial: "I",
    name: "Ilma S.",
    media: {
      type: "video" as const,
      src: "/img/rotirajuce-zvecke/recenzije/video-kupanje.mp4",
      poster: "/img/rotirajuce-zvecke/recenzije/poster-kupanje.png",
    },
  },
  {
    text: "Baš je dugo zabave i moja curica ih stvarno voli.Razmišljam da uzmem još jedne.Jednostavne su za koristiti i za sad mi djeluju baš sigurno,čak i kad ih stavi u usta i gricka.",
    initial: "Z",
    name: "Zineta H.",
    media: {
      type: "video" as const,
      src: "/img/rotirajuce-zvecke/recenzije/video-pod.mp4",
      poster: "/img/rotirajuce-zvecke/recenzije/poster-pod.png",
    },
  },
  {
    text: "Naša beba od 10 sedmica baš voli gledati sve što se vrti, posebno ventilator na plafonu. Tokom kupanja nije imala ništa zanimljivo da gleda pa smo uzeli ove igračke. Vakuum se baš dobro zalijepi za kadu i beba se smije i gleda ih dok se vrte. Boje su baš jarke pa joj odmah privuku pažnju, a vrte se stvarno fino. Sad je čak počela i nožicama da ih udara da ih sama zavrti haha. Baš su nam uljepšale kupanje i stvarno ih preporučujem.",
    initial: "J",
    name: "Jovan M.",
    media: {
      type: "video" as const,
      src: "/img/rotirajuce-zvecke/recenzije/video-prozor.mp4",
      poster: "/img/rotirajuce-zvecke/recenzije/poster-prozor.png",
    },
  },
  {
    text: "Moja beba od 6 mjeseci ih obožava. Koristimo ih dok se kupa i na hranilici kad mama treba nešto da završi po kući. Vakuum baš dobro drži na raznim površinama, a opet se lahko skinu kad treba. Boje su baš jarke i zanimljive i stvarno su super igračka za bebu u ovom uzrastu.",
    initial: "I",
    name: "Ivana L.",
    media: {
      type: "photo" as const,
      src: "/img/rotirajuce-zvecke/recenzije/dijete-hranilica.png",
    },
  },
];

type OpenMedia = { type: "video" | "photo"; src: string };

export default function RattleReviews() {
  const [openMedia, setOpenMedia] = useState<OpenMedia | null>(null);

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
                onClick={() => setOpenMedia({ type: r.media.type, src: r.media.src })}
                aria-label={r.media.type === "video" ? "Pogledaj video" : "Pogledaj sliku"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.media.type === "video" ? r.media.poster : r.media.src}
                  alt=""
                />
                {r.media.type === "video" && (
                  <span className="dawn-rev-play" aria-hidden="true">
                    ▶
                  </span>
                )}
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

      {openMedia && (
        <div
          className="dawn-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setOpenMedia(null)}
        >
          <div className="dawn-modal dawn-video-modal" role="dialog" aria-modal="true">
            <button
              type="button"
              className="dawn-modal-close"
              aria-label="Zatvori"
              onClick={() => setOpenMedia(null)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {openMedia.type === "video" ? (
              <video src={openMedia.src} controls autoPlay muted playsInline className="dawn-video-player" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={openMedia.src} alt="" className="dawn-video-player" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
