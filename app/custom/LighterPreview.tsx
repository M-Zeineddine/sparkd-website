"use client";

import { useRef, useEffect } from "react";
import { DEFAULT_LIGHTER } from "@/lib/constants";

interface Props {
  dataUrl: string;
  onClose: () => void;
  mode: "single" | "both";
}

const LIGHTER_W = 145;
// Height derived from the physical face aspect ratio (wrapHeight / faceWidth),
// not from arcSpanFrac, so the preview matches the real lighter proportions.
const LIGHTER_H = Math.round(LIGHTER_W * DEFAULT_LIGHTER.wrapHeight / DEFAULT_LIGHTER.faceWidth);

function warpFromCanvas(
  src: HTMLCanvasElement,
  canvas: HTMLCanvasElement,
  centerFrac: number,
  arcSpanFrac: number,
) {
  const iw = src.width;
  const ih = src.height;
  const centerX = iw * centerFrac;
  const arcSpan = iw * arcSpanFrac;
  const outW = LIGHTER_W;
  const outH = LIGHTER_H;

  canvas.width = outW;
  canvas.height = outH;

  const srcData = src.getContext("2d")!.getImageData(0, 0, iw, ih).data;
  const ctx = canvas.getContext("2d")!;
  const out = ctx.createImageData(outW, outH);
  const R = outW / 2;
  // VIEW controls visible arc (0.82 ≈ ±55° from centre)
  const VIEW = 0.82;
  const maxTheta = Math.asin(VIEW);

  for (let x = 0; x < outW; x++) {
    const t = ((x - R) / R) * VIEW;
    const theta = Math.asin(t);
    // Shading: 0.65 at edges → 1.0 at centre
    const brightness = Math.cos((theta / maxTheta) * (Math.PI / 2)) * 0.35 + 0.65;
    const srcX = centerX + (theta / maxTheta) * (arcSpan / 2);

    for (let y = 0; y < outH; y++) {
      const srcY = (y * ih) / outH;
      const x0 = Math.floor(srcX), y0 = Math.floor(srcY);
      const x1 = Math.min(x0 + 1, iw - 1), y1 = Math.min(y0 + 1, ih - 1);
      if (x0 < 0 || x0 >= iw) continue;
      const fx = srcX - x0, fy = srcY - y0;
      const di = (y * outW + x) * 4;
      for (let c = 0; c < 3; c++) {
        const v =
          srcData[(y0 * iw + x0) * 4 + c] * (1 - fx) * (1 - fy) +
          srcData[(y0 * iw + x1) * 4 + c] * fx * (1 - fy) +
          srcData[(y1 * iw + x0) * 4 + c] * (1 - fx) * fy +
          srcData[(y1 * iw + x1) * 4 + c] * fx * fy;
        out.data[di + c] = Math.min(255, v * brightness);
      }
      out.data[di + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
}

function warpToCanvas(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  centerFrac: number,
  arcSpanFrac: number,
) {
  const tmp = document.createElement("canvas");
  tmp.width = img.naturalWidth;
  tmp.height = img.naturalHeight;
  tmp.getContext("2d")!.drawImage(img, 0, 0);
  warpFromCanvas(tmp, canvas, centerFrac, arcSpanFrac);
}

// Constructs a canvas representing the back face by stitching the right overflow
// (canvas rightFold→end) and left overflow (canvas 0→leftFold) together.
// The back face center lands at 0.5 of this stitched canvas.
function stitchBack(img: HTMLImageElement, leftFoldFrac: number, rightFoldFrac: number): HTMLCanvasElement {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const leftPx = Math.round(iw * leftFoldFrac);
  const rightPx = Math.round(iw * rightFoldFrac);
  const rightW = iw - rightPx;
  const leftW = leftPx;

  const stitched = document.createElement("canvas");
  stitched.width = rightW + leftW;
  stitched.height = ih;
  const ctx = stitched.getContext("2d")!;
  ctx.drawImage(img, rightPx, 0, rightW, ih, 0, 0, rightW, ih);
  ctx.drawImage(img, 0, 0, leftW, ih, rightW, 0, leftW, ih);
  return stitched;
}

export default function LighterPreview({ dataUrl, onClose, mode }: Props) {
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!dataUrl) return;
    const img = new window.Image();
    img.onload = () => {
      const { wrapWidth, faceWidth } = DEFAULT_LIGHTER;
      const connectorW = (wrapWidth - 2 * faceWidth) / 2;
      const halfConn = connectorW / 2;
      const arcSpanFrac = (faceWidth + connectorW) / wrapWidth;

      if (mode === "single") {
        // Side A: center face panel at 50% of the full-wrap canvas
        if (canvasARef.current) warpToCanvas(img, canvasARef.current, 0.5, arcSpanFrac);

        // Side B: stitch right overflow + left overflow to expose the back face
        if (canvasBRef.current) {
          const leftFoldFrac = (wrapWidth - faceWidth) / (2 * wrapWidth);
          const rightFoldFrac = 1 - leftFoldFrac;
          const stitched = stitchBack(img, leftFoldFrac, rightFoldFrac);
          // arcSpanFrac relative to the stitched canvas width
          const stitchedArcSpanFrac = (faceWidth + connectorW) / (wrapWidth - faceWidth);
          warpFromCanvas(stitched, canvasBRef.current, 0.5, stitchedArcSpanFrac);
        }
      } else {
        const centerFracA = (halfConn + faceWidth / 2) / wrapWidth;
        const centerFracB = (halfConn + faceWidth + connectorW + faceWidth / 2) / wrapWidth;
        if (canvasARef.current) warpToCanvas(img, canvasARef.current, centerFracA, arcSpanFrac);
        if (canvasBRef.current) warpToCanvas(img, canvasBRef.current, centerFracB, arcSpanFrac);
      }
    };
    img.src = dataUrl;
  }, [dataUrl, mode]);

  const capStyle = (pos: "top" | "bottom"): React.CSSProperties => ({
    width: LIGHTER_W,
    height: pos === "top" ? 18 : 10,
    background: pos === "top"
      ? "linear-gradient(to bottom, #555, #3a3a3a)"
      : "linear-gradient(to bottom, #3a3a3a, #2a2a2a)",
    borderRadius: pos === "top" ? "10px 10px 0 0" : "0 0 8px 8px",
    ...(pos === "top" ? { borderBottom: "1px solid #222", position: "relative" as const } : {}),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-5 px-8 py-7 w-full sm:w-auto"
        style={{
          background: "#111",
          borderRadius: 20,
          boxShadow: "0 8px 60px rgba(0,0,0,0.7)",
          paddingBottom: "env(safe-area-inset-bottom, 28px)",
          margin: "0 12px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-xs font-black uppercase tracking-[0.25em]"
          style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
        >
          3D Preview
        </p>

        <div className="flex gap-14">
          {/* Side A */}
          <div className="flex flex-col items-center gap-2">
            <div style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.7))" }}>
              <div style={capStyle("top")}>
                <div style={{
                  position: "absolute", right: 16, top: 4,
                  width: 18, height: 10,
                  background: "repeating-linear-gradient(90deg,#666 0px,#666 2px,#444 2px,#444 4px)",
                  borderRadius: 3,
                }} />
              </div>
              <canvas ref={canvasARef} style={{ display: "block" }} />
              <div style={capStyle("bottom")} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
              Front
            </p>
          </div>

          {/* Side B / Back */}
          <div className="flex flex-col items-center gap-2">
            <div style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.7))" }}>
              <div style={capStyle("top")}>
                <div style={{
                  position: "absolute", right: 16, top: 4,
                  width: 18, height: 10,
                  background: "repeating-linear-gradient(90deg,#666 0px,#666 2px,#444 2px,#444 4px)",
                  borderRadius: 3,
                }} />
              </div>
              <canvas ref={canvasBRef} style={{ display: "block" }} />
              <div style={capStyle("bottom")} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-barlow-condensed)", color: "#555" }}>
              Back
            </p>
          </div>
        </div>

        <p className="text-[10px] text-center"
          style={{ fontFamily: "var(--font-barlow)", color: "#555", maxWidth: 300 }}>
          Cylindrical approximation — actual print may vary slightly.
        </p>

        <button onClick={onClose}
          className="text-xs font-bold uppercase tracking-widest px-8 py-2 rounded"
          style={{ fontFamily: "var(--font-barlow-condensed)", color: "#888", background: "#1a1a1a" }}>
          Close
        </button>
        <div style={{ height: 0 }} />
      </div>
    </div>
  );
}
