"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { Product, CATEGORIES, CATEGORY_AR } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import SparkdLogo from "@/components/SparkdLogo";

// Clean line-art SVG icons per collection — no emoji
const COLLECTION_ICONS: Record<string, React.ReactNode> = {
  "Lebanese & Cultural": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C9 6 6 8 6 11a6 6 0 0012 0c0-3-3-5-6-9z" />
      <path d="M12 22v-5" />
      <path d="M9 19h6" />
    </svg>
  ),
  "Aesthetic & Visual": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  "Girly & Cute": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  "Manly": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  "Sporty": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
    </svg>
  ),
  "Personality & Lifestyle": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
  "LGBTQ+": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7" x2="12" y2="17" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  ),
  "Weird & Wild": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4-4 8-6 8-10A8 8 0 004 12c0 4 4 6 8 10z" />
      <path d="M12 22v-6" />
      <path d="M9.5 16.5C10 15 12 14 12 12s-2-3-1.5-4.5" />
    </svg>
  ),
  "Custom & Personalized": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
};

// Clean SVG icons for How It Works steps
const STEP_ICONS = {
  pick: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  build: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  light: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 7 6 9 6 13a6 6 0 0012 0c0-4-2-6-6-11z" />
      <path d="M12 22v-3" />
      <path d="M9 18h6" />
    </svg>
  ),
};

export default function HomePage() {
  const { t, isRTL } = useLang();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?limit=8")
      .then((r) => r.json())
      .then((data) => {
        setFeatured(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        {/* Subtle grid texture */}
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
              <button className="btn-primary text-base px-8 py-3.5">{t("shopNow")}</button>
            </Link>
            <Link href="/shop">
              <button
                className="btn-outline text-base px-8 py-3.5"
                style={{ borderColor: "rgba(255,255,255,0.25)", color: "white" }}
              >
                {t("exploreCollections")}
              </button>
            </Link>
          </div>

          <div
            className="mt-1 px-5 py-2 border border-white/15 text-white/40 text-xs tracking-widest uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {isRTL ? "فقط 5$ للولاعة" : "only $5 per lighter · BIC J26"}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-30">
          <div className="w-px h-8 bg-white" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 border-b border-[#e5e3de]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl font-black mb-16" style={{ ...headingStyle, color: "#111111" }}>
            {t("howItWorks")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 relative">
            {/* Connector line (desktop only) */}
            <div
              className="hidden sm:block absolute top-10 left-1/6 right-1/6 h-px"
              style={{ background: "#e5e3de", zIndex: 0 }}
            />

            {[
              { key: "pick", icon: STEP_ICONS.pick, step: "01", title: t("step1Title"), desc: t("step1Desc") },
              { key: "build", icon: STEP_ICONS.build, step: "02", title: t("step2Title"), desc: t("step2Desc") },
              { key: "light", icon: STEP_ICONS.light, step: "03", title: t("step3Title"), desc: t("step3Desc") },
            ].map(({ key, icon, step, title, desc }) => (
              <div key={key} className="relative z-10 flex flex-col items-center text-center gap-4">
                {/* Icon circle */}
                <div
                  className="w-20 h-20 flex items-center justify-center border-2 text-[#f95c05]"
                  style={{ borderColor: "#f95c05", background: "#fffdf9" }}
                >
                  {icon}
                </div>
                <span
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
                >
                  {step}
                </span>
                <h3 className="text-xl font-black" style={{ ...headingStyle, color: "#111111" }}>
                  {title}
                </h3>
                <p
                  className="text-sm text-[#777] leading-relaxed max-w-[220px]"
                  style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collections ── */}
      <section className="py-20 px-4 border-b border-[#e5e3de]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black mb-10" style={{ ...headingStyle, color: "#111111" }}>
            {t("collections")}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ background: "#e5e3de" }}>
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="group flex flex-col gap-3 p-5 sm:p-6 transition-all duration-200 hover:bg-[#f95c05]"
                style={{ background: "#fffdf9" }}
              >
                {/* Index + icon row */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs tracking-[0.15em] uppercase group-hover:text-white transition-colors"
                    style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="text-[#ccc] group-hover:text-white/70 transition-colors">
                    {COLLECTION_ICONS[cat]}
                  </div>
                </div>

                {/* Name */}
                <h3
                  className="text-[#111] group-hover:text-white font-bold text-sm sm:text-base leading-tight transition-colors"
                  style={{
                    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
                    textTransform: isRTL ? "none" : "uppercase",
                    letterSpacing: isRTL ? "0" : "0.04em",
                  }}
                >
                  {isRTL ? CATEGORY_AR[cat] || cat : cat}
                </h3>

                {/* Arrow */}
                <svg
                  className="w-4 h-4 text-[#ccc] group-hover:text-white group-hover:translate-x-1 transition-all mt-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Lighters ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl sm:text-4xl font-black" style={{ ...headingStyle, color: "#111111" }}>
              {t("featuredProducts")}
            </h2>
            <Link
              href="/shop"
              className="text-sm font-bold text-[#f95c05] hover:text-[#d94d03] transition-colors"
              style={{ ...headingStyle, fontSize: "0.8rem" }}
            >
              {isRTL ? "عرض الكل" : "View All"}
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#e5e3de] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 text-center" style={{ background: "#111111" }}>
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">
          {/* Orange accent line */}
          <div className="w-12 h-0.5" style={{ background: "#f95c05" }} />

          <h2
            className="text-white text-4xl sm:text-6xl font-black leading-none"
            style={headingStyle}
          >
            {isRTL ? "ولاعتك، أسلوبك" : "Your Lighter. Your Style."}
          </h2>
          <p
            className="text-white/50 text-base sm:text-lg max-w-sm leading-relaxed"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
          >
            {isRTL
              ? "BIC J26 الأصلية. تصاميم حصرية. توصيل لعندك."
              : "Authentic BIC J26. Exclusive designs. Delivered to your door."}
          </p>
          <Link href="/shop">
            <button className="btn-primary px-10 py-4 text-base mt-2">
              {t("shopNow")}
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
