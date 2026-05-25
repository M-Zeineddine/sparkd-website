"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { DELIVERY_FEE } from "@/lib/constants";

const NAV = [
  { id: "delivery", en: "Delivery", ar: "التوصيل" },
  { id: "returns",  en: "Returns",  ar: "الإرجاع" },
  { id: "contact",  en: "Contact",  ar: "تواصل معنا" },
];

function Row({ label, body, fontBody, isRTL }: { label: string; body: string; fontBody: React.CSSProperties; isRTL: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4" style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <span className="text-xs font-black uppercase tracking-widest pt-0.5 sm:text-right" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
        {label}
      </span>
      <p className="sm:col-span-3 text-sm leading-relaxed" style={{ ...fontBody, color: "#444" }}>
        {body}
      </p>
    </div>
  );
}

export default function PoliciesPage() {
  const { isRTL } = useLang();

  const fontHeading = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
    textTransform: isRTL ? ("none" as const) : ("uppercase" as const),
  };
  const fontBody = { fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)" };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div style={{ background: "#fffdf9" }} className="min-h-screen">
      {/* Header */}
      <div className="py-10 px-4 border-b border-[#e5e3de]" style={{ background: "#111111" }}>
        <div className="max-w-3xl mx-auto">
          <span className="text-xs tracking-[0.2em] uppercase font-bold block mb-3" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
            {isRTL ? "المعلومات" : "Info"}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white" style={fontHeading}>
            {isRTL ? "التوصيل والسياسات" : "Delivery & Policies"}
          </h1>
        </div>
      </div>

      {/* Sticky section nav */}
      <div className="sticky top-0 z-40 border-b border-[#e5e3de]" style={{ background: "#fffdf9" }}>
        <div className="max-w-3xl mx-auto px-4 flex" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          {NAV.map(({ id, en, ar }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="px-5 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 border-transparent transition-colors hover:text-[#f95c05] hover:border-[#f95c05]"
              style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}
            >
              {isRTL ? ar : en}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-16">

        {/* ── Delivery ── */}
        <section id="delivery" style={{ scrollMarginTop: 56 }}>
          <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "2px solid #111" }}>
            <span className="text-2xl">🚚</span>
            <h2 className="text-2xl font-black" style={{ ...fontHeading, color: "#111" }}>
              {isRTL ? "التوصيل" : "Delivery"}
            </h2>
          </div>
          <div className="flex flex-col gap-5">
            {([
              { label: isRTL ? "التغطية" : "Coverage", body: isRTL ? "نوصّل لجميع المدن والمناطق في لبنان." : "We deliver to all cities and towns across Lebanon." },
              { label: isRTL ? "المدة" : "Timeframe", body: isRTL ? "يُسلَّم الطلب خلال ١–٥ أيام عمل بعد التأكيد." : "Orders are delivered within 1–5 business days after confirmation." },
              { label: isRTL ? "الرسوم" : "Fee", body: isRTL ? `رسوم التوصيل ثابتة بقيمة $${DELIVERY_FEE.toFixed(2)} على كل طلب، بغض النظر عن الكمية.` : `A flat $${DELIVERY_FEE.toFixed(2)} delivery fee applies to every order, regardless of size or quantity.` },
            ] as { label: string; body: string }[]).map(r => <Row key={r.label} {...r} fontBody={fontBody} isRTL={isRTL} />)}
          </div>

          <div className="mt-10">
            <h3 className="text-base font-black mb-5 flex items-center gap-2" style={{ ...fontHeading, color: "#111" }}>
              <span>💵</span> {isRTL ? "الدفع" : "Payment"}
            </h3>
            <div className="flex flex-col gap-5">
              {([
                { label: isRTL ? "طريقة الدفع" : "Method", body: isRTL ? "الدفع عند الاستلام فقط. لا حاجة لدفع مسبق أو تحويل بنكي." : "Cash on delivery (COD) only. No online payments or bank transfers required." },
                { label: isRTL ? "موعد الدفع" : "When to pay", body: isRTL ? "بتدفع لما يوصلك الطلب — مش قبل." : "You pay when your order arrives at your door — not before." },
              ] as { label: string; body: string }[]).map(r => <Row key={r.label} {...r} fontBody={fontBody} isRTL={isRTL} />)}
            </div>
          </div>
        </section>

        <div style={{ borderTop: "1px solid #e5e3de" }} />

        {/* ── Returns ── */}
        <section id="returns" style={{ scrollMarginTop: 56 }}>
          <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "2px solid #111" }}>
            <span className="text-2xl">🔄</span>
            <h2 className="text-2xl font-black" style={{ ...fontHeading, color: "#111" }}>
              {isRTL ? "الإرجاع والاسترداد" : "Returns & Refunds"}
            </h2>
          </div>
          <div className="flex flex-col gap-5">
            {([
              { label: isRTL ? "المنتجات التالفة" : "Damaged items", body: isRTL ? "إذا وصل طلبك تالفًا أو فيه خلل، تواصل معنا خلال ٤٨ ساعة من الاستلام مع صورة. بنعوّضك باستبدال أو استرداد كامل — حسب اختيارك." : "If your order arrives damaged or with a defect, contact us within 48 hours of receiving it with a photo. We'll send a replacement or issue a full refund — your choice." },
              { label: isRTL ? "المنتجات السليمة" : "Non-returnable", body: isRTL ? "المنتجات السليمة غير قابلة للإرجاع، إذ تُصنَّع الولاعات بناءً على الطلب." : "Items received in good condition are non-returnable, as all lighters are made to order." },
              { label: isRTL ? "منتج خاطئ" : "Wrong item", body: isRTL ? "إذا استلمت منتجًا مختلفًا، تواصل معنا وبنصحح الموضوع بدون أي تكلفة إضافية." : "If you received the wrong product, contact us and we'll make it right at no extra cost." },
            ] as { label: string; body: string }[]).map(r => <Row key={r.label} {...r} fontBody={fontBody} isRTL={isRTL} />)}
          </div>

          <div className="mt-10">
            <h3 className="text-base font-black mb-5 flex items-center gap-2" style={{ ...fontHeading, color: "#111" }}>
              <span>🎨</span> {isRTL ? "الطلبات المخصصة" : "Custom Orders"}
            </h3>
            <div className="flex flex-col gap-5">
              {([
                { label: isRTL ? "وقت المعالجة" : "Processing time", body: isRTL ? "الولاعات المطبوعة تحتاج وقتًا إضافيًا للطباعة ومراجعة الجودة قبل الشحن." : "Custom printed lighters require additional time for printing and quality check before shipping." },
                { label: isRTL ? "عيوب الطباعة" : "Print defects", body: isRTL ? "إذا كان هناك خلل في الطباعة أو التغليف من طرفنا، بنعوّضك باستبدال أو استرداد كامل." : "If there is a defect in the print or wrap caused on our end, we will replace it or issue a full refund." },
                { label: isRTL ? "مسؤولية التصميم" : "Design errors", body: isRTL ? "بنطبع بالضبط ما ترفعه. الأخطاء في التصميم المُحمَّل من قِبل العميل (ألوان خاطئة، دقة منخفضة، أخطاء إملائية) لا تُعوَّض." : "We print exactly what you upload. Errors in customer-submitted artwork (wrong colors, low resolution, typos) are not covered. Please review your design carefully before ordering." },
              ] as { label: string; body: string }[]).map(r => <Row key={r.label} {...r} fontBody={fontBody} isRTL={isRTL} />)}
            </div>
          </div>
        </section>

        <div style={{ borderTop: "1px solid #e5e3de" }} />

        {/* ── Contact ── */}
        <section id="contact" style={{ scrollMarginTop: 56 }}>
          <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "2px solid #111" }}>
            <span className="text-2xl">📞</span>
            <h2 className="text-2xl font-black" style={{ ...fontHeading, color: "#111" }}>
              {isRTL ? "تواصل معنا" : "Contact Us"}
            </h2>
          </div>
          <div className="flex flex-col gap-5">
            {([
              { label: isRTL ? "مشكلة في طلبك" : "Order issues", body: isRTL ? "تواصل معنا عبر إنستغرام أو واتساب للحصول على أسرع رد. أرسل رقم طلبك وصورة في حال الإبلاغ عن ضرر." : "Reach out via Instagram DM or WhatsApp for the fastest response. Include your order number and a photo if reporting damage." },
              { label: isRTL ? "أسئلة عامة" : "General questions", body: isRTL ? "لأي استفسار آخر، راسلنا على إنستغرام أو تواصل معنا عبر الموقع." : "For anything else, send us a DM on Instagram or reach out through the website." },
            ] as { label: string; body: string }[]).map(r => <Row key={r.label} {...r} fontBody={fontBody} isRTL={isRTL} />)}
          </div>
        </section>

        {/* Footer links */}
        <div className="border-t border-[#e5e3de] pt-8 flex flex-wrap gap-4">
          <Link href="/checkout" className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
            ← {isRTL ? "العودة للطلب" : "Back to Checkout"}
          </Link>
          <Link href="/shop" className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#999" }}>
            {isRTL ? "تصفح المتجر" : "Browse Shop"} →
          </Link>
        </div>
      </div>
    </div>
  );
}
