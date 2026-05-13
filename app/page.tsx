"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { Product, CategoryRecord } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import SparkdLogo from "@/components/SparkdLogo";

const COLLECTION_ICONS: Record<string, React.ReactNode> = {
  "Anime & Manga": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  "Characters": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  "Lebanese & Arabic": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C9 6 6 8 6 11a6 6 0 0012 0c0-3-3-5-6-9z" /><path d="M12 22v-5" /><path d="M9 19h6" />
    </svg>
  ),
  "Hip-Hop": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ),
  "Dark & Streetwear": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  "Aesthetic": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4-4 8-6 8-10A8 8 0 004 12c0 4 4 6 8 10z" />
    </svg>
  ),
  "Cats": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5C8 5 4 8 4 12c0 5 4 8 8 8s8-3 8-8c0-4-4-7-8-7z" /><path d="M4 12C2 10 2 6 4 5l2 3" /><path d="M20 12c2-2 2-6 0-7l-2 3" />
    </svg>
  ),
};


export default function HomePage() {
  const { t, isRTL } = useLang();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?best_seller=true")
      .then((r) => r.json())
      .then((data) => { setBestSellers(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));

    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const headingStyle = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
    textTransform: isRTL ? "none" as const : "uppercase" as const,
  };

  return (
    <div style={{ background: "#fffdf9" }}>

      {/* ── Hero ── */}
      <section
        className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4"
        style={{ background: "#111111" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 0, transparent 60px),
                              repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 60px)`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#f95c05" }} />

        <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-3xl mx-auto animate-fade-in-up">
          <SparkdLogo size="lg" textColor="white" />

          <h1
            className="text-[#f95c05] text-5xl sm:text-7xl md:text-8xl font-black leading-none"
            style={{ ...headingStyle, letterSpacing: isRTL ? "0" : "-0.01em" }}
          >
            {t("tagline")}
          </h1>

          <p
            className="text-white/60 text-base sm:text-lg max-w-md leading-relaxed"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
          >
            {t("heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/shop">
              <button
                className="btn-outline text-base py-3.5 whitespace-nowrap"
                style={{ borderColor: "rgba(255,255,255,0.25)", color: "white", width: "190px", height: "52px" }}
              >
                {t("shopNow")}
              </button>
            </Link>
            <Link href="/custom">
              <button
                className="btn-primary text-base py-3.5 whitespace-nowrap"
                style={{ width: "190px", height: "52px" }}
              >
                {isRTL ? "اطلب تصميمك" : "Get Custom"}
              </button>
            </Link>
          </div>

        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-30">
          <div className="w-px h-8 bg-white" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── Bundle Deal ── */}
      <section className="py-16 px-4" style={{ background: "#fffdf9", borderTop: "4px solid #f95c05" }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex gap-5 items-stretch">
            <div className="w-1.5 shrink-0 rounded-full" style={{ background: "#f95c05" }} />
            <div className="flex flex-col gap-3">
              <span
                className="text-xs tracking-[0.2em] uppercase font-bold"
                style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
              >
                Limited Offer
              </span>
              <h2
                className="text-6xl sm:text-8xl font-black leading-none"
                style={{ fontFamily: "var(--font-barlow-condensed)", color: "#111111", textTransform: "uppercase" }}
              >
                3 Large
                <br />
                <span style={{ color: "#f95c05" }}>for $10</span>
              </h2>
              <p
                className="text-[#777] text-sm max-w-xs leading-relaxed"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                Pick any 3 Large lighters from our collection and get them bundled at a special price.
              </p>
            </div>
          </div>
          <Link href="/shop?size=L">
            <button className="btn-primary px-10 py-4 text-base shrink-0">
              Shop the Bundle
            </button>
          </Link>
        </div>
      </section>


      {/* ── Collections ── */}
      <section className="py-10 px-4 border-b border-[#e5e3de]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black mb-10" style={{ ...headingStyle, color: "#111111" }}>
            {t("collections")}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ background: "#e5e3de" }}>
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col gap-3 p-5 sm:p-6 transition-all duration-200 hover:bg-[#f95c05]"
                style={{ background: "#fffdf9" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs tracking-[0.15em] uppercase group-hover:text-white transition-colors"
                    style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="text-[#ccc] group-hover:text-white/70 transition-colors">
                    {COLLECTION_ICONS[cat.name]}
                  </div>
                </div>

                <h3
                  className="text-[#111] group-hover:text-white font-bold text-sm sm:text-base leading-tight transition-colors"
                  style={{
                    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                    textTransform: isRTL ? "none" : "uppercase",
                    letterSpacing: isRTL ? "0" : "0.04em",
                  }}
                >
                  {isRTL ? cat.name_ar || cat.name : cat.name}
                </h3>

                <svg className="w-4 h-4 text-[#ccc] group-hover:text-white group-hover:translate-x-1 transition-all mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      {(loading || bestSellers.length > 0) && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-black" style={{ ...headingStyle, color: "#111111" }}>
                {isRTL ? "الأكثر مبيعاً" : "Best Sellers"}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-[#e5e3de] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Custom Designs ── */}
      <section className="py-20 px-4" style={{ background: "#fffdf9", borderTop: "4px solid #f95c05" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Text side */}
            <div className="flex-1 flex flex-col gap-6" style={{ direction: isRTL ? "rtl" : "ltr" }}>
              <span
                className="text-xs tracking-[0.2em] uppercase font-bold"
                style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
              >
                {isRTL ? "تصميم حصري" : "Exclusive Service"}
              </span>
              <h2
                className="text-5xl sm:text-7xl font-black leading-none"
                style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)", textTransform: isRTL ? "none" : "uppercase", color: "#111111" }}
              >
                {isRTL ? "تصميمك\nأنت" : "Your Design.\nYour Lighter."}
              </h2>
              <p
                className="text-base leading-relaxed max-w-sm"
                style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)", color: "#777" }}
              >
                {isRTL
                  ? "ما لقيت تصميمك؟ أرسل لنا فكرتك وبنحوّلها ولاعة حصرية تخصك أنت."
                  : "Want your own design on a lighter? Send us your idea and we'll make it happen."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link href="/custom">
                  <button className="btn-primary px-8 py-3.5 text-base">
                    {isRTL ? "اطلب تصميمك" : "Get Custom"}
                  </button>
                </Link>
              </div>
            </div>

            {/* Visual side */}
            <div className="flex-1 w-full grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square flex items-center justify-center"
                  style={{ background: i % 2 === 0 ? "#f0ede8" : "#e8e5e0" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              ))}
              <div
                className="aspect-square col-span-3 flex items-center justify-center gap-2"
                style={{ background: "#f95c05" }}
              >
                <span
                  className="text-white font-black text-lg uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-barlow-condensed)" }}
                >
                  {isRTL ? "أمثلة قريباً" : "Examples Coming Soon"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
