"use client";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
  textColor?: string;
}

const sizes = {
  sm: { text: "1.6rem", flame: { w: 11, h: 20 } },
  md: { text: "2.2rem", flame: { w: 14, h: 26 } },
  lg: { text: "3.2rem", flame: { w: 20, h: 36 } },
};

export default function SparkdLogo({ className = "", size = "md", textColor = "white" }: Props) {
  const { text, flame } = sizes[size];

  const letterStyle: React.CSSProperties = {
    fontFamily: "var(--font-barlow-condensed)",
    fontWeight: 900,
    fontSize: text,
    textTransform: "uppercase",
    letterSpacing: "-0.02em",
    color: textColor,
    lineHeight: 1,
    display: "inline",
  };

  return (
    <span className={`inline-flex items-center gap-0 ${className}`} style={{ lineHeight: 1, direction: "ltr" }}>
      <span style={letterStyle}>SPARK</span>
      {/* Flame as the apostrophe */}
      <svg
        width={flame.w}
        height={flame.h}
        viewBox="0 0 20 36"
        fill="none"
        style={{ flexShrink: 0, margin: "0 1px", marginTop: `-${flame.h * 0.55}px` }}
      >
        <path
          d="M10 2C8 7 5 10 4 14c-1 4 0 8 3 10.5A6 6 0 0010 26a6 6 0 003-1.5C16 22 17 18 16 14c-1-4-4-7-6-12z"
          fill="#f95c05"
        />
        <path
          d="M10 14c-1 2-1.5 4-1 6a3 3 0 002 2 3 3 0 002-2c.5-2 0-4-1-6a8 8 0 01-1-2 8 8 0 01-1 2z"
          fill="#FFD166"
          opacity="0.6"
        />
      </svg>
      <span style={letterStyle}>D</span>
    </span>
  );
}
