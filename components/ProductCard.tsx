"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useCartStore } from "@/lib/store";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { t, lang, isRTL } = useLang();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const name = lang === "ar" ? product.name_ar || product.name : product.name;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div className="bg-white border border-brand-gray hover:border-[#f95c05] transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#f0ede8]">
          <Image
            src={product.image_url}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
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
            $5.00
          </p>

          <button
            onClick={handleAdd}
            className="w-full py-2 text-xs font-bold tracking-widest uppercase transition-all duration-200"
            style={{
              background: added ? "#111111" : "#f95c05",
              color: "#fffdf9",
              fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
              textTransform: isRTL ? "none" : "uppercase",
              letterSpacing: isRTL ? "0" : "0.08em",
            }}
          >
            {added ? t("addedToCart") : t("addToCart")}
          </button>
        </div>
      </div>
    </Link>
  );
}
