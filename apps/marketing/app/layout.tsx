import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://keel.ostenmark.com"),
  title: {
    default: "Keel — Open Source Project & Knowledge Management",
    template: "%s — Keel",
  },
  description:
    "Keel brings projects, docs, and workflows into one unified workspace so teams can plan, execute, and stay aligned. Cloud and self-hosted.",
  openGraph: {
    title: "Keel",
    description: "Open Source Project & Knowledge Management Platform.",
    url: "https://keel.ostenmark.com",
    siteName: "Keel",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
