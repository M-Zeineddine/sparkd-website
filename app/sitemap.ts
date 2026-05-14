import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: products } = await supabase
    .from("products")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const productUrls: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `https://sparkd.online/shop/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: "https://sparkd.online", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://sparkd.online/shop", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://sparkd.online/custom", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...productUrls,
  ];
}
