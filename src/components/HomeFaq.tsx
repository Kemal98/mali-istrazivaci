"use client";

import { useState } from "react";
import styles from "./Home.module.css";
import type { FaqItem } from "@/lib/home/types";

export default function HomeFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (items.length === 0) return null;

  return (
    <section id="faq">
      <div className={styles.wrap}>
        <span className={styles.kicker}>Pomoć</span>
        <h2 className={styles.sectionTitle}>Česta pitanja</h2>
        <div className={styles.faqList}>
          {items.map((f) => {
            const isOpen = open === f.id;
            return (
              <div className={styles.faqItem} key={f.id}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : f.id)}
                >
                  <span>{f.pitanje}</span>
                  <span className={styles.faqIcon} aria-hidden="true">
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                {isOpen ? <div className={styles.faqAnswer}>{f.odgovor}</div> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
