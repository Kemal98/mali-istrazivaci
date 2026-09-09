import Link from "next/link";
import {
  CONTACT_EMAIL,
  SOCIAL_INSTAGRAM,
  SOCIAL_FACEBOOK,
} from "@/lib/constants";
import styles from "./Home.module.css";

export default function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div className={styles.footGrid}>
          <div>
            <div className={styles.footBrand}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo.png" alt="Mali Istraživači" />
              Mali Istraživači
            </div>
            <p style={{ color: "var(--h-ink2)", maxWidth: "34ch", fontSize: ".9rem" }}>
              Pažljivo birane igračke za djecu svih uzrasta. Svaki paket
              ručno pakujemo u BiH.
            </p>
          </div>
          <div className={styles.footCol}>
            <h4>Kontakt</h4>
            <ul>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                <a href={SOCIAL_INSTAGRAM} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href={SOCIAL_FACEBOOK} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
          <div className={styles.footCol}>
            <h4>Stranica</h4>
            <ul>
              <li>
                <a href="#proizvodi">Proizvodi</a>
              </li>
              <li>
                <a href="#uzrast">Po uzrastu</a>
              </li>
              <li>
                <a href="#nasa-prica">O nama</a>
              </li>
              <li>
                <Link href="/sat-mira">SAT MIRA set</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.footBottom}>
          © 2026 Mali Istraživači · Učenje kroz igru
        </div>
      </div>
    </footer>
  );
}
