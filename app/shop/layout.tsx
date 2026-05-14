import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse all custom lighter wrap designs — anime, streetwear, Lebanese, aesthetic and more. Cash on delivery across Lebanon.",
  openGraph: {
    title: "Shop | Spark'd",
    description: "Browse all custom lighter wrap designs. Delivered across Lebanon.",
    url: "https://sparkd.online/shop",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
