"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const VariantA = dynamic(() => import("../VariantA"), { ssr: false });
const VariantB = dynamic(() => import("../VariantB"), { ssr: false });
const VariantC = dynamic(() => import("../VariantC"), { ssr: false });

const OPTIONS = [
  {
    id: "A",
    label: "Option A — Two Upload Slots",
    desc: "Side A and Side B each have their own upload. Good for single-sided designs (upload one, leave the other empty) or when you want completely different images on each face.",
    pros: ["Clean separation between sides", "Works perfectly for single-sided designs", "Supports fully different designs per side"],
    cons: ["Two upload steps when designing both sides"],
    Component: VariantA,
  },
  {
    id: "B",
    label: "Option B — One / Both Sides Toggle",
    desc: 'A mode switch above the canvas. "One Side" shows a single panel — perfect for the Lebanese plate. "Both Sides" expands to the full layout for wrap-around designs like Gon.',
    pros: ["Simplest experience for single-sided designs", "Clean full-wrap view when needed", "One upload either way"],
    cons: ["Less obvious that both sides exist by default", "Image repositions when switching modes"],
    Component: VariantB,
  },
  {
    id: "C",
    label: "Option C — Copy to Side B",
    desc: "Upload once, position on Side A. A button copies that image to Side B at the same relative position. After copying, each side can be adjusted independently.",
    pros: ["Simple upload flow", "Great for symmetric designs (same image both sides)", "Side B is always optional"],
    cons: ["Not obvious how to get different images on each side", "Extra step to copy"],
    Component: VariantC,
  },
];

export default function ComparePage() {
  const headingStyle = { fontFamily: "var(--font-barlow-condensed)", textTransform: "uppercase" as const };

  return (
    <div style={{ background: "#fffdf9", minHeight: "100vh" }}>
      {/* Header */}
      <div className="border-b border-[#e5e3de] px-6 py-8" style={{ background: "#111" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] font-bold mb-2" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
            UX Comparison
          </p>
          <h1 className="text-4xl font-black text-white mb-3" style={headingStyle}>
            Design Upload Options
          </h1>
          <p className="text-white/50 text-sm" style={{ fontFamily: "var(--font-barlow)" }}>
            Try all three approaches with your own images. Each handles the single-sided vs two-sided problem differently.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col gap-20">
        {OPTIONS.map((opt) => (
          <section key={opt.id} className="flex flex-col gap-6">
            {/* Section header */}
            <div className="flex flex-col gap-2">
              <span className="text-4xl font-black" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                {opt.id}
              </span>
              <h2 className="text-2xl font-black" style={{ ...headingStyle, color: "#111" }}>
                {opt.label.split("—")[1].trim()}
              </h2>
              <p className="text-sm leading-relaxed max-w-xl" style={{ fontFamily: "var(--font-barlow)", color: "#666" }}>
                {opt.desc}
              </p>
              <div className="flex gap-6 mt-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#22c55e" }}>Pros</p>
                  <ul className="flex flex-col gap-0.5">
                    {opt.pros.map((p) => (
                      <li key={p} className="text-xs" style={{ fontFamily: "var(--font-barlow)", color: "#555" }}>+ {p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#ef4444" }}>Cons</p>
                  <ul className="flex flex-col gap-0.5">
                    {opt.cons.map((c) => (
                      <li key={c} className="text-xs" style={{ fontFamily: "var(--font-barlow)", color: "#555" }}>− {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="p-6 border border-[#e5e3de]" style={{ background: "#fffdf9" }}>
              <opt.Component />
            </div>

            <hr style={{ borderColor: "#e5e3de" }} />
          </section>
        ))}

        <div className="text-center">
          <Link href="/custom" className="text-sm font-bold uppercase tracking-widest text-[#f95c05] hover:text-[#d94d03] transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            ← Back to Custom Page
          </Link>
        </div>
      </div>
    </div>
  );
}
