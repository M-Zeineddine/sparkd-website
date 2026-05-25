"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";

interface Props {
  value: string | null;
  onChange: (color: string | null) => void;
  label?: string;
  onEyeDrop?: () => Promise<string | null>;
}

const SWATCHES = ["#ffffff", "#000000", "#f95c05", "#1a1a1a", "#e8e0d4", "#2d4a3e", "#c8a96e", "#8b1a1a"];

const checkerStyle: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(45deg, #d0d0d0 25%, transparent 25%),
    linear-gradient(-45deg, #d0d0d0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d0d0d0 75%),
    linear-gradient(-45deg, transparent 75%, #d0d0d0 75%)
  `,
  backgroundSize: "6px 6px",
  backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px",
  backgroundColor: "#f5f5f5",
};

export default function ColorPicker({ value, onChange, label = "Background", onEyeDrop }: Props) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setAlignRight(rect.left + 224 > window.innerWidth - 16);
    }
    const handler = (e: MouseEvent) => {
      if (picking) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, picking]);

  const handleEyeDrop = useCallback(async () => {
    if (!onEyeDrop) return;
    setPicking(true);
    try {
      const color = await onEyeDrop();
      if (color !== null) onChange(color);
    } finally {
      setPicking(false);
    }
  }, [onEyeDrop, onChange]);

  const displayColor = value ?? "#ffffff";

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest"
        style={{ fontFamily: "var(--font-barlow-condensed)", color: "#aaa" }}>
        {label}
      </span>

      {/* Trigger pill */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all w-full"
        style={{
          background: "#f7f5f1",
          border: open ? "1.5px solid #f95c05" : "1.5px solid #e0ddd8",
          minWidth: 80,
          boxShadow: open ? "0 0 0 3px rgba(249,92,5,0.1)" : "none",
        }}
      >
        <div className="flex-shrink-0 rounded" style={{
          width: 16, height: 16,
          ...(value ? { background: value, border: "1px solid rgba(0,0,0,0.1)" } : checkerStyle),
          borderRadius: 3,
        }} />
        <span className="flex-1 text-left text-xs uppercase"
          style={{ fontFamily: "monospace", color: value ? "#333" : "#bbb", letterSpacing: "0.04em" }}>
          {value ?? "None"}
        </span>
        {value ? (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="text-[#ccc] hover:text-[#999] transition-colors flex-shrink-0 leading-none"
            style={{ fontSize: 16, lineHeight: 1 }}
          >
            ×
          </span>
        ) : (
          <svg width="10" height="6" fill="none" viewBox="0 0 10 6" className="flex-shrink-0">
            <path d="M1 1l4 4 4-4" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Popover — opens upward */}
      {open && (
        <div className="absolute z-50 flex flex-col gap-3 p-3"
          style={{
            background: "#1c1c1e",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)",
            width: 224,
            bottom: "calc(100% + 8px)",
            ...(alignRight ? { right: 0 } : { left: 0 }),
          }}
        >
          <div style={{ borderRadius: 8, overflow: "hidden" }}>
            <HexColorPicker color={displayColor} onChange={onChange} style={{ width: "100%", height: 160 }} />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 flex-1 px-2.5 py-1.5 rounded-md" style={{ background: "#2c2c2e" }}>
              <span className="text-xs select-none" style={{ color: "#555", fontFamily: "monospace" }}>#</span>
              <HexColorInput
                color={displayColor}
                onChange={onChange}
                prefixed={false}
                className="flex-1 bg-transparent text-xs outline-none uppercase w-full"
                style={{ color: "#e5e5e7", fontFamily: "monospace", letterSpacing: "0.08em", caretColor: "#f95c05" }}
              />
            </div>

            {onEyeDrop && (
              <button
                onClick={handleEyeDrop}
                disabled={picking}
                className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
                style={{ background: picking ? "#f95c05" : "#2c2c2e", color: picking ? "#fff" : "#888" }}
                title="Pick color from canvas"
                onMouseEnter={(e) => { if (!picking) e.currentTarget.style.color = "#e5e5e7"; }}
                onMouseLeave={(e) => { if (!picking) e.currentTarget.style.color = "#888"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22l1-1h3l9-9" /><path d="M3 21v-3l9-9" />
                  <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8Z" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {SWATCHES.map((c) => (
              <button key={c} onClick={() => onChange(c)}
                className="w-6 h-6 rounded transition-all"
                style={{
                  background: c,
                  border: value === c ? "2px solid #f95c05" : "2px solid rgba(255,255,255,0.1)",
                  boxShadow: value === c ? "0 0 0 1px #f95c05" : "none",
                }} title={c} />
            ))}
            <button onClick={() => onChange(null)}
              className="w-6 h-6 rounded transition-all flex items-center justify-center"
              style={{
                ...checkerStyle,
                border: !value ? "2px solid #f95c05" : "2px solid rgba(255,255,255,0.1)",
                boxShadow: !value ? "0 0 0 1px #f95c05" : "none",
                borderRadius: 4,
              }} title="No color">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <line x1="1" y1="1" x2="9" y2="9" stroke="#e55" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
