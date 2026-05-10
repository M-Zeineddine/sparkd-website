"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useCartStore } from "@/lib/store";
import { Product, CategoryRecord } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, isRTL } = useLang();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
        // Fetch related
        if (data.product?.category) {
          fetch(`/api/products?category=${encodeURIComponent(data.product.category)}&limit=4`)
            .then((r) => r.json())
            .then((d) =>
              setRelated(
                (d.products || []).filter((p: Product) => p.id !== data.product.id).slice(0, 4)
              )
            );
        }
      })
      .catch(() => {
        setLoading(false);
        router.replace("/shop");
      });
  }, [id, router]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fffdf9" }}>
        <div className="w-10 h-10 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const name = lang === "ar" ? product.name_ar || product.name : product.name;
  const description = lang === "ar" ? product.description_ar || product.description : product.description;
  const categoryRecord = categories.find((c) => c.name === product.category);
  const category = isRTL ? categoryRecord?.name_ar || product.category : product.category;

  return (
    <div style={{ background: "#fffdf9" }} className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav
          className="flex items-center gap-2 text-xs text-[#999]"
          style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
        >
          <Link href="/" className="hover:text-[#f95c05] transition-colors">{t("home")}</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#f95c05] transition-colors">{t("shop")}</Link>
          <span>/</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#f95c05] transition-colors"
          >
            {category}
          </Link>
          <span>/</span>
          <span className="text-[#111]">{name}</span>
        </nav>
      </div>

      {/* Product Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-square bg-[#f0ede8] overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#bbb]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  Image Coming Soon
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6 py-4">
            {/* Category Badge */}
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="self-start text-xs font-bold tracking-widest uppercase px-3 py-1"
              style={{
                background: "#f95c05",
                color: "#fffdf9",
                fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                textTransform: isRTL ? "none" : "uppercase",
              }}
            >
              {category}
            </Link>

            {/* Name */}
            <h1
              className="text-4xl sm:text-5xl font-black leading-tight"
              style={{
                fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                textTransform: isRTL ? "none" : "uppercase",
                color: "#111111",
              }}
            >
              {name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span
                className="text-3xl font-black"
                style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
              >
                $5.00
              </span>
              <span
                className="text-xs uppercase tracking-widest text-[#999]"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {t("inStock")}
              </span>
            </div>

            {/* Description */}
            {description && (
              <div>
                <h3
                  className="text-sm uppercase tracking-widest font-bold mb-2 text-[#999]"
                  style={{
                    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                    textTransform: isRTL ? "none" : "uppercase",
                  }}
                >
                  {t("productDescription")}
                </h3>
                <p
                  className="text-[#444] leading-relaxed"
                  style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                >
                  {description}
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/shop?tag=${encodeURIComponent(tag)}`}
                    className="text-xs px-2 py-1 text-[#666] hover:text-[#f95c05] transition-colors"
                    style={{ background: "#f0ede8", fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              className="btn-primary py-4 text-base mt-2"
              style={{
                background: added ? "#111111" : "#f95c05",
              }}
            >
              {added ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t("addedToCart")}
                </>
              ) : (
                t("addToCart")
              )}
            </button>

            {/* COD Notice */}
            <div
              className="flex items-start gap-3 p-4 border border-[#e5e3de] text-sm"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
            >
              <span className="text-lg shrink-0">💵</span>
              <div>
                <span className="font-bold block text-[#111]">{t("cod")}</span>
                <span className="text-[#666]">{t("codNote")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2
              className="text-2xl sm:text-3xl font-black mb-6"
              style={{
                fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                textTransform: isRTL ? "none" : "uppercase",
                color: "#111111",
              }}
            >
              {isRTL ? "منتجات مشابهة" : "More from this collection"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
