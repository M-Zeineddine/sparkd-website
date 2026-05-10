"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import { Product, CategoryRecord, SubcategoryRecord } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

// ─── Shelf row ────────────────────────────────────────────────────────────────

function SubcategoryShelf({
  sub,
  products,
  isRTL,
  onViewAll,
}: {
  sub: SubcategoryRecord;
  products: Product[];
  isRTL: boolean;
  onViewAll: () => void;
}) {
  const label = isRTL ? sub.name_ar || sub.name : sub.name;
  const PREVIEW = 4;
  const preview = products.slice(0, PREVIEW);
  const remaining = products.length - PREVIEW;

  return (
    <div className="mb-14">
      <div
        className="flex items-center justify-between mb-4"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        <h2
          className="text-2xl font-black"
          style={{
            fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
            textTransform: isRTL ? "none" : "uppercase",
            color: "#111111",
            letterSpacing: isRTL ? "0" : "-0.01em",
          }}
        >
          {label}
        </h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest group"
          style={{
            fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
            color: "#f95c05",
            textTransform: isRTL ? "none" : "uppercase",
          }}
        >
          {isRTL ? `عرض الكل (${products.length})` : `View All (${products.length})`}
          <span
            className={`transition-transform duration-150 ${
              isRTL ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
            }`}
          >
            {isRTL ? "←" : "→"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {preview.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.id}`}
            className="group relative aspect-square overflow-hidden block"
            style={{ background: "#fffdf9" }}
          >
            {(product.image_urls?.[0] || product.image_url) ? (
              <Image
                src={product.image_urls?.[0] || product.image_url}
                alt={product.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🔥</div>
            )}
            {product.in_stock === false && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(180,180,180,0.55)" }}>
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-2 py-1"
                  style={{ background: "#111", color: "#fff", fontFamily: "var(--font-barlow-condensed)" }}
                >
                  Sold Out
                </span>
              </div>
            )}
          </Link>
        ))}

        {remaining > 0 && (
          <button
            onClick={onViewAll}
            className="aspect-square flex flex-col items-center justify-center gap-1 group transition-colors duration-150"
            style={{ background: "#111111" }}
          >
            <span
              className="text-3xl font-black text-white group-hover:text-[#f95c05] transition-colors duration-150"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              +{remaining}
            </span>
            <span
              className="text-[10px] text-white/40 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              {isRTL ? "المزيد" : "More"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main shop content ────────────────────────────────────────────────────────

function ShopContent() {
  const { t, isRTL } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("category") || "";
  const subParam = searchParams.get("tag") || "";

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [activeSubcategory, setActiveSubcategory] = useState(subParam);

  const activeCategoryRecord = categories.find((c) => c.name === activeCategory);
  const subcategories: SubcategoryRecord[] = activeCategoryRecord?.subcategories ?? [];
  const isShelfMode = subcategories.length > 0 && !activeSubcategory;

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);

    const currentSubs = categories.find((c) => c.name === activeCategory)?.subcategories ?? [];
    const currentIsShelfMode = currentSubs.length > 0 && !activeSubcategory;

    if (!currentIsShelfMode && activeSubcategory) params.set("tag", activeSubcategory);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory, activeSubcategory, categories]);

  const handleCategory = (cat: string) => {
    const next = activeCategory === cat ? "" : cat;
    setActiveCategory(next);
    setActiveSubcategory("");
    const p = new URLSearchParams();
    if (next) p.set("category", next);
    router.replace(`/shop?${p.toString()}`, { scroll: false });
  };

  const handleSubcategory = (slug: string) => {
    setActiveSubcategory(slug);
    const p = new URLSearchParams();
    if (activeCategory) p.set("category", activeCategory);
    p.set("tag", slug);
    router.replace(`/shop?${p.toString()}`, { scroll: false });
  };

  const clearSubcategory = () => {
    setActiveSubcategory("");
    const p = new URLSearchParams();
    if (activeCategory) p.set("category", activeCategory);
    router.replace(`/shop?${p.toString()}`, { scroll: false });
  };

  const grouped = subcategories.reduce(
    (acc, sub) => {
      const matching = products.filter((p) => p.tags?.includes(sub.slug));
      if (matching.length > 0) acc[sub.slug] = matching;
      return acc;
    },
    {} as Record<string, Product[]>
  );

  const hasShelfContent = Object.keys(grouped).length > 0;

  const ShelfSkeleton = () => (
    <div className="space-y-14">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-7 w-48 bg-[#e5e3de] animate-pulse rounded-sm" />
            <div className="h-4 w-24 bg-[#e5e3de] animate-pulse rounded-sm" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="aspect-square bg-[#e5e3de] animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const GridSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-square bg-[#e5e3de] animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#fffdf9" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
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
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.name)}
              className="px-4 py-1.5 text-xs font-bold tracking-widest transition-all duration-150"
              style={{
                fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                textTransform: isRTL ? "none" : "uppercase",
                background: activeCategory === cat.name ? "#f95c05" : "transparent",
                color: activeCategory === cat.name ? "#fffdf9" : "#111111",
                border: `2px solid ${activeCategory === cat.name ? "#f95c05" : "#e5e3de"}`,
              }}
            >
              {isRTL ? cat.name_ar || cat.name : cat.name}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        {activeSubcategory && (
          <div
            className="flex items-center gap-2 mb-6"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            <button
              onClick={clearSubcategory}
              className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 group"
              style={{
                fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                color: "#f95c05",
                textTransform: isRTL ? "none" : "uppercase",
              }}
            >
              <span
                className={`transition-transform duration-150 ${
                  isRTL ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"
                }`}
              >
                {isRTL ? "→" : "←"}
              </span>
              {isRTL ? activeCategoryRecord?.name_ar || activeCategory : activeCategory}
            </button>
            <span className="text-[#ccc] text-xs">/</span>
            <span
              className="text-xs font-bold uppercase tracking-widest text-[#111]"
              style={{
                fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                textTransform: isRTL ? "none" : "uppercase",
              }}
            >
              {isRTL
                ? subcategories.find((s) => s.slug === activeSubcategory)?.name_ar || activeSubcategory
                : subcategories.find((s) => s.slug === activeSubcategory)?.name || activeSubcategory}
            </span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          isShelfMode ? <ShelfSkeleton /> : <GridSkeleton />
        ) : isShelfMode ? (
          hasShelfContent ? (
            <div>
              {subcategories
                .filter((sub) => grouped[sub.slug])
                .map((sub) => (
                  <SubcategoryShelf
                    key={sub.id}
                    sub={sub}
                    products={grouped[sub.slug]}
                    isRTL={isRTL}
                    onViewAll={() => handleSubcategory(sub.slug)}
                  />
                ))}
            </div>
          ) : (
            <EmptyState
              isRTL={isRTL}
              onReset={() => { setActiveCategory(""); setActiveSubcategory(""); router.replace("/shop"); }}
              allLabel={t("allCollections")}
            />
          )
        ) : (
          <>
            {products.length > 0 && (
              <p
                className="text-sm text-[#999] mb-6"
                style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
              >
                {isRTL ? `${products.length} تصميم` : `${products.length} designs`}
              </p>
            )}
            {products.length === 0 ? (
              <EmptyState
                isRTL={isRTL}
                onReset={() => { setActiveCategory(""); setActiveSubcategory(""); router.replace("/shop"); }}
                allLabel={t("allCollections")}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ isRTL, onReset, allLabel }: { isRTL: boolean; onReset: () => void; allLabel: string }) {
  return (
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
        {isRTL ? "لا توجد تصاميم" : "No designs found"}
      </p>
      <button onClick={onReset} className="btn-outline text-sm">{allLabel}</button>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fffdf9" }}>
        <div className="w-8 h-8 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
