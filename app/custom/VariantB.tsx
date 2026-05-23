"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Line, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { DEFAULT_LIGHTER, type LighterSpec } from "@/lib/constants";
import ColorPicker from "./ColorPicker";

const PX = 72;
function layout(spec: LighterSpec) {
  const conn = (spec.wrapWidth - 2 * spec.faceWidth) / 2;
  const hc = Math.round((conn / 2) * PX);
  const fc = Math.round(conn * PX);
  const fw = Math.round(spec.faceWidth * PX);
  const cw = Math.round(spec.wrapWidth * PX);
  const ch = Math.round(spec.wrapHeight * PX);
  return { cw, ch, hc, fc, fw, ax: hc, bx: hc + fw + fc, ex: hc + fw, rx: hc + fw + fc + fw };
}
const L = layout(DEFAULT_LIGHTER);

type Mode = "single" | "both";
type Pos = { x: number; y: number; w: number; h: number };

const centerX = Math.round((L.cw - L.fw) / 2);

function sampleCanvas(canvas: HTMLCanvasElement, x: number, y: number): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#ffffff";
  const d = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
  return "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export default function VariantB() {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const imgRef = useRef<Konva.Image>(null);

  const [mode, setMode] = useState<Mode>("single");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [pos, setPos] = useState<Pos>({ x: centerX + 8, y: 8, w: L.fw - 16, h: L.ch - 16 });
  const [selected, setSelected] = useState(false);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const prevMode = useRef<Mode>("single");

  // Eyedropper state
  const pickResolveRef = useRef<((color: string | null) => void) | null>(null);
  const pickCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [pickPreview, setPickPreview] = useState<{ x: number; y: number; color: string } | null>(null);

  useEffect(() => {
    if (prevMode.current === mode) return;
    const fromOrigin = prevMode.current === "single" ? centerX : L.ax;
    const toOrigin   = mode              === "single" ? centerX : L.ax;
    setPos(p => ({ ...p, x: p.x + (toOrigin - fromOrigin) }));
    prevMode.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!trRef.current) return;
    trRef.current.nodes(selected && imgRef.current ? [imgRef.current] : []);
    trRef.current.getLayer()?.batchDraw();
  }, [selected, img]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const el = new window.Image();
    el.onload = () => {
      const origin = mode === "single" ? centerX : L.ax;
      const scale = Math.min((L.fw - 16) / el.width, (L.ch - 16) / el.height);
      const w = el.width * scale;
      const h = el.height * scale;
      setPos({ x: origin + (L.fw - w) / 2, y: (L.ch - h) / 2, w, h });
      setImg(el);
      setSelected(true);
    };
    el.src = url;
    e.target.value = "";
  }, [mode]);

  const pickFromCanvas = useCallback((): Promise<string | null> => {
    if (!stageRef.current) return Promise.resolve(null);
    pickCanvasRef.current = stageRef.current.toCanvas();
    return new Promise((resolve) => {
      pickResolveRef.current = resolve;
      setPickMode(true);
      setPickPreview(null);
    });
  }, []);

  const handlePickCommit = useCallback(() => {
    const stage = stageRef.current;
    const canvas = pickCanvasRef.current;
    if (!stage || !canvas || !pickResolveRef.current) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const color = sampleCanvas(canvas, pos.x, pos.y);
    pickResolveRef.current(color);
    pickResolveRef.current = null;
    pickCanvasRef.current = null;
    setPickMode(false);
    setPickPreview(null);
  }, []);

  const handlePickMove = useCallback(() => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos || !pickCanvasRef.current) return;
    const color = sampleCanvas(pickCanvasRef.current, pos.x, pos.y);
    setPickPreview({ x: pos.x, y: pos.y, color });
  }, []);

  const singleFolds = [centerX, centerX + L.fw];
  const bothFolds   = [L.ax, L.ex, L.bx, L.rx];
  const activeFolds = mode === "single" ? singleFolds : bothFolds;

  // Tooltip position: flip if near right/bottom edge
  const ttX = pickPreview ? (pickPreview.x + 90 > L.cw ? pickPreview.x - 94 : pickPreview.x + 14) : 0;
  const ttY = pickPreview ? (pickPreview.y + 28 > L.ch ? pickPreview.y - 32 : pickPreview.y + 14) : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1" style={{ background: "#f0eeea", borderRadius: 6 }}>
        {(["single", "both"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className="px-5 py-2 text-xs font-black uppercase tracking-widest transition-all"
            style={{
              fontFamily: "var(--font-barlow-condensed)",
              background: mode === m ? "#111" : "transparent",
              color: mode === m ? "#fff" : "#888",
              borderRadius: 4,
            }}
          >
            {m === "single" ? "One Sided" : "Double Sided"}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto", maxWidth: "100%", border: "1px solid #e5e3de", borderRadius: 8 }}>
        <Stage ref={stageRef} width={L.cw} height={L.ch}
          onMouseDown={(e) => {
            if (pickMode) return;
            if (e.target === e.target.getStage()) setSelected(false);
          }}
          style={{ display: "block", cursor: pickMode ? "crosshair" : undefined }}
        >
          <Layer>
            <Rect x={0} y={0} width={L.cw} height={L.ch} fill="#fff" />

            {bgColor && <Rect x={0} y={0} width={L.cw} height={L.ch} fill={bgColor} />}

            {mode === "both" && <>
              <Rect x={0} y={0} width={L.hc} height={L.ch} fill="rgba(0,0,0,0.05)" />
              <Rect x={L.ex} y={0} width={L.fc} height={L.ch} fill="rgba(0,0,0,0.05)" />
              <Rect x={L.rx} y={0} width={L.hc} height={L.ch} fill="rgba(0,0,0,0.05)" />
            </>}

            {!img && <>
              {mode === "single"
                ? <Rect x={centerX + 8} y={8} width={L.fw - 16} height={L.ch - 16} stroke="#e0ddd8" strokeWidth={1} dash={[5, 4]} fill="transparent" />
                : <>
                    <Rect x={L.ax + 8} y={8} width={L.fw - 16} height={L.ch - 16} stroke="#e0ddd8" strokeWidth={1} dash={[5, 4]} fill="transparent" />
                    <Text x={L.ax} y={L.ch / 2 - 8} width={L.fw} text="SIDE A" fontSize={10} fill="#ccc" align="center" fontStyle="bold" letterSpacing={3} />
                    <Rect x={L.bx + 8} y={8} width={L.fw - 16} height={L.ch - 16} stroke="#e0ddd8" strokeWidth={1} dash={[5, 4]} fill="transparent" />
                    <Text x={L.bx} y={L.ch / 2 - 8} width={L.fw} text="SIDE B" fontSize={10} fill="#ccc" align="center" fontStyle="bold" letterSpacing={3} />
                  </>
              }
            </>}

            {img && <KonvaImage ref={imgRef} image={img}
              x={pos.x} y={pos.y} width={pos.w} height={pos.h}
              draggable={!pickMode}
              onClick={() => { if (!pickMode) setSelected(true); }}
              onTap={() => { if (!pickMode) setSelected(true); }}
              onDragEnd={(e) => setPos(p => ({ ...p, x: e.target.x(), y: e.target.y() }))}
              onTransformEnd={(e) => {
                const n = e.target as Konva.Image;
                setPos({ x: n.x(), y: n.y(), w: n.width() * n.scaleX(), h: n.height() * n.scaleY() });
                n.scaleX(1); n.scaleY(1);
              }} />}

            <Transformer ref={trRef} keepRatio={false} rotateEnabled={false}
              boundBoxFunc={(o, n) => (n.width < 20 || n.height < 20 ? o : n)} />

            {activeFolds.map((x) => (
              <Line key={x} points={[x, 0, x, L.ch]} stroke="#f95c05" strokeWidth={1.5} dash={[8, 5]} />
            ))}
            {activeFolds.map((x) => (
              <Text key={`t${x}`} x={x - 22} y={6} width={44} text="FOLD" fontSize={8} fill="#f95c05" align="center" letterSpacing={1} />
            ))}

            {/* Eyedropper overlay + tooltip */}
            {pickMode && (
              <Rect x={0} y={0} width={L.cw} height={L.ch}
                fill="transparent" listening
                onMouseMove={handlePickMove}
                onTouchMove={handlePickMove}
                onClick={handlePickCommit}
                onTap={handlePickCommit}
              />
            )}
            {pickMode && pickPreview && (
              <>
                <Rect x={ttX} y={ttY} width={86} height={22} fill="rgba(28,28,30,0.92)" cornerRadius={4} shadowBlur={8} shadowColor="rgba(0,0,0,0.4)" />
                <Rect x={ttX + 5} y={ttY + 5} width={12} height={12} fill={pickPreview.color} cornerRadius={2} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                <Text x={ttX + 21} y={ttY + 7} text={pickPreview.color.toUpperCase()} fontSize={9} fill="#e5e5e7" fontFamily="monospace" letterSpacing={1} />
              </>
            )}
          </Layer>
        </Stage>
      </div>

      <ColorPicker value={bgColor} onChange={setBgColor} onEyeDrop={pickFromCanvas} />

      <label className="cursor-pointer px-6 py-2.5 text-sm font-bold uppercase tracking-widest border-2"
        style={{ fontFamily: "var(--font-barlow-condensed)", borderColor: "#111", color: "#111" }}>
        {img ? "Change Image" : "Upload Image"}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>

      <p className="text-xs text-center" style={{ fontFamily: "var(--font-barlow)", color: "#aaa", maxWidth: 280 }}>
        For best print quality, upload a high-resolution image (300 DPI or higher).
      </p>
    </div>
  );
}
