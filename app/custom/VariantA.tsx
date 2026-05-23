"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Line, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { DEFAULT_LIGHTER, type LighterSpec } from "@/lib/constants";

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

type Pos = { x: number; y: number; w: number; h: number };
const defaultPos = (x: number): Pos => ({ x: x + 8, y: 8, w: L.fw - 16, h: L.ch - 16 });

export default function VariantA() {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const refA = useRef<Konva.Image>(null);
  const refB = useRef<Konva.Image>(null);

  const [imgA, setImgA] = useState<HTMLImageElement | null>(null);
  const [posA, setPosA] = useState<Pos>(defaultPos(L.ax));
  const [imgB, setImgB] = useState<HTMLImageElement | null>(null);
  const [posB, setPosB] = useState<Pos>(defaultPos(L.bx));
  const [sel, setSel] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    if (!trRef.current) return;
    const node = sel === "A" ? refA.current : sel === "B" ? refB.current : null;
    trRef.current.nodes(node ? [node] : []);
    trRef.current.getLayer()?.batchDraw();
  }, [sel, imgA, imgB]);

  const load = useCallback((file: File, side: "A" | "B") => {
    const url = URL.createObjectURL(file);
    const el = new window.Image();
    el.onload = () => {
      const ox = side === "A" ? L.ax : L.bx;
      const scale = Math.min((L.fw - 16) / el.width, (L.ch - 16) / el.height);
      const w = el.width * scale;
      const h = el.height * scale;
      const pos = { x: ox + (L.fw - w) / 2, y: (L.ch - h) / 2, w, h };
      if (side === "A") { setImgA(el); setPosA(pos); setSel("A"); }
      else { setImgB(el); setPosB(pos); setSel("B"); }
    };
    el.src = url;
  }, []);

  const onTransform = (set: (p: Pos) => void) => (e: Konva.KonvaEventObject<Event>) => {
    const n = e.target as Konva.Image;
    set({ x: n.x(), y: n.y(), w: n.width() * n.scaleX(), h: n.height() * n.scaleY() });
    n.scaleX(1); n.scaleY(1);
  };

  const folds = [L.ax, L.ex, L.bx, L.rx];

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ overflowX: "auto", maxWidth: "100%", border: "1px solid #e5e3de", borderRadius: 8 }}>
        <Stage ref={stageRef} width={L.cw} height={L.ch}
          onMouseDown={(e) => { if (e.target === e.target.getStage()) setSel(null); }}
          style={{ display: "block" }}
        >
          <Layer>
            <Rect x={0} y={0} width={L.cw} height={L.ch} fill="#fff" />
            <Rect x={0} y={0} width={L.hc} height={L.ch} fill="rgba(0,0,0,0.05)" />
            <Rect x={L.ex} y={0} width={L.fc} height={L.ch} fill="rgba(0,0,0,0.05)" />
            <Rect x={L.rx} y={0} width={L.hc} height={L.ch} fill="rgba(0,0,0,0.05)" />

            {!imgA && <>
              <Rect x={L.ax + 8} y={8} width={L.fw - 16} height={L.ch - 16} stroke="#e0ddd8" strokeWidth={1} dash={[5, 4]} fill="transparent" />
              <Text x={L.ax} y={L.ch / 2 - 8} width={L.fw} text="SIDE A" fontSize={10} fill="#ccc" align="center" fontStyle="bold" letterSpacing={3} />
            </>}
            {!imgB && <>
              <Rect x={L.bx + 8} y={8} width={L.fw - 16} height={L.ch - 16} stroke="#e0ddd8" strokeWidth={1} dash={[5, 4]} fill="transparent" />
              <Text x={L.bx} y={L.ch / 2 - 8} width={L.fw} text="SIDE B  (optional)" fontSize={9} fill="#ccc" align="center" fontStyle="bold" letterSpacing={2} />
            </>}

            {imgA && <KonvaImage ref={refA} image={imgA} x={posA.x} y={posA.y} width={posA.w} height={posA.h}
              draggable onClick={() => setSel("A")} onTap={() => setSel("A")}
              onDragEnd={(e) => setPosA(p => ({ ...p, x: e.target.x(), y: e.target.y() }))}
              onTransformEnd={onTransform(setPosA)} />}
            {imgB && <KonvaImage ref={refB} image={imgB} x={posB.x} y={posB.y} width={posB.w} height={posB.h}
              draggable onClick={() => setSel("B")} onTap={() => setSel("B")}
              onDragEnd={(e) => setPosB(p => ({ ...p, x: e.target.x(), y: e.target.y() }))}
              onTransformEnd={onTransform(setPosB)} />}

            <Transformer ref={trRef} keepRatio={false} rotateEnabled={false}
              boundBoxFunc={(o, n) => (n.width < 20 || n.height < 20 ? o : n)} />

            {folds.map((x) => <Line key={x} points={[x, 0, x, L.ch]} stroke="#f95c05" strokeWidth={1.5} dash={[8, 5]} />)}
            {folds.map((x) => <Text key={`t${x}`} x={x - 22} y={6} width={44} text="FOLD" fontSize={8} fill="#f95c05" align="center" letterSpacing={1} />)}
          </Layer>
        </Stage>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <label className="cursor-pointer px-5 py-2.5 text-sm font-bold uppercase tracking-widest border-2 transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)", borderColor: "#111", color: "#111" }}>
          {imgA ? "Change Side A" : "Upload Side A"}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) load(f, "A"); e.target.value = ""; }} />
        </label>
        <label className="cursor-pointer px-5 py-2.5 text-sm font-bold uppercase tracking-widest border-2 transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)", borderColor: imgB ? "#111" : "#ccc", color: imgB ? "#111" : "#aaa" }}>
          {imgB ? "Change Side B" : "Upload Side B (optional)"}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) load(f, "B"); e.target.value = ""; }} />
        </label>
      </div>
    </div>
  );
}
