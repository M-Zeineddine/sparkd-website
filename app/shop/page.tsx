"use client";

import { useEffect, useState, useRef, Suspense } from "react";
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
  const searchParam = searchParams.get("search") || "";

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [activeSubcategory, setActiveSubcategory] = useState(subParam);
  const [activeSearch, setActiveSearch] = useState(searchParam);
  const [searchInput, setSearchInput] = useState(searchParam);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeCategoryRecord = categories.find((c) => c.name === activeCategory);
  const subcategories: SubcategoryRecord[] = activeCategoryRecord?.subcategories ?? [];
  const isShelfMode = subcategories.length > 0 && !activeSubcategory && !activeSearch;

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  // Sync search param from URL (e.g. when navigating from navbar)
  useEffect(() => {
    setActiveSearch(searchParam);
    setSearchInput(searchParam);
  }, [searchParam]);

  // Debounced search — fires 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = searchInput.trim();
      if (q === activeSearch) return;
      if (q) {
        setActiveSearch(q);
        setActiveCategory("");
        setActiveSubcategory("");
        const p = new URLSearchParams();
        p.set("search", q);
        router.replace(`/shop?${p.toString()}`, { scroll: false });
      } else {
        setActiveSearch("");
        router.replace("/shop", { scroll: false });
      }
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (activeSearch) {
      params.set("search", activeSearch);
    } else {
      if (activeCategory) params.set("category", activeCategory);

      const currentSubs = categories.find((c) => c.name === activeCategory)?.subcategories ?? [];
      const currentIsShelfMode = currentSubs.length > 0 && !activeSubcategory;
      if (!currentIsShelfMode && activeSubcategory) params.set("tag", activeSubcategory);
    }

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory, activeSubcategory, activeSearch, categories]);

  const handleCategory = (cat: string) => {
    const next = activeCategory === cat ? "" : cat;
    setActiveCategory(next);
    setActiveSubcategory("");
    setActiveSearch("");
    const p = new URLSearchParams();
    if (next) p.set("category", next);
    router.replace(`/shop?${p.toString()}`, { scroll: false });
  };

  const handleSubcategory = (slug: string) => {
    setActiveSubcategory(slug);
    setActiveSearch("");
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

  const clearSearch = () => {
    setActiveSearch("");
    setSearchInput("");
    router.replace("/shop", { scroll: false });
  };

  const handleShopSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    setActiveSearch(q);
    setActiveCategory("");
    setActiveSubcategory("");
    const p = new URLSearchParams();
    p.set("search", q);
    router.replace(`/shop?${p.toString()}`, { scroll: false });
    searchInputRef.current?.blur();
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

        {/* Search bar */}
        <form
          onSubmit={handleShopSearch}
          className="flex items-center gap-2 mb-6"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          <div className="flex items-center flex-1 border-2 border-[#e5e3de] focus-within:border-[#f95c05] transition-colors" style={{ background: "#fff" }}>
            <svg className="shrink-0 mx-3 text-[#999]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 py-2 pr-3 text-sm bg-transparent outline-none text-[#111] placeholder-[#aaa]"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="shrink-0 mx-2 text-[#aaa] hover:text-[#111] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold tracking-widest transition-all duration-150"
            style={{
              fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
              textTransform: isRTL ? "none" : "uppercase",
              background: "#111111",
              color: "#fffdf9",
            }}
          >
            {isRTL ? "بحث" : "Search"}
          </button>
        </form>

        {/* Search results banner */}
        {activeSearch && (
          <div
            className="flex items-center gap-3 mb-6"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            <span
              className="text-sm text-[#999]"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
            >
              {products.length} {t("searchResultsFor")}{" "}
              <span className="font-bold text-[#111]">"{activeSearch}"</span>
            </span>
            <button
              onClick={clearSearch}
              className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-[#f95c05] transition-colors"
              style={{
                fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                color: "#f95c05",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              {t("clearSearch")}
            </button>
          </div>
        )}

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
