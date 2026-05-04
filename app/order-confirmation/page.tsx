"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/i18n";

function ConfirmationContent() {
  const { t, isRTL } = useLang();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const fontHeading = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
    textTransform: isRTL ? "none" as const : "uppercase" as const,
  };
  const fontBody = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center"
      style={{ background: "#fffdf9" }}
    >
      {/* Success Icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
        style={{ background: "#f95c05" }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Title */}
      <h1
        className="text-4xl sm:text-6xl font-black text-[#111111] mb-4"
        style={fontHeading}
      >
        {t("orderConfirmed")}
      </h1>

      {/* Subtitle */}
      <p
        className="text-[#666] text-base sm:text-lg max-w-md leading-relaxed mb-6"
        style={fontBody}
      >
        {t("orderConfirmedSub")}
      </p>

      {/* Order Number */}
      {orderNumber && (
        <div
          className="px-6 py-4 border-2 border-[#111111] mb-10"
        >
          <span
            className="text-sm uppercase tracking-widest block text-[#999] mb-1"
            style={{ fontFamily: "var(--font-barlow-condensed)", letterSpacing: "0.12em" }}
          >
            {t("orderNumber")}
          </span>
          <span
            className="text-3xl font-black text-[#f95c05]"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {orderNumber}
          </span>
        </div>
      )}

      {/* COD reminder */}
      <div
        className="flex items-center gap-3 px-6 py-4 mb-10 max-w-sm w-full"
        style={{ background: "#111111" }}
      >
        <span className="text-2xl">💵</span>
        <p
          className="text-sm text-white/70 text-left"
          style={fontBody}
        >
          {isRTL
            ? "ادفع نقداً عند استلام طلبك"
            : "Pay cash when your order arrives at your door"}
        </p>
      </div>

      {/* CTA */}
      <Link href="/shop">
        <button className="btn-primary px-10 py-4 text-base">
          {t("backToShop")}
        </button>
      </Link>

      {/* Decorative */}
      <p
        className="mt-10 text-[#ccc] text-sm"
        style={{ fontFamily: "var(--font-barlow-condensed)", letterSpacing: "0.2em", textTransform: "uppercase" }}
      >
        Spark&apos;d · Light It Your Way 🔥
      </p>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#fffdf9" }}><div className="w-8 h-8 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
