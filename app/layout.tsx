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
  title: "Spark'd — Light It Your Way",
  description:
    "Custom BIC J26 lighters designed your way. 9 unique collections — Lebanese, streetwear, aesthetic, and more. $5 each, delivered to your door.",
  keywords: ["custom lighters", "BIC lighter", "custom BIC J26", "Lebanon", "streetwear", "lighter shop"],
  openGraph: {
    title: "Spark'd — Light It Your Way",
    description:
      "Custom BIC J26 lighters designed your way. 9 unique collections, $5 each.",
    url: "https://sparkd.online",
    siteName: "Spark'd",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Spark'd" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark'd — Light It Your Way",
    description: "Custom BIC J26 lighters. 9 collections. $5 each.",
  },
  metadataBase: new URL("https://sparkd.online"),
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
