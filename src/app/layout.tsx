import type { Metadata } from "next";
import { Archivo, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WebVitalsReporter } from "@/components/layout/WebVitalsReporter";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "optional",
  weight: ["400", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "optional",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "optional",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Anyaman — Jurnalisme Damai & Ruang Diskusi",
    template: "%s · Anyaman",
  },
  description:
    "Portal berita dengan pendekatan jurnalisme damai dan forum diskusi yang mendorong argumentasi kritis tanpa dehumanisasi.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body
        className={`${archivo.variable} ${newsreader.variable} ${plexMono.variable}`}
      >
        <SiteHeader />
        {children}
        <SiteFooter />
        <WebVitalsReporter />
      </body>
    </html>
  );
}