"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useCartStore } from "@/lib/store";

export default function CartPage() {
  const { t, isRTL } = useLang();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const total = totalPrice();

  const fontHeading = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
    textTransform: isRTL ? "none" as const : "uppercase" as const,
    letterSpacing: isRTL ? "0" : "0.04em",
  };
  const fontBody = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)",
  };

  return (
    <div style={{ background: "#fffdf9" }} className="min-h-screen">
      {/* Header */}
      <div className="py-10 px-4 border-b border-[#e5e3de]" style={{ background: "#111111" }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-white" style={fontHeading}>
            {t("yourCart")}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <span className="text-8xl">🛒</span>
            <div>
              <h2 className="text-2xl font-black mb-2" style={{ ...fontHeading, color: "#111111" }}>
                {t("emptyCart")}
              </h2>
              <p className="text-[#666]" style={fontBody}>{t("emptyCartSub")}</p>
            </div>
            <Link href="/shop">
              <button className="btn-primary px-10 py-3">{t("continueShopping")}</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map(({ product, quantity }) => {
                const name = product.name;
                return (
                  <div
                    key={product.id}
                    className="flex gap-4 p-4 border border-[#e5e3de] hover:border-[#f95c05] transition-colors"
                  >
                    <Link href={`/shop/${product.id}`} className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-[#f0ede8] overflow-hidden">
                      <Image
                        src={product.image_url}
                        alt={name}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                        sizes="112px"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col gap-2">
                      <Link href={`/shop/${product.id}`}>
                        <h3
                          className="font-black text-sm sm:text-base text-[#111] hover:text-[#f95c05] transition-colors"
                          style={fontHeading}
                        >
                          {name}
                        </h3>
                      </Link>
                      <p
                        className="text-[#f95c05] font-bold"
                        style={{ fontFamily: "var(--font-barlow-condensed)", letterSpacing: "0.04em" }}
                      >
                        ${(product.price * quantity).toFixed(2)}
                        <span className="text-[#999] font-normal text-xs ml-1">
                          (${product.price.toFixed(2)} ea.)
                        </span>
                      </p>

                      <div className="flex items-center gap-3 mt-auto">
                        <div className="flex items-center border border-[#e5e3de]">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#f0ede8] transition-colors"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#f0ede8] transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-xs text-[#999] hover:text-red-500 transition-colors flex items-center gap-1"
                          style={fontBody}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={clearCart}
                className="self-start text-xs text-[#999] hover:text-red-500 transition-colors mt-2"
                style={fontBody}
              >
                {isRTL ? "إفراغ السلة" : "Clear cart"}
              </button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="border border-[#e5e3de] p-6 sticky top-20">
                <h2
                  className="text-xl font-black mb-6 pb-4 border-b border-[#e5e3de]"
                  style={{ ...fontHeading, color: "#111111" }}
                >
                  {t("orderSummary")}
                </h2>

                <div className="flex flex-col gap-3 mb-6">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm" style={fontBody}>
                      <span className="text-[#666] truncate mr-2">
                        {product.name} × {quantity}
                      </span>
                      <span className="font-semibold shrink-0">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#e5e3de] pt-4 flex justify-between items-center mb-6">
                  <span className="font-black text-lg" style={fontHeading}>{t("total")}</span>
                  <span
                    className="text-2xl font-black"
                    style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* COD badge */}
                <div
                  className="flex items-center gap-2 text-xs text-[#666] mb-5 p-3 bg-[#f0ede8]"
                  style={fontBody}
                >
                  <span>💵</span>
                  <span>{t("cod")} — {t("codNote")}</span>
                </div>

                <Link href="/checkout">
                  <button className="btn-primary w-full py-4 text-base">
                    {t("checkout")}
                  </button>
                </Link>

                <Link href="/shop" className="block text-center mt-3">
                  <span
                    className="text-xs text-[#999] hover:text-[#111] transition-colors"
                    style={fontBody}
                  >
                    {t("continueShopping")}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
