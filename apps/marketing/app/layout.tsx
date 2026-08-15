import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://keel.ostenmark.com"),
  title: {
    default: "Keel — Project management that keeps its course",
    template: "%s — Keel",
  },
  description:
    "Keel tracks work: items, cycles, modules, roadmaps and collaborative docs. Open source, built on Postgres.",
  openGraph: {
    title: "Keel",
    description: "Project management that keeps its course.",
    url: "https://keel.ostenmark.com",
    siteName: "Keel",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0b1116",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
