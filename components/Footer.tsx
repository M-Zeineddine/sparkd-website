"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import SparkdLogo from "@/components/SparkdLogo";

export default function Footer() {
  const { t, isRTL } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer
      style={{ background: "#111111", color: "#fffdf9" }}
      className="mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <SparkdLogo size="sm" textColor="white" />
            <p
              className="text-white/50 text-sm"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
            >
              {t("footerTagline")}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/shop"
              className="text-white/60 hover:text-[#f95c05] transition-colors text-sm uppercase tracking-widest"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)" }}
            >
              {t("shop")}
            </Link>
            <Link
              href="/cart"
              className="text-white/60 hover:text-[#f95c05] transition-colors text-sm uppercase tracking-widest"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)" }}
            >
              {t("cart")}
            </Link>
          </div>

          {/* Made in Lebanon */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <span
              className="text-[#f95c05] font-bold text-sm uppercase tracking-widest"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)" }}
            >
              {t("madeIn")}
            </span>
            <span className="text-4xl">🇱🇧</span>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="text-white/30 text-xs"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
          >
            © {year} Spark&apos;d. {t("allRights")}.
          </p>
          <p
            className="text-white/20 text-xs"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
          >
            sparkd.online
          </p>
        </div>
      </div>
    </footer>
  );
}
