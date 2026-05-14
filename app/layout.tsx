import type { Metadata } from "next";
import { Barlow_Condensed, Barlow, Cairo } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sparkd.online"),
  title: {
    default: "Spark'd — Light It Your Way",
    template: "%s | Spark'd",
  },
  description:
    "Custom lighter wraps designed your way. Anime, streetwear, Lebanese, and aesthetic collections. Cash on delivery across Lebanon.",
  keywords: [
    "custom lighters Lebanon", "lighter wraps", "BIC lighter wraps", "anime lighters",
    "streetwear lighters", "custom lighter design", "Lebanon delivery", "lighter shop Lebanon",
    "unique lighters", "ولاعات مخصصة", "ولاعة لبنان",
  ],
  openGraph: {
    title: "Spark'd — Light It Your Way",
    description: "Custom lighter wraps. Anime, streetwear, Lebanese collections. Delivered to your door.",
    url: "https://sparkd.online",
    siteName: "Spark'd",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Spark'd" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark'd — Light It Your Way",
    description: "Custom lighter wraps. Unique collections. Delivered across Lebanon.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${barlowCondensed.variable} ${barlow.variable} ${cairo.variable} antialiased`}
        style={{ background: "#fffdf9" }}
      >
        <LangProvider>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
