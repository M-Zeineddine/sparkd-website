"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useCartStore } from "@/lib/store";
import { mergeSizes } from "@/lib/constants";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { t, lang, isRTL } = useLang();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const name = lang === "ar" ? product.name_ar || product.name : product.name;

  const inStock = product.in_stock !== false;
  const availableSize = mergeSizes(product.sizes).find((s) => s.available) ?? mergeSizes(product.sizes)[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product, availableSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div className="bg-white border border-brand-gray transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ background: "#fffdf9" }}>
          {(product.image_urls?.[0] || product.image_url) ? (
            <>
              <Image
                src={product.image_urls?.[0] || product.image_url}
                alt={name}
                fill
                className={`object-contain transition-transform duration-500 ${inStock ? "group-hover:scale-105" : ""}`}
                style={{ filter: inStock ? "none" : "grayscale(60%)" }}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(180,180,180,0.55)" }}>
                  <span
                    className="px-3 py-1.5 text-xs font-black uppercase tracking-widest"
                    style={{ background: "#111", color: "#fff", fontFamily: "var(--font-barlow-condensed)", letterSpacing: "0.12em" }}
                  >
                    Sold Out
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#bbb]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                Coming Soon
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4">
          <h3
            className="text-[#111111] font-bold text-sm sm:text-base leading-tight mb-1 line-clamp-2"
            style={{
              fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
              textTransform: isRTL ? "none" : "uppercase",
              letterSpacing: isRTL ? "0" : "0.02em",
            }}
          >
            {name}
          </h3>
          <p
            className="text-[#f95c05] font-bold text-sm mb-3"
            style={{ fontFamily: "var(--font-barlow-condensed)", textTransform: "uppercase", letterSpacing: "0.04em" }}
          >
            ${Number(availableSize.price).toFixed(2)}
          </p>

          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="w-full py-2 text-xs font-bold tracking-widest uppercase transition-all duration-200"
            style={{
              background: !inStock ? "#999" : added ? "#111111" : "#f95c05",
              color: "#fffdf9",
              cursor: inStock ? "pointer" : "not-allowed",
              fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
              textTransform: isRTL ? "none" : "uppercase",
              letterSpacing: isRTL ? "0" : "0.08em",
            }}
          >
            {!inStock ? (isRTL ? "نفذت الكمية" : "Sold Out") : added ? t("addedToCart") : t("addToCart")}
          </button>
        </div>
      </div>
    </Link>
  );
}
