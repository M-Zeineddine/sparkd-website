"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useLang } from "@/lib/i18n";

// Add new screenshot filenames here (place files in public/reviews/)
const REVIEWS = [
  { src: "/reviews/review-1.jpeg", alt: "Customer review screenshot" },
];

export default function ReviewsCarousel() {
  const { isRTL } = useLang();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = REVIEWS.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    intervalRef.current = setInterval(next, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next, paused, total]);

  const headingStyle = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
    textTransform: isRTL ? "none" as const : "uppercase" as const,
  };

  return (
    <section className="py-20 px-4" style={{ background: "#111111" }}>
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-10">

        {/* Heading */}
        <div className="text-center flex flex-col gap-2">
          <span
            className="text-xs tracking-[0.2em] uppercase font-bold"
            style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
          >
            {isRTL ? "آراء العملاء" : "Customer Reviews"}
          </span>
          <h2
            className="text-3xl sm:text-4xl font-black text-white"
            style={headingStyle}
          >
            {isRTL ? "ماذا يقولون" : "What They Say"}
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="relative w-full flex items-center justify-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Prev arrow */}
          {total > 1 && (
            <button
              onClick={prev}
              className="absolute left-0 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-colors"
              style={{ background: "rgba(255,255,255,0.08)" }}
              aria-label="Previous review"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Image frame */}
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: 16,
              maxWidth: 320,
              width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            <Image
              src={REVIEWS[index].src}
              alt={REVIEWS[index].alt}
              width={320}
              height={480}
              className="w-full h-auto object-contain"
              style={{ display: "block" }}
              unoptimized
            />
          </div>

          {/* Next arrow */}
          {total > 1 && (
            <button
              onClick={next}
              className="absolute right-0 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-colors"
              style={{ background: "rgba(255,255,255,0.08)" }}
              aria-label="Next review"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation: dots ≤ 7 images, counter beyond */}
        {total > 1 && (
          total <= 7 ? (
            <div className="flex items-center gap-2">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="transition-all rounded-full"
                  style={{
                    width: i === index ? 24 : 6,
                    height: 6,
                    background: i === index ? "#f95c05" : "rgba(255,255,255,0.2)",
                  }}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          ) : (
            <span
              className="text-sm font-bold tabular-nums"
              style={{ fontFamily: "var(--font-barlow-condensed)", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}
            >
              {index + 1} / {total}
            </span>
          )
        )}
      </div>
    </section>
  );
}
