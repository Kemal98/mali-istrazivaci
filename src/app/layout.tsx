import type { Metadata } from "next";
import Script from "next/script";
import PixelEvents from "@/components/PixelEvents";
import { META_PIXEL_ID } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "SAT MIRA – Montessori set 3u1 na bosanskom jeziku | Mali Istraživači",
  description:
    "Jedini Montessori set na bosanskom jeziku. SAT MIRA: 3 igračke za djecu 2–6 godina – knjiga na čičak, drvena igračka i mozgalica. 29 KM, plaćanje pouzećem, dostava po BiH.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <head>
        <meta
          name="facebook-domain-verification"
          content="wo1tygpwxkbq1a4gpuglkd6fugj6q8"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400;0,700;0,800;1,700&family=Karla:wght@400;500;600;700;800&family=Caveat:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${META_PIXEL_ID}');fbq('track','PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height={1}
            width={1}
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <PixelEvents />
        {children}
      </body>
    </html>
  );
}
