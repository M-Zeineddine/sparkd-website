"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { useCartStore } from "@/lib/store";

export default function Navbar() {
  const { t, toggleLang, isRTL } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = totalItems();

  return (
    <header
      style={{ background: "#111111" }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.svg"
            alt="Spark'd"
            width={120}
            height={40}
            className="h-10 w-auto object-contain brightness-0 invert"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav
          className={`hidden md:flex items-center gap-8 ${isRTL ? "font-arabic" : "font-heading"}`}
          style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)" }}
        >
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors text-sm tracking-widest uppercase"
          >
            {t("home")}
          </Link>
          <Link
            href="/shop"
            className="text-white/80 hover:text-white transition-colors text-sm tracking-widest uppercase"
          >
            {t("shop")}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="text-white/70 hover:text-[#f95c05] transition-colors text-sm font-semibold tracking-wide px-2 py-1"
            style={{ fontFamily: isRTL ? "var(--font-barlow-condensed)" : "var(--font-cairo)" }}
          >
            {t("toggleLang")}
          </button>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative flex items-center justify-center w-10 h-10 text-white hover:text-[#f95c05] transition-colors"
            aria-label={t("cart")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                style={{ background: "#f95c05" }}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 w-6 py-1"
            aria-label="Menu"
          >
            <span
              className={`block h-0.5 bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block h-0.5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/10 py-4 px-4 flex flex-col gap-4"
          style={{ background: "#111111" }}
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-white/80 hover:text-white text-lg font-heading tracking-widest uppercase"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)" }}
          >
            {t("home")}
          </Link>
          <Link
            href="/shop"
            onClick={() => setMenuOpen(false)}
            className="text-white/80 hover:text-white text-lg font-heading tracking-widest uppercase"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)" }}
          >
            {t("shop")}
          </Link>
        </div>
      )}
    </header>
  );
}
