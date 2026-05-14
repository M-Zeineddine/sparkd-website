import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import ProductPageClient from "./ProductPageClient";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("products")
    .select("name, name_ar, image_url, image_urls, category")
    .eq("id", id)
    .single();

  if (!data) return { title: "Product" };

  const image = data.image_urls?.[0] || data.image_url;
  const description = `${data.name} — custom lighter wrap from the ${data.category} collection. Shop at Spark'd Lebanon.`;

  return {
    title: data.name,
    description,
    openGraph: {
      title: data.name,
      description,
      images: image ? [{ url: image, width: 800, height: 800, alt: data.name }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return <ProductPageClient id={id} />;
}
