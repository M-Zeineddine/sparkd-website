"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { LEBANESE_CITIES } from "@/lib/constants";
import type { DesignExport } from "./DesignEditor";

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

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  phone: "",
  city: "",
  quantity: "1",
  notes: "",
};

type Step = "editor" | "form" | "done";

export default function CustomPage() {
  const { isRTL } = useLang();
  const [step, setStep] = useState<Step>("editor");
  const [designExport, setDesignExport] = useState<DesignExport | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const headingStyle = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
    textTransform: isRTL ? ("none" as const) : ("uppercase" as const),
  };

  const handleDesignExport = (d: DesignExport) => {
    setDesignExport(d);
    setStep("form");
    setTimeout(() => {
      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designExport) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(designExport.dataUrl);
    const blob = await res.blob();
    const file = new File([blob], "design.png", { type: "image/png" });

    const fd = new FormData();
    fd.append("design", file);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const result = await fetch("/api/custom-order", { method: "POST", body: fd });
    if (result.ok) {
      setStep("done");
    } else {
      const data = await result.json();
      setError(data.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
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

          {step === "done" ? (
            <div className="flex flex-col items-center gap-6 py-12 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ background: "#f95c05" }}
              >
                ✓
              </div>
              <h3 className="text-2xl font-black" style={{ ...headingStyle, color: "#111" }}>
                {isRTL ? "تم استلام طلبك!" : "Order Received!"}
              </h3>
              <p className="text-base max-w-sm" style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)", color: "#777" }}>
                {isRTL
                  ? "راح نتواصل معك خلال 24 ساعة لتأكيد الطلب والسعر."
                  : "We'll reach out within 24 hours to confirm your order and pricing."}
              </p>
              <button
                className="btn-outline px-6 py-2.5 text-sm"
                style={{ borderColor: "#111", color: "#111" }}
                onClick={() => { setStep("editor"); setForm(EMPTY_FORM); setDesignExport(null); }}
              >
                {isRTL ? "طلب آخر" : "Place Another Order"}
              </button>
            </div>
          ) : step === "editor" ? (
            <DesignEditor onExport={handleDesignExport} />
          ) : (
            /* Form step */
            <div id="order-form" className="flex flex-col gap-8">
              {/* Design preview */}
              {designExport && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                    {isRTL ? "تصميمك" : "Your Design"}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={designExport.dataUrl}
                    alt="Your custom design"
                    className="rounded border border-[#e5e3de]"
                    style={{ maxWidth: 400, width: "100%" }}
                  />
                  <button
                    className="text-xs font-bold uppercase tracking-widest underline"
                    style={{ fontFamily: "var(--font-barlow-condensed)", color: "#777" }}
                    onClick={() => setStep("editor")}
                  >
                    ← {isRTL ? "تعديل التصميم" : "Edit Design"}
                  </button>
                </div>
              )}

              {/* Contact form */}
              <div className="flex flex-col gap-3 mb-4 text-center">
                <span className="text-xs tracking-[0.2em] uppercase font-bold" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                  {isRTL ? "الخطوة الثانية" : "Step 2"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black" style={{ ...headingStyle, color: "#111" }}>
                  {isRTL ? "بياناتك" : "Your Details"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ direction: isRTL ? "rtl" : "ltr" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
                      {isRTL ? "الاسم الأول *" : "First Name *"}
                    </label>
                    <input
                      className="border border-[#e5e3de] px-4 py-3 text-sm outline-none focus:border-[#f95c05] transition-colors"
                      style={{ background: "#fffdf9", fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                      value={form.first_name}
                      onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
                      {isRTL ? "اسم العائلة" : "Last Name"}
                    </label>
                    <input
                      className="border border-[#e5e3de] px-4 py-3 text-sm outline-none focus:border-[#f95c05] transition-colors"
                      style={{ background: "#fffdf9", fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                      value={form.last_name}
                      onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
                      {isRTL ? "رقم الهاتف *" : "Phone *"}
                    </label>
                    <input
                      type="tel"
                      className="border border-[#e5e3de] px-4 py-3 text-sm outline-none focus:border-[#f95c05] transition-colors"
                      style={{ background: "#fffdf9", fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                      placeholder="+961 XX XXX XXX"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
                      {isRTL ? "المدينة *" : "City *"}
                    </label>
                    <select
                      className="border border-[#e5e3de] px-4 py-3 text-sm outline-none focus:border-[#f95c05] transition-colors"
                      style={{ background: "#fffdf9", fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      required
                    >
                      <option value="">{isRTL ? "اختر مدينة" : "Select city"}</option>
                      {LEBANESE_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
                    {isRTL ? "الكمية *" : "Quantity *"}
                  </label>
                  <select
                    className="border border-[#e5e3de] px-4 py-3 text-sm outline-none focus:border-[#f95c05] transition-colors"
                    style={{ background: "#fffdf9", fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  >
                    {[1, 2, 3, 5, 10, 15, 20].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
                    {isRTL ? "ملاحظات" : "Notes"}
                  </label>
                  <textarea
                    rows={3}
                    className="border border-[#e5e3de] px-4 py-3 text-sm outline-none focus:border-[#f95c05] transition-colors resize-none"
                    style={{ background: "#fffdf9", fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}
                    placeholder={isRTL ? "أي تفاصيل إضافية..." : "Any extra details..."}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600" style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-4 text-base disabled:opacity-60"
                >
                  {submitting
                    ? (isRTL ? "جارٍ الإرسال..." : "Submitting...")
                    : (isRTL ? "إرسال الطلب" : "Submit Order")}
                </button>
              </form>
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
