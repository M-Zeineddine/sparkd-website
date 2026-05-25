"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { DEFAULT_LIGHTER, DEFAULT_SIZES } from "@/lib/constants";
import { useCartStore } from "@/lib/store";
import type { DesignExport, DesignLayout } from "./DesignEditor";

const DesignEditor = dynamic(() => import("./DesignEditor"), { ssr: false });

const STEPS = [
  {
    en: { title: "Upload Your Design", desc: "Use the tool below to upload your image and position it on the lighter wrap template." },
    ar: { title: "حمّل تصميمك", desc: "استخدم الأداة أدناه لرفع صورتك وتحديد مكانها على قالب الملصق." },
  },
  {
    en: { title: "We Print It", desc: "Once we receive your order, we print and wrap your lighter with care." },
    ar: { title: "نطبعها", desc: "بمجرد استلام طلبك، نطبع الملصق ونلفّ الولاعة باحتراف." },
  },
  {
    en: { title: "We Ship It", desc: "Your custom lighter is delivered straight to your door across Lebanon." },
    ar: { title: "نوصّل لك", desc: "ولاعتك المخصصة توصل عالباب في كل لبنان." },
  },
];

type Step = "editor" | "review";

export default function CustomPage() {
  const { isRTL } = useLang();
  const { addCustomItem, removeCustomItem, customItems, editingCustomKey, setEditingCustomKey } = useCartStore();
  const [step, setStep] = useState<Step>("editor");
  const [designExport, setDesignExport] = useState<DesignExport | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [editingCartKey, setEditingCartKey] = useState<string | null>(null);
  const [initialLayout, setInitialLayout] = useState<DesignLayout | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  // Fires on mount (navigating here with editingCustomKey set) AND when already
  // on this page and the user clicks Edit again from the cart drawer.
  useEffect(() => {
    if (!editingCustomKey) return;
    const item = customItems.find(i => i.cartKey === editingCustomKey);
    setEditingCartKey(editingCustomKey);
    setInitialLayout(item ? (item.layout as unknown as DesignLayout) : null);
    setEditorKey(k => k + 1); // force DesignEditor to remount with new initialLayout
    setStep("editor");
    setEditingCustomKey(null);
  }, [editingCustomKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const spec = DEFAULT_LIGHTER;
  const unitPrice = DEFAULT_SIZES.find((s) => s.size === spec.size)?.price ?? 0;

  const headingStyle = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
    textTransform: isRTL ? ("none" as const) : ("uppercase" as const),
  };

  const handleDesignExport = (d: DesignExport) => {
    setDesignExport(d);
    setStep("review");
    setTimeout(() => {
      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAddToCart = () => {
    if (!designExport) return;
    if (editingCartKey) {
      removeCustomItem(editingCartKey);
      setEditingCartKey(null);
    }
    addCustomItem({
      specName: spec.name,
      specSize: spec.size,
      dataUrl: designExport.dataUrl,
      layout: designExport.layout as unknown as Record<string, unknown>,
      sourceFiles: designExport.sourceFiles,
      quantity,
    });
    setStep("editor");
    setDesignExport(null);
    setQuantity(1);
  };

  return (
    <div style={{ background: "#fffdf9" }}>

      {/* Hero */}
      <section
        className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden"
        style={{ background: "#111111" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 0, transparent 60px),
                              repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 60px)`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "#f95c05" }} />
        <div className="relative z-10 flex flex-col items-center gap-5 max-w-2xl">
          <span
            className="text-xs tracking-[0.2em] uppercase font-bold"
            style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
          >
            {isRTL ? "تصميم حصري" : "Custom Orders"}
          </span>
          <h1
            className="text-5xl sm:text-7xl font-black leading-none text-white"
            style={{ ...headingStyle, letterSpacing: isRTL ? "0" : "-0.01em" }}
          >
            {isRTL ? "تصميمك، ولاعتك" : "Your Design.\nYour Lighter."}
          </h1>
          <p
            className="text-white/50 text-base sm:text-lg max-w-md leading-relaxed"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
          >
            {isRTL
              ? "ما في حدود للإبداع. أي فكرة، أي تصميم، أي شخصية — بنحوّلها ولاعة."
              : "No limits. Any idea, any design, any character — we'll make it a lighter."}
          </p>
          <a
            href="#design-tool"
            className="btn-primary px-8 py-3.5 text-base mt-2"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("design-tool")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {isRTL ? "ابدأ التصميم" : "Start Designing"}
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-b border-[#e5e3de]">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-black mb-12 text-center"
            style={{ ...headingStyle, color: "#111111" }}
          >
            {isRTL ? "كيف يصير؟" : "How It Works"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: "#e5e3de" }}>
            {STEPS.map((s, i) => {
              const t = isRTL ? s.ar : s.en;
              return (
                <div key={i} className="flex flex-col gap-4 p-8" style={{ background: "#fffdf9", direction: isRTL ? "rtl" : "ltr" }}>
                  <span className="text-4xl font-black" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-black text-lg" style={{ ...headingStyle, color: "#111111" }}>{t.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)", color: "#777" }}>
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Design Tool */}
      <section id="design-tool" className="py-20 px-4 border-b border-[#e5e3de]">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-3 mb-12 text-center">
            <span
              className="text-xs tracking-[0.2em] uppercase font-bold"
              style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
            >
              {isRTL ? "الخطوة الأولى" : "Step 1"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ ...headingStyle, color: "#111111" }}>
              {isRTL ? "صمّم ملصقك" : "Design Your Wrap"}
            </h2>
          </div>

          {/* Keep editor mounted while reviewing so state is preserved */}
          <div style={{ display: step === "editor" ? undefined : "none" }}>
            <DesignEditor key={editorKey} onExport={handleDesignExport} initialLayout={initialLayout ?? undefined} />
          </div>

          {step === "review" && designExport && (
            <div id="order-form" className="flex flex-col items-center gap-6">
              <p className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                {isRTL ? "تصميمك" : "Your Design"}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={designExport.dataUrl} alt="Your custom design" className="rounded border border-[#e5e3de]" style={{ maxWidth: 400, width: "100%" }} />
              <button className="text-xs font-bold uppercase tracking-widest underline" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#777" }} onClick={() => setStep("editor")}>
                ← {isRTL ? "تعديل التصميم" : "Edit Design"}
              </button>

              <div className="w-full max-w-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
                    {isRTL ? "الكمية" : "Quantity"}
                  </label>
                  <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1.5px solid #e0ddd8", background: "#fff" }}>
                    <button className="px-3 py-1.5 font-bold hover:bg-[#f0eeea] transition-colors" style={{ color: "#555", fontSize: 16, lineHeight: 1 }} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <span className="w-10 text-center text-sm font-bold select-none" style={{ fontFamily: "var(--font-barlow)", color: "#333" }}>{quantity}</span>
                    <button className="px-3 py-1.5 font-bold hover:bg-[#f0eeea] transition-colors" style={{ color: "#555", fontSize: 16, lineHeight: 1 }} onClick={() => setQuantity(q => q + 1)}>+</button>
                  </div>
                </div>
                <div className="flex justify-between text-sm px-1" style={{ fontFamily: "var(--font-barlow)", color: "#555" }}>
                  <span>{spec.name} × {quantity}</span>
                  <span className="font-bold" style={{ color: "#111" }}>${(unitPrice * quantity).toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleAddToCart} className="btn-primary px-10 py-3 text-base">
                {isRTL ? "أضف إلى السلة" : "Add to Cart →"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Back to shop */}
      <section className="py-10 px-4 text-center border-t border-[#e5e3de]">
        <Link
          href="/shop"
          className="text-sm font-bold uppercase tracking-widest text-[#f95c05] hover:text-[#d94d03] transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          ← {isRTL ? "العودة للمتجر" : "Back to Shop"}
        </Link>
      </section>

    </div>
  );
}
