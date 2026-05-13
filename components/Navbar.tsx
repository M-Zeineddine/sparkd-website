"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { useCartStore } from "@/lib/store";
import SparkdLogo from "@/components/SparkdLogo";

export default function Navbar() {
  const { t, toggleLang, isRTL } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = totalItems();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/shop?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery("");
    setMenuOpen(false);
  };

  return (
    <header
      style={{ background: "#111111" }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <SparkdLogo size="sm" textColor="white" />
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
          <Link
            href="/custom"
            className="text-sm tracking-widest uppercase font-bold px-3 py-1 transition-opacity hover:opacity-80"
            style={{ background: "#f95c05", color: "#fff", fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)" }}
          >
            {isRTL ? "تصميم خاص" : "Custom"}
          </Link>
        </nav>

        {/* Desktop Search (expandable) */}
        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 mx-6"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 bg-white/10 text-white placeholder-white/40 text-sm px-4 py-2 outline-none border-b-2 border-[#f95c05]"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              className="ml-3 text-white/50 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </form>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search Icon */}
          <button
            onClick={() => setSearchOpen((o) => !o)}
            className="hidden md:flex items-center justify-center w-10 h-10 text-white/70 hover:text-[#f95c05] transition-colors"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

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
            {mounted && count > 0 && (
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
            <span className={`block h-0.5 bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/10 py-4 px-4 flex flex-col gap-4"
          style={{ background: "#111111" }}
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 bg-white/10 text-white placeholder-white/40 text-sm px-3 py-2 outline-none border-b border-white/20 focus:border-[#f95c05] transition-colors"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
            />
            <button
              type="submit"
              className="text-white/60 hover:text-[#f95c05] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

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
          <Link
            href="/custom"
            onClick={() => setMenuOpen(false)}
            className="text-lg font-black tracking-widest uppercase w-fit px-4 py-2"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)", background: "#f95c05", color: "#fff" }}
          >
            {isRTL ? "تصميم خاص" : "Custom"}
          </Link>
        </div>
      )}
    </header>
  );
}
