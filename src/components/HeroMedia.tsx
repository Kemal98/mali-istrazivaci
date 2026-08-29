"use client";

import { useEffect, useRef } from "react";

type HeroMediaProps = {
  videoSrc?: string;
  poster?: string;
  alt?: string;
};

export default function HeroMedia({
  videoSrc,
  poster = "/img/set_hero2.png",
  alt = "Montessori set 3u1 na bosanskom – knjiga na čičak, drveni sat i magnetni tangram u poklon kutiji",
}: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // React ne postavi uvijek DOM svojstvo "muted" dovoljno rano da ga
    // browser vidi kad provjerava smije li autoplay krenuti — bez ovoga
    // video zna ostati zaglavljen na poster slici dok korisnik ručno ne
    // klikne. Postavljanje ovdje + eksplicitan .play() to rješava.
    video.muted = true;
    video.play().catch(() => {
      // Autoplay ipak blokiran (rijetko, uz muted+playsInline) — ostaje
      // poster slika, bez greške u konzoli.
    });
  }, []);

  if (videoSrc) {
    return (
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        aria-label={alt}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={poster} alt={alt} />;
}
