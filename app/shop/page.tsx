"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import {
  Product,
  CATEGORIES,
  CATEGORY_AR,
  CATEGORY_TREE,
  SUBCATEGORY_AR,
  SubcategoryInfo,
} from "@/lib/types";
import ProductCard from "@/components/ProductCard";

// ─── Shelf row ────────────────────────────────────────────────────────────────

function SubcategoryShelf({
  sub,
  products,
  isRTL,
  onViewAll,
}: {
  sub: SubcategoryInfo;
  products: Product[];
  isRTL: boolean;
  onViewAll: () => void;
}) {
  const label = isRTL ? SUBCATEGORY_AR[sub.slug] || sub.label : sub.label;
  const PREVIEW = 4;
  const preview = products.slice(0, PREVIEW);
  const remaining = products.length - PREVIEW;

  return (
    <div className="mb-14">
      {/* Row header */}
      <div
        className="flex items-center justify-between mb-4"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        <h2
          className="text-2xl font-black"
          style={{
            fontFamily: isRTL
              ? "var(--font-cairo)"
              : "var(--font-barlow-condensed)",
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
            fontFamily: isRTL
              ? "var(--font-cairo)"
              : "var(--font-barlow-condensed)",
            color: "#f95c05",
            textTransform: isRTL ? "none" : "uppercase",
          }}
        >
          {isRTL ? `عرض الكل (${products.length})` : `View All (${products.length})`}
          <span
            className={`transition-transform duration-150 ${
              isRTL
                ? "group-hover:-translate-x-0.5"
                : "group-hover:translate-x-0.5"
            }`}
          >
            {isRTL ? "←" : "→"}
          </span>
        </button>
      </div>

      {/* Preview strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {preview.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.id}`}
            className="group relative aspect-square overflow-hidden bg-[#e5e3de] block"
          >
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                🔥
              </div>
            )}
          </Link>
        ))}

        {/* +More tile */}
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [activeSubcategory, setActiveSubcategory] = useState(subParam);

  const subcategories = activeCategory ? (CATEGORY_TREE[activeCategory] ?? []) : [];
  const isShelfMode = subcategories.length > 0 && !activeSubcategory;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);

    const currentSubs = CATEGORY_TREE[activeCategory] ?? [];
    const currentIsShelfMode = currentSubs.length > 0 && !activeSubcategory;

    // In shelf mode fetch everything in the category so we can group client-side
    if (!currentIsShelfMode && activeSubcategory) {
      params.set("tag", activeSubcategory);
    }

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

  // Group products by subcategory for shelf mode
  const grouped = subcategories.reduce(
    (acc, sub) => {
      const matching = products.filter((p) => p.tags?.includes(sub.slug));
      if (matching.length > 0) acc[sub.slug] = matching;
      return acc;
    },
    {} as Record<string, Product[]>
  );

  const hasShelfContent = Object.keys(grouped).length > 0;

  // ── Skeleton ──────────────────────────────────────────────────────────────
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
      {/* Header */}
      <div
        className="py-12 px-4 border-b border-[#e5e3de]"
        style={{ background: "#111111" }}
      >
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{
              fontFamily: isRTL
                ? "var(--font-cairo)"
                : "var(--font-barlow-condensed)",
              textTransform: isRTL ? "none" : "uppercase",
            }}
          >
            {t("shop")}
          </h1>
          <p
            className="text-white/50 mt-2 text-sm"
            style={{
              fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)",
            }}
          >
            {isRTL
              ? "ولاعات BIC J26 مخصصة بـ 5$ فقط"
              : "$5 per lighter · authentic BIC J26"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategory("")}
            className="px-4 py-1.5 text-xs font-bold tracking-widest transition-all duration-150"
            style={{
              fontFamily: isRTL
                ? "var(--font-cairo)"
                : "var(--font-barlow-condensed)",
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
                fontFamily: isRTL
                  ? "var(--font-cairo)"
                  : "var(--font-barlow-condensed)",
                textTransform: isRTL ? "none" : "uppercase",
                background:
                  activeCategory === cat ? "#f95c05" : "transparent",
                color: activeCategory === cat ? "#fffdf9" : "#111111",
                border: `2px solid ${
                  activeCategory === cat ? "#f95c05" : "#e5e3de"
                }`,
              }}
            >
              {isRTL ? CATEGORY_AR[cat] || cat : cat}
            </button>
          ))}
        </div>

        {/* Breadcrumb — shown when drilling into a subcategory grid */}
        {activeSubcategory && (
          <div
            className="flex items-center gap-2 mb-6"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            <button
              onClick={clearSubcategory}
              className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 group"
              style={{
                fontFamily: isRTL
                  ? "var(--font-cairo)"
                  : "var(--font-barlow-condensed)",
                color: "#f95c05",
                textTransform: isRTL ? "none" : "uppercase",
              }}
            >
              <span
                className={`transition-transform duration-150 ${
                  isRTL
                    ? "group-hover:translate-x-0.5"
                    : "group-hover:-translate-x-0.5"
                }`}
              >
                {isRTL ? "→" : "←"}
              </span>
              {isRTL
                ? CATEGORY_AR[activeCategory] || activeCategory
                : activeCategory}
            </button>
            <span className="text-[#ccc] text-xs">/</span>
            <span
              className="text-xs font-bold uppercase tracking-widest text-[#111]"
              style={{
                fontFamily: isRTL
                  ? "var(--font-cairo)"
                  : "var(--font-barlow-condensed)",
                textTransform: isRTL ? "none" : "uppercase",
              }}
            >
              {isRTL
                ? SUBCATEGORY_AR[activeSubcategory] || activeSubcategory
                : subcategories.find((s) => s.slug === activeSubcategory)
                    ?.label || activeSubcategory}
            </span>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────── */}

        {loading ? (
          isShelfMode ? <ShelfSkeleton /> : <GridSkeleton />
        ) : isShelfMode ? (
          // SHELF MODE
          hasShelfContent ? (
            <div>
              {subcategories
                .filter((sub) => grouped[sub.slug])
                .map((sub) => (
                  <SubcategoryShelf
                    key={sub.slug}
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
              onReset={() => {
                setActiveCategory("");
                setActiveSubcategory("");
                router.replace("/shop");
              }}
              allLabel={t("allCollections")}
            />
          )
        ) : (
          // GRID MODE
          <>
            {products.length > 0 && (
              <p
                className="text-sm text-[#999] mb-6"
                style={{
                  fontFamily: isRTL
                    ? "var(--font-cairo)"
                    : "var(--font-barlow)",
                }}
              >
                {isRTL
                  ? `${products.length} منتج`
                  : `${products.length} wraps`}
              </p>
            )}
            {products.length === 0 ? (
              <EmptyState
                isRTL={isRTL}
                onReset={() => {
                  setActiveCategory("");
                  setActiveSubcategory("");
                  router.replace("/shop");
                }}
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

function EmptyState({
  isRTL,
  onReset,
  allLabel,
}: {
  isRTL: boolean;
  onReset: () => void;
  allLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <span className="text-6xl">🔥</span>
      <p
        className="text-xl font-bold"
        style={{
          fontFamily: isRTL
            ? "var(--font-cairo)"
            : "var(--font-barlow-condensed)",
          textTransform: isRTL ? "none" : "uppercase",
          color: "#111111",
        }}
      >
        {isRTL ? "لا توجد منتجات" : "No wraps found"}
      </p>
      <button onClick={onReset} className="btn-outline text-sm">
        {allLabel}
      </button>
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#fffdf9" }}
        >
          <div className="w-8 h-8 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
