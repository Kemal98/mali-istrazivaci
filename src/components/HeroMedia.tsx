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
  if (videoSrc) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
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
