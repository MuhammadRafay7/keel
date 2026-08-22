import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://keel.ostenmark.com"),
  title: {
    default: "Keel — Hosted Work Management for Engineering Teams",
    template: "%s — Keel",
  },
  description:
    "Keel connects issues, 5 dynamic work views, sprint cycles, roadmap modules, collaborative docs, and Bring Your Own AI Key into one fast, quiet workspace.",
  openGraph: {
    title: "Keel",
    description: "Hosted Work Management for Engineering Teams.",
    url: "https://keel.ostenmark.com",
    siteName: "Keel",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
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
