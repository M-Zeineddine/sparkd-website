"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Line,
  Text,
  Transformer,
} from "react-konva";
import type Konva from "konva";
import { DEFAULT_LIGHTER, type LighterSpec } from "@/lib/constants";
import ColorPicker from "./ColorPicker";
import LighterPreview from "./LighterPreview";

const PX_PER_CM = 72;

function buildLayout(spec: LighterSpec) {
  const connectorW = (spec.wrapWidth - 2 * spec.faceWidth) / 2;
  const halfConn = Math.round((connectorW / 2) * PX_PER_CM);
  const conn = Math.round(connectorW * PX_PER_CM);
  const faceW = Math.round(spec.faceWidth * PX_PER_CM);
  const cw = Math.round(spec.wrapWidth * PX_PER_CM);
  const ch = Math.round(spec.wrapHeight * PX_PER_CM);
  const sideAx = halfConn;
  const connBx = halfConn + faceW;
  const sideBx = halfConn + faceW + conn;
  const rightEdgeX = halfConn + faceW + conn + faceW;
  return { cw, ch, halfConn, conn, faceW, sideAx, connBx, sideBx, rightEdgeX };
}

const L = buildLayout(DEFAULT_LIGHTER);
const { cw: CW, ch: CH } = L;

const centerX = Math.round((CW - L.faceW) / 2);

type Mode = "single" | "both";
type Pos = { x: number; y: number; w: number; h: number };

function sampleCanvas(canvas: HTMLCanvasElement, x: number, y: number): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#ffffff";
  const d = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
  return "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export interface DesignExport {
  dataUrl: string;
}

interface Props {
  onExport: (d: DesignExport) => void;
}

