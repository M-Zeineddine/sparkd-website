import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Designs",
  description:
    "Want a design that's uniquely yours? Order a fully custom lighter wrap. Send us your idea and we'll bring it to life.",
  openGraph: {
    title: "Custom Designs | Spark'd",
    description: "Order a fully custom lighter wrap. Send us your idea and we'll make it.",
    url: "https://sparkd.online/custom",
  },
};

export default function CustomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
