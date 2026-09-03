import { RATING, FAMILIES_COUNT } from "@/lib/socialProof";

export default function BookSocialProof() {
  return (
    <section className="dawn-social">
      <div className="dawn-col">
        <p className="dawn-social-headline">
          Preko {FAMILIES_COUNT}+ zadovoljnih porodica
        </p>
        <p className="dawn-stars">★★★★★</p>
        <p className="dawn-social-sub">prosječna ocjena {RATING}/5</p>
      </div>
    </section>
  );
}
