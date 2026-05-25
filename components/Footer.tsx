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
            {[
              { href: "/shop", label: t("shop") },
              { href: "/custom", label: isRTL ? "تصميم خاص" : "Custom" },
              { href: "/policies", label: isRTL ? "التوصيل والسياسات" : "Delivery & Policies" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-white/60 hover:text-[#f95c05] transition-colors text-sm uppercase tracking-widest"
                style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Social + Made in Lebanon */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/sparkd.lighters"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-[#f95c05]"
                style={{ background: "rgba(255,255,255,0.08)" }}
                aria-label="Instagram"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://wa.me/96171746548"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-[#25d366]"
                style={{ background: "rgba(255,255,255,0.08)" }}
                aria-label="WhatsApp"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <span
                className="text-[#f95c05] font-bold text-sm uppercase tracking-widest"
                style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)" }}
              >
                {t("madeIn")}
              </span>
              <span className="text-3xl">🇱🇧</span>
            </div>
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
