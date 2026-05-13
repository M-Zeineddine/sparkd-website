"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

const STEPS = [
  {
    en: { title: "Send Your Idea", desc: "DM us on Instagram or WhatsApp with your concept — a photo, a vibe, a name, anything." },
    ar: { title: "أرسل فكرتك", desc: "راسلنا على انستغرام أو واتساب بفكرتك — صورة، فايب، اسم، أي شي." },
  },
  {
    en: { title: "We Design It", desc: "Our team creates a custom wrap design based on your brief. We'll send you a preview before printing." },
    ar: { title: "نصمّم لك", desc: "فريقنا يصمم الملصق بناءً على فكرتك. بنبعتلك معاينة قبل الطباعة." },
  },
  {
    en: { title: "We Ship It", desc: "Once approved, your custom lighter is wrapped and delivered straight to your door." },
    ar: { title: "نوصّل لك", desc: "بعد الموافقة، ولاعتك تتحزم وتوصل عالباب." },
  },
];

export default function CustomPage() {
  const { isRTL } = useLang();

  const headingStyle = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
    textTransform: isRTL ? "none" as const : "uppercase" as const,
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
            {STEPS.map((step, i) => {
              const s = isRTL ? step.ar : step.en;
              return (
                <div key={i} className="flex flex-col gap-4 p-8" style={{ background: "#fffdf9", direction: isRTL ? "rtl" : "ltr" }}>
                  <span
                    className="text-4xl font-black"
                    style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="font-black text-lg"
                    style={{ ...headingStyle, color: "#111111" }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)", color: "#777" }}
                  >
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ background: "#fffdf9", borderTop: "4px solid #f95c05" }}>
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6 text-center">
          <div className="w-12 h-0.5" style={{ background: "#f95c05" }} />
          <h2
            className="text-4xl sm:text-5xl font-black leading-none"
            style={{ ...headingStyle, color: "#111111" }}
          >
            {isRTL ? "جاهز تطلب؟" : "Ready to Order?"}
          </h2>
          <p
            className="text-base leading-relaxed max-w-sm"
            style={{ fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)", color: "#777" }}
          >
            {isRTL
              ? "راسلنا مباشرة وبنرد عليك بأسرع وقت."
              : "Reach out directly and we'll get back to you as fast as possible."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              href="https://instagram.com/sparkd.lb"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-8 py-3.5 text-base"
            >
              {isRTL ? "راسلنا على انستغرام" : "DM on Instagram"}
            </a>
            <a
              href="https://wa.me/96XXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-8 py-3.5 text-base"
              style={{ borderColor: "#111111", color: "#111111" }}
            >
              {isRTL ? "واتساب" : "WhatsApp"}
            </a>
          </div>
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
