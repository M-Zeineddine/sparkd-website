"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { DEFAULT_SIZES } from "@/lib/constants";

export default function CartDrawer() {
  const { t, isRTL } = useLang();
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();
  const total = totalPrice();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 ${isRTL ? "left-0" : "right-0"} h-full w-full sm:w-96 z-50 flex flex-col animate-slide-in-right`}
        style={{ background: "#fffdf9" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-[#e5e3de]"
        >
          <h2
            className="text-lg font-bold uppercase tracking-widest"
            style={{
              fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
              color: "#111111",
              textTransform: isRTL ? "none" : "uppercase",
            }}
          >
            {t("yourCart")} {items.length > 0 && `(${items.reduce((s, i) => s + i.quantity, 0)})`}
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-[#111111] hover:text-[#f95c05] transition-colors"
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1cfc9" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <div>
                <p
                  className="text-[#111111] font-bold text-lg"
                  style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)", textTransform: isRTL ? "none" : "uppercase" }}
                >
                  {t("emptyCart")}
                </p>
                <p
                  className="text-[#999] text-sm mt-1"
                  style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                >
                  {t("emptyCartSub")}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="btn-primary text-sm px-6 py-2.5"
              >
                {t("continueShopping")}
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map(({ cartKey, product, size, quantity }) => {
                const name = product.name;
                const imgSrc = product.image_urls?.[0] || product.image_url;
                return (
                  <li key={cartKey} className="flex gap-3 pb-4 border-b border-[#e5e3de]">
                    <div className="relative w-20 h-20 shrink-0 overflow-hidden" style={{ background: "#fffdf9" }}>
                      {imgSrc && (
                        <Image src={imgSrc} alt={name} fill className="object-contain" sizes="80px" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold text-[#111] leading-tight line-clamp-2"
                        style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)", textTransform: isRTL ? "none" : "uppercase" }}
                      >
                        {name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[#f95c05] text-sm font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                          ${((DEFAULT_SIZES.find((s) => s.size === size.size)?.price ?? size.price) * quantity).toFixed(2)}
                        </p>
                        <span className="text-xs text-[#999] uppercase tracking-wide" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                          · {size.label}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(cartKey, quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-[#e5e3de] text-sm hover:border-[#f95c05] transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold min-w-[20px] text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartKey, quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-[#e5e3de] text-sm hover:border-[#f95c05] transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(cartKey)}
                          className="ml-auto text-[#999] hover:text-red-500 transition-colors"
                          aria-label="Remove"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#e5e3de] px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span
                className="text-sm uppercase tracking-widest font-bold"
                style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)", textTransform: isRTL ? "none" : "uppercase" }}
              >
                {t("total")}
              </span>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
              >
                ${total.toFixed(2)}
              </span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <button className="btn-primary w-full py-3 text-sm">
                {t("checkout")}
              </button>
            </Link>
            <button
              onClick={closeCart}
              className="text-center text-xs text-[#999] hover:text-[#111] transition-colors"
              style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
            >
              {t("continueShopping")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