export default function DesignEditor({ onExport }: Props) {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const imgRef = useRef<Konva.Image>(null);

  const [mode, setMode] = useState<Mode>("single");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgPos, setImgPos] = useState<Pos>({ x: centerX + 8, y: 8, w: L.faceW - 16, h: CH - 16 });
  const [selected, setSelected] = useState(false);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFolds, setShowFolds] = useState(true);
  const prevMode = useRef<Mode>("single");

  // Eyedropper state
  const pickResolveRef = useRef<((color: string | null) => void) | null>(null);
  const pickCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [pickPreview, setPickPreview] = useState<{ x: number; y: number; color: string } | null>(null);

  useEffect(() => {
    if (prevMode.current === mode) return;
    const fromOrigin = prevMode.current === "single" ? centerX : L.sideAx;
    const toOrigin   = mode              === "single" ? centerX : L.sideAx;
    setImgPos(p => ({ ...p, x: p.x + (toOrigin - fromOrigin) }));
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
      const origin = mode === "single" ? centerX : L.sideAx;
      const scale = Math.min((L.faceW - 16) / el.width, (CH - 16) / el.height);
      const w = el.width * scale;
      const h = el.height * scale;
      setImgPos({ x: origin + (L.faceW - w) / 2, y: (CH - h) / 2, w, h });
      setImg(el);
      setSelected(true);
    };
    el.src = url;
    e.target.value = "";
  }, [mode]);

  const handlePreview = useCallback(() => {
    setSelected(false);
    setShowFolds(false);
    // Give React + Konva time to re-render without fold lines before capturing
    setTimeout(() => {
      const url = stageRef.current?.toDataURL({ pixelRatio: 2 }) ?? "";
      setPreviewUrl(url);
      setShowFolds(true);
    }, 50);
  }, []);

  const handleExport = useCallback(() => {
    setSelected(false);
    requestAnimationFrame(() => {
      const dataUrl = stageRef.current?.toDataURL({ pixelRatio: 2 }) ?? "";
      onExport({ dataUrl });
    });
  }, [onExport]);

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

  const singleFolds = [centerX, centerX + L.faceW];
  const bothFolds   = [L.sideAx, L.connBx, L.sideBx, L.rightEdgeX];
  const activeFolds = mode === "single" ? singleFolds : bothFolds;

  const ttX = pickPreview ? (pickPreview.x + 90 > CW ? pickPreview.x - 94 : pickPreview.x + 14) : 0;
  const ttY = pickPreview ? (pickPreview.y + 28 > CH ? pickPreview.y - 32 : pickPreview.y + 14) : 0;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
          {DEFAULT_LIGHTER.name} — {DEFAULT_LIGHTER.wrapWidth}×{DEFAULT_LIGHTER.wrapHeight} cm
        </p>
        <p className="text-sm text-center max-w-md" style={{ color: "#777", fontFamily: "var(--font-barlow)" }}>
          Orange lines are fold lines. Drag and resize your image to position it on the wrap.
        </p>
      </div>

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

      {/* Canvas */}
      <div style={{ overflowX: "auto", maxWidth: "100%", borderRadius: 8, border: "1px solid #e5e3de" }}>
        <Stage
          ref={stageRef}
          width={CW}
          height={CH}
          onMouseDown={(e) => {
            if (pickMode) return;
            if (e.target === e.target.getStage()) setSelected(false);
          }}
          onTouchStart={(e) => { if (e.target === e.target.getStage()) setSelected(false); }}
          style={{ display: "block", cursor: pickMode ? "crosshair" : undefined }}
        >
          <Layer>
            <Rect x={0} y={0} width={CW} height={CH} fill="#ffffff" />

            {bgColor && <Rect x={0} y={0} width={CW} height={CH} fill={bgColor} />}

            {mode === "both" && <>
              <Rect x={0} y={0} width={L.halfConn} height={CH} fill="rgba(0,0,0,0.05)" />
              <Rect x={L.connBx} y={0} width={L.conn} height={CH} fill="rgba(0,0,0,0.05)" />
              <Rect x={L.rightEdgeX} y={0} width={L.halfConn} height={CH} fill="rgba(0,0,0,0.05)" />
            </>}

            {!img && <>
              {mode === "single"
                ? <>
                    <Rect x={centerX + 8} y={8} width={L.faceW - 16} height={CH - 16}
                      stroke="#e0ddd8" strokeWidth={1} dash={[5, 4]} fill="transparent" />
                    <Text x={centerX} y={CH / 2 - 14} width={L.faceW}
                      text="YOUR DESIGN" fontSize={10} fill="#ccc" align="center" fontStyle="bold" letterSpacing={2} />
                    <Text x={centerX} y={CH / 2 + 2} width={L.faceW}
                      text="UPLOAD TO START" fontSize={8} fill="#ddd" align="center" letterSpacing={1} />
                  </>
                : <>
                    <Rect x={L.sideAx + 8} y={8} width={L.faceW - 16} height={CH - 16}
                      stroke="#e0ddd8" strokeWidth={1} dash={[5, 4]} fill="transparent" />
                    <Text x={L.sideAx} y={CH / 2 - 14} width={L.faceW}
                      text="SIDE A" fontSize={10} fill="#ccc" align="center" fontStyle="bold" letterSpacing={3} />
                    <Text x={L.sideAx} y={CH / 2 + 2} width={L.faceW}
                      text="YOUR DESIGN HERE" fontSize={8} fill="#ddd" align="center" letterSpacing={1} />
                    <Rect x={L.sideBx + 8} y={8} width={L.faceW - 16} height={CH - 16}
                      stroke="#e0ddd8" strokeWidth={1} dash={[5, 4]} fill="transparent" />
                    <Text x={L.sideBx} y={CH / 2 - 14} width={L.faceW}
                      text="SIDE B" fontSize={10} fill="#ccc" align="center" fontStyle="bold" letterSpacing={3} />
                    <Text x={L.sideBx} y={CH / 2 + 2} width={L.faceW}
                      text="YOUR DESIGN HERE" fontSize={8} fill="#ddd" align="center" letterSpacing={1} />
                  </>
              }
            </>}

            {img && (
              <KonvaImage
                ref={imgRef}
                image={img}
                x={imgPos.x}
                y={imgPos.y}
                width={imgPos.w}
                height={imgPos.h}
                draggable={!pickMode}
                onClick={() => { if (!pickMode) setSelected(true); }}
                onTap={() => { if (!pickMode) setSelected(true); }}
                onDragEnd={(e) => setImgPos((p) => ({ ...p, x: e.target.x(), y: e.target.y() }))}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Image;
                  setImgPos({
                    x: node.x(),
                    y: node.y(),
                    w: node.width() * node.scaleX(),
                    h: node.height() * node.scaleY(),
                  });
                  node.scaleX(1);
                  node.scaleY(1);
                }}
              />
            )}

            <Transformer
              ref={trRef}
              keepRatio={false}
              rotateEnabled={false}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
              }
            />

            {showFolds && activeFolds.map((x) => (
              <Line key={x} points={[x, 0, x, CH]} stroke="#f95c05" strokeWidth={1.5} dash={[8, 5]} />
            ))}
            {showFolds && activeFolds.map((x) => (
              <Text key={`l${x}`} x={x - 22} y={6} width={44} text="FOLD" fontSize={8} fill="#f95c05" align="center" letterSpacing={1} />
            ))}

            {/* Eyedropper overlay + tooltip */}
            {pickMode && (
              <Rect x={0} y={0} width={CW} height={CH}
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

      <div className="flex gap-3 flex-wrap justify-center">
        <label
          className="cursor-pointer px-6 py-2.5 text-sm font-bold uppercase tracking-widest border-2 transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)", borderColor: "#111", color: "#111" }}
        >
          {img ? "Change Image" : "Upload Image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>

        {img && (
          <button
            onClick={handlePreview}
            className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest border-2 transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)", borderColor: "#888", color: "#888" }}
          >
            Preview on Lighter
          </button>
        )}
        {img && (
          <button className="btn-primary px-8 py-2.5 text-sm" onClick={handleExport}>
            Use This Design →
          </button>
        )}
      </div>

      {previewUrl && (
        <LighterPreview dataUrl={previewUrl} mode={mode} onClose={() => setPreviewUrl(null)} />
      )}

      <p className="text-xs text-center" style={{ fontFamily: "var(--font-barlow)", color: "#aaa", maxWidth: 300 }}>
        For best print quality, upload a high-resolution image (300 DPI or higher).
      </p>
    </div>
  );
}
