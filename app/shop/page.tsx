"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { Product, CATEGORIES, CATEGORY_AR, CATEGORY_TREE, SUBCATEGORY_AR } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

function ShopContent() {
  const { t, isRTL } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("category") || "";
  const subParam = searchParams.get("tag") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [activeSubcategory, setActiveSubcategory] = useState(subParam);

  const subcategories = activeCategory ? (CATEGORY_TREE[activeCategory] ?? []) : [];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activeSubcategory) params.set("tag", activeSubcategory);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory, activeSubcategory]);

  const handleCategory = (cat: string) => {
    const next = activeCategory === cat ? "" : cat;
    setActiveCategory(next);
    setActiveSubcategory("");
    const p = new URLSearchParams();
    if (next) p.set("category", next);
    router.replace(`/shop?${p.toString()}`, { scroll: false });
  };

  const handleSubcategory = (slug: string) => {
    const next = activeSubcategory === slug ? "" : slug;
    setActiveSubcategory(next);
    const p = new URLSearchParams();
    if (activeCategory) p.set("category", activeCategory);
    if (next) p.set("tag", next);
    router.replace(`/shop?${p.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen" style={{ background: "#fffdf9" }}>
      {/* Header */}
      <div
        className="py-12 px-4 border-b border-[#e5e3de]"
        style={{ background: "#111111" }}
      >
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{
              fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
              textTransform: isRTL ? "none" : "uppercase",
            }}
          >
            {t("shop")}
          </h1>
          <p
            className="text-white/50 mt-2 text-sm"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
          >
            {isRTL ? "ولاعات BIC J26 مخصصة بـ 5$ فقط" : "$5 per lighter · authentic BIC J26"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => handleCategory("")}
            className="px-4 py-1.5 text-xs font-bold tracking-widest transition-all duration-150"
            style={{
              fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
              textTransform: isRTL ? "none" : "uppercase",
              background: activeCategory === "" ? "#111111" : "transparent",
              color: activeCategory === "" ? "#fffdf9" : "#111111",
              border: "2px solid #111111",
            }}
          >
            {t("allCollections")}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className="px-4 py-1.5 text-xs font-bold tracking-widest transition-all duration-150"
              style={{
                fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                textTransform: isRTL ? "none" : "uppercase",
                background: activeCategory === cat ? "#f95c05" : "transparent",
                color: activeCategory === cat ? "#fffdf9" : "#111111",
                border: `2px solid ${activeCategory === cat ? "#f95c05" : "#e5e3de"}`,
              }}
            >
              {isRTL ? CATEGORY_AR[cat] || cat : cat}
            </button>
          ))}
        </div>

        {/* Subcategory Pills */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-[#e5e3de]">
            {subcategories.map(({ label, slug }) => (
              <button
                key={slug}
                onClick={() => handleSubcategory(slug)}
                className="px-3 py-1 text-xs font-semibold transition-all duration-150"
                style={{
                  fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)",
                  background: activeSubcategory === slug ? "#111111" : "#f0ede8",
                  color: activeSubcategory === slug ? "#fffdf9" : "#444444",
                  borderRadius: "2px",
                }}
              >
                {isRTL ? SUBCATEGORY_AR[slug] || label : label}
              </button>
            ))}
          </div>
        )}

        {subcategories.length === 0 && activeCategory && (
          <div className="mb-8 pb-6 border-b border-[#e5e3de]" />
        )}

        {/* Results count */}
        {!loading && (
          <p
            className="text-sm text-[#999] mb-6"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
          >
            {isRTL ? `${products.length} منتج` : `${products.length} wraps`}
            {activeCategory && (
              <span>
                {" "}{isRTL ? "في" : "in"}{" "}
                <span className="text-[#f95c05] font-semibold">
                  {isRTL ? CATEGORY_AR[activeCategory] || activeCategory : activeCategory}
                </span>
              </span>
            )}
            {activeSubcategory && (
              <span>
                {" "}·{" "}
                <span className="text-[#f95c05] font-semibold">
                  {isRTL
                    ? SUBCATEGORY_AR[activeSubcategory] || activeSubcategory
                    : subcategories.find((s) => s.slug === activeSubcategory)?.label || activeSubcategory}
                </span>
              </span>
            )}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-[#e5e3de] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-6xl">🔥</span>
            <p
              className="text-xl font-bold"
              style={{
                fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                textTransform: isRTL ? "none" : "uppercase",
                color: "#111111",
              }}
            >
              {isRTL ? "لا توجد منتجات" : "No wraps found"}
            </p>
            <button
              onClick={() => { setActiveCategory(""); setActiveSubcategory(""); router.replace("/shop"); }}
              className="btn-outline text-sm"
            >
              {t("allCollections")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#fffdf9" }}><div className="w-8 h-8 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
