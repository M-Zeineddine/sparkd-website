"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
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
const SNAP_THRESHOLD = 8;

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

type Mode = "single" | "both";
type ImageItem = { id: string; img: HTMLImageElement; sourceFile?: File; storageUrl?: string; x: number; y: number; w: number; h: number; rotation: number };
type TextItem = { id: string; text: string; x: number; y: number; fontSize: number; color: string; fontFamily: string; rotation: number };

// Add { name: "Font Name", google: true } for any Google Font — it loads automatically on first use.
const FONTS: { name: string; google?: boolean }[] = [
  { name: "Impact" },
  { name: "Arial Black" },
  { name: "Arial" },
  { name: "Georgia" },
  { name: "Courier New" },
  { name: "Bebas Neue", google: true },
  { name: "Oswald", google: true },
  { name: "Montserrat", google: true },
  { name: "Playfair Display", google: true },
  { name: "Roboto Condensed", google: true },
];

async function ensureFont(name: string, google?: boolean) {
  if (!google) return;
  const id = `gfont-${name.toLowerCase().replace(/\s+/g, "-")}`;
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:wght@700&display=swap`;
    document.head.appendChild(link);
  }
  await document.fonts.load(`700 40px "${name}"`);
}

function sampleCanvas(canvas: HTMLCanvasElement, x: number, y: number): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#ffffff";
  const d = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
  return "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export interface DesignLayout {
  mode: Mode;
  bgColor: string | null;
  images: Array<{ storageUrl?: string; x: number; y: number; w: number; h: number; rotation: number }>;
  texts: TextItem[];
}

export interface DesignExport {
  dataUrl: string;
  layout: DesignLayout;
  sourceFiles: Array<File | null>;
}

interface Props {
  spec?: LighterSpec;
  onExport: (d: DesignExport) => void;
  initialLayout?: DesignLayout;
}

export default function DesignEditor({ spec = DEFAULT_LIGHTER, onExport, initialLayout }: Props) {
  const { L, CW, CH, centerX } = useMemo(() => {
    const L = buildLayout(spec);
    return { L, CW: L.cw, CH: L.ch, centerX: Math.round((L.cw - L.faceW) / 2) };
  }, [spec]);

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const initialLayoutRef = useRef(initialLayout);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canvasScale, setCanvasScale] = useState(1);

  const [mode, setMode] = useState<Mode>("single");
  const [images, setImages] = useState<ImageItem[]>([]);
  // null = nothing selected, image id or text id
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string | null>("#ffffff");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFolds, setShowFolds] = useState(true);

  // Text state
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [draftText, setDraftText] = useState("YOUR TEXT");
  const [textFont, setTextFont] = useState("Impact");
  const [textSize, setTextSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");

  const [guides, setGuides] = useState<{ hX: number | null; v: boolean }>({ hX: null, v: false });

  // Eyedropper state
  const pickResolveRef = useRef<((color: string | null) => void) | null>(null);
  const pickCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [pickPreview, setPickPreview] = useState<{ x: number; y: number; color: string } | null>(null);

  // Hydrate from initialLayout on mount (e.g. re-editing a saved order)
  useEffect(() => {
    const layout = initialLayoutRef.current;
    if (!layout) return;
    setMode(layout.mode);
    setBgColor(layout.bgColor);
    setTexts(layout.texts);
    const toLoad = layout.images.filter(img => img.storageUrl);
    if (!toLoad.length) return;
    Promise.all(
      toLoad.map((imgData, i) =>
        new Promise<ImageItem | null>(resolve => {
          const el = new window.Image();
          el.crossOrigin = "anonymous";
          el.onload = () => resolve({
            id: `img-init-${Date.now()}-${i}`,
            img: el,
            storageUrl: imgData.storageUrl,
            x: imgData.x, y: imgData.y, w: imgData.w, h: imgData.h, rotation: imgData.rotation,
          });
          el.onerror = () => resolve(null);
          el.src = imgData.storageUrl!;
        })
      )
    ).then(items => setImages(items.filter((i): i is ImageItem => i !== null)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setCanvasScale(Math.min(1, el.offsetWidth / CW));
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [CW]);

  const handleModeChange = useCallback((newMode: Mode) => {
    if (newMode === mode) return;
    const delta = (newMode === "single" ? centerX : L.sideAx) - (mode === "single" ? centerX : L.sideAx);
    setImages(imgs => imgs.map(i => ({ ...i, x: i.x + delta })));
    setMode(newMode);
  }, [mode, centerX, L]);

  // Attach Transformer to selected node (image or text)
  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    let node: Konva.Node | null = null;
    if (selectedId) {
      node = stageRef.current.findOne(`#${selectedId}`) ?? null;
    }
    trRef.current.nodes(node ? [node] : []);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedId]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const el = new window.Image();
    el.onload = () => {
      const origin = mode === "single" ? centerX : L.sideAx;
      const scale = Math.min((L.faceW - 16) / el.width, (CH - 16) / el.height);
      const w = el.width * scale;
      const h = el.height * scale;
      const id = `img-${Date.now()}`;
      setImages(imgs => [...imgs, { id, img: el, sourceFile: file, x: origin + (L.faceW - w) / 2, y: (CH - h) / 2, w, h, rotation: 0 }]);
      setSelectedId(id);
    };
    el.src = URL.createObjectURL(file);
    e.target.value = "";
  }, [mode, centerX, L, CH]);

  const handlePreview = useCallback(() => {
    setSelectedId(null);
    setShowFolds(false);
    setTimeout(() => {
      const url = stageRef.current?.toDataURL({ pixelRatio: 2 / canvasScale }) ?? "";
      setPreviewUrl(url);
      setShowFolds(true);
    }, 50);
  }, [canvasScale]);

  const handleExport = useCallback(() => {
    setSelectedId(null);
    setShowFolds(false);
    setTimeout(() => {
      const dataUrl = stageRef.current?.toDataURL({ pixelRatio: 2 / canvasScale }) ?? "";
      setShowFolds(true);
      onExport({
        dataUrl,
        layout: {
          mode,
          bgColor,
          images: images.map(({ storageUrl, x, y, w, h, rotation }) => ({ storageUrl, x, y, w, h, rotation })),
          texts,
        },
        sourceFiles: images.map(i => i.sourceFile ?? null),
      });
    }, 50);
  }, [canvasScale, onExport, mode, bgColor, images, texts]);

  const pickFromCanvas = useCallback((): Promise<string | null> => {
    if (!stageRef.current) return Promise.resolve(null);
    pickCanvasRef.current = stageRef.current.toCanvas({ pixelRatio: 1 / canvasScale });
    return new Promise((resolve) => {
      pickResolveRef.current = resolve;
      setPickMode(true);
      setPickPreview(null);
    });
  }, [canvasScale]);

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

  const handleDragMove = useCallback((e: { target: Konva.Node }) => {
    const node = e.target;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = node.getClientRect({ relativeTo: stage });
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const hCenters = mode === "both"
      ? [L.sideAx + L.faceW / 2, L.sideBx + L.faceW / 2]
      : [CW / 2];
    const snappedX = hCenters.find(c => Math.abs(cx - c) < SNAP_THRESHOLD) ?? null;
    const snapV = Math.abs(cy - CH / 2) < SNAP_THRESHOLD;
    if (snappedX !== null) node.x(node.x() + (snappedX - cx));
    if (snapV) node.y(node.y() + (CH / 2 - cy));
    setGuides({ hX: snappedX, v: snapV });
  }, [mode, L, CW, CH]);

  const handlePickMove = useCallback(() => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos || !pickCanvasRef.current) return;
    const color = sampleCanvas(pickCanvasRef.current, pos.x, pos.y);
    setPickPreview({ x: pos.x, y: pos.y, color });
  }, []);

  const handleAddText = useCallback(() => {
    if (!draftText.trim()) return;
    const origin = mode === "single" ? centerX : L.sideAx;
    const id = `text-${Date.now()}`;
    setTexts(ts => [...ts, {
      id,
      text: draftText,
      x: origin + 8,
      y: CH / 2 - textSize / 2,
      fontSize: textSize,
      color: textColor,
      fontFamily: textFont,
      rotation: 0,
    }]);
    setSelectedId(id);
  }, [draftText, textFont, textSize, textColor, mode, centerX, L, CH]);

  const isSelectedImage = images.some(i => i.id === selectedId);

  // Selected text node (null if nothing or image is selected)
  const activeText = (!isSelectedImage && selectedId)
    ? texts.find(t => t.id === selectedId) ?? null
    : null;

  // Panel values read from active text when selected, else from draft state
  const panelText  = activeText?.text       ?? draftText;
  const panelFont  = activeText?.fontFamily ?? textFont;
  const panelSize  = activeText?.fontSize   ?? textSize;
  const panelColor = activeText?.color      ?? textColor;

  const setPanelText  = (v: string) => activeText ? setTexts(ts => ts.map(t => t.id === selectedId ? { ...t, text: v }       : t)) : setDraftText(v);
  const setPanelFont  = async (v: string) => {
    const def = FONTS.find(f => f.name === v);
    await ensureFont(v, def?.google);
    if (activeText) setTexts(ts => ts.map(t => t.id === selectedId ? { ...t, fontFamily: v } : t));
    else setTextFont(v);
    stageRef.current?.getLayers()[0]?.batchDraw();
  };
  const setPanelSize  = (v: number) => activeText ? setTexts(ts => ts.map(t => t.id === selectedId ? { ...t, fontSize: v }   : t)) : setTextSize(v);
  const setPanelColor = (v: string) => activeText ? setTexts(ts => ts.map(t => t.id === selectedId ? { ...t, color: v }      : t)) : setTextColor(v);

  const singleFolds = [centerX, centerX + L.faceW];
  const bothFolds   = [L.sideAx, L.connBx, L.sideBx, L.rightEdgeX];
  const activeFolds = mode === "single" ? singleFolds : bothFolds;

  const ttX = pickPreview ? (pickPreview.x + 90 > CW ? pickPreview.x - 94 : pickPreview.x + 14) : 0;
  const ttY = pickPreview ? (pickPreview.y + 28 > CH ? pickPreview.y - 32 : pickPreview.y + 14) : 0;

  const hasContent = images.length > 0 || texts.length > 0;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
          {spec.name} — {spec.wrapWidth}×{spec.wrapHeight} cm
        </p>
        <p className="text-sm text-center max-w-md" style={{ color: "#777", fontFamily: "var(--font-barlow)" }}>
          Orange lines are fold lines. Drag and resize your image to position it on the wrap.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1" style={{ background: "#f0eeea", borderRadius: 6 }}>
        {(["single", "both"] as Mode[]).map((m) => (
          <button key={m} onClick={() => handleModeChange(m)}
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
      <div ref={containerRef} style={{ width: "100%", maxWidth: CW, borderRadius: 8, border: "1px solid #e5e3de", lineHeight: 0 }}>
        <Stage
          ref={stageRef}
          width={CW * canvasScale}
          height={CH * canvasScale}
          scaleX={canvasScale}
          scaleY={canvasScale}
          onMouseDown={(e) => {
            if (pickMode) return;
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
          onTouchStart={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
          style={{ display: "block", cursor: pickMode ? "crosshair" : undefined }}
        >
          <Layer>
            <Rect x={0} y={0} width={CW} height={CH} fill="#ffffff" />

            {bgColor && <Rect x={0} y={0} width={CW} height={CH} fill={bgColor} />}


            {images.length === 0 && texts.length === 0 && <>
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

            {images.map(item => (
              <KonvaImage
                key={item.id}
                id={item.id}
                image={item.img}
                x={item.x}
                y={item.y}
                width={item.w}
                height={item.h}
                rotation={item.rotation}
                draggable={!pickMode}
                onClick={() => { if (!pickMode) setSelectedId(item.id); }}
                onTap={() => { if (!pickMode) setSelectedId(item.id); }}
                onDragMove={handleDragMove}
                onDragEnd={(e) => {
                  setImages(imgs => imgs.map(i =>
                    i.id === item.id ? { ...i, x: e.target.x(), y: e.target.y() } : i
                  ));
                  setGuides({ hX: null, v: false });
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Image;
                  const newX = node.x();
                  const newY = node.y();
                  const newW = node.width() * node.scaleX();
                  const newH = node.height() * node.scaleY();
                  const newRot = node.rotation();
                  node.scaleX(1);
                  node.scaleY(1);
                  setImages(imgs => imgs.map(i =>
                    i.id === item.id
                      ? { ...i, x: newX, y: newY, w: newW, h: newH, rotation: newRot }
                      : i
                  ));
                }}
              />
            ))}

            {/* Text nodes */}
            {texts.map(t => (
              <Text
                key={t.id}
                id={t.id}
                text={t.text}
                x={t.x}
                y={t.y}
                fontSize={t.fontSize}
                fill={t.color}
                fontFamily={t.fontFamily}
                fontStyle="bold"
                rotation={t.rotation}
                draggable={!pickMode}
                onClick={() => { if (!pickMode) setSelectedId(t.id); }}
                onTap={() => { if (!pickMode) setSelectedId(t.id); }}
                onDragMove={handleDragMove}
                onDragEnd={(e) => {
                  setTexts(ts => ts.map(item =>
                    item.id === t.id ? { ...item, x: e.target.x(), y: e.target.y() } : item
                  ));
                  setGuides({ hX: null, v: false });
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Text;
                  const newFontSize = Math.max(8, Math.round(t.fontSize * node.scaleY()));
                  setTexts(ts => ts.map(item =>
                    item.id === t.id
                      ? { ...item, x: node.x(), y: node.y(), rotation: node.rotation(), fontSize: newFontSize }
                      : item
                  ));
                  node.scaleX(1);
                  node.scaleY(1);
                }}
              />
            ))}

            <Transformer
              ref={trRef}
              keepRatio={!isSelectedImage}
              rotateEnabled={true}
              rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
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

            {guides.hX !== null && <Line points={[guides.hX, 0, guides.hX, CH]} stroke="#00c8ff" strokeWidth={1} dash={[6, 4]} />}
            {guides.v && <Line points={[0, CH / 2, CW, CH / 2]} stroke="#00c8ff" strokeWidth={1} dash={[6, 4]} />}

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

      {/* Controls card */}
      <div className="w-full rounded-xl overflow-visible" style={{ maxWidth: CW, border: "1px solid #e5e3de", background: "#faf9f7" }}>

        {/* Background fill row */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #e5e3de" }}>
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#bbb" }}>
            Fill Color
          </span>
          <ColorPicker value={bgColor} onChange={setBgColor} onEyeDrop={pickFromCanvas} label="Background" />
        </div>

        {/* Selected image row */}
        {isSelectedImage && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #e5e3de" }}>
            <span className="text-[11px] font-black uppercase tracking-widest"
              style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
              Image Selected
            </span>
            <button
              onClick={() => { setImages(imgs => imgs.filter(i => i.id !== selectedId)); setSelectedId(null); }}
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-barlow-condensed)", color: "#e53e3e" }}
            >
              Remove
            </button>
          </div>
        )}

        {/* Text section */}
        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest"
              style={{ fontFamily: "var(--font-barlow-condensed)", color: activeText ? "#f95c05" : "#bbb" }}>
              {activeText ? "Editing Text" : "Text"}
            </span>
            {activeText && (
              <button
                onClick={() => { setTexts(ts => ts.filter(t => t.id !== selectedId)); setSelectedId(null); }}
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-barlow-condensed)", color: "#e53e3e" }}
              >
                Remove
              </button>
            )}
          </div>

          <input
            className="w-full px-3 py-2.5 text-sm outline-none transition-colors rounded-lg"
            style={{
              background: "#fff",
              border: "1.5px solid #e0ddd8",
              fontFamily: "var(--font-barlow)",
              color: "#111",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "#f95c05"}
            onBlur={e => e.currentTarget.style.borderColor = "#e0ddd8"}
            value={panelText}
            onChange={e => setPanelText(e.target.value)}
            placeholder="Type your text..."
          />

          <div className="flex flex-wrap gap-2 items-end">
            {/* Font — full row on small screens, flex-1 on larger */}
            <div className="flex flex-col gap-1.5 w-full sm:flex-1 sm:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#aaa" }}>Font</span>
              <select
                className="w-full px-3 py-2 text-sm outline-none rounded-lg transition-colors"
                style={{ background: "#fff", border: "1.5px solid #e0ddd8", fontFamily: "var(--font-barlow)", color: "#333" }}
                value={panelFont}
                onChange={e => setPanelFont(e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = "#f95c05"}
                onBlur={e => e.currentTarget.style.borderColor = "#e0ddd8"}
              >
                {FONTS.map(f => <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.name}</option>)}
              </select>
            </div>

            {/* Size */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#aaa" }}>Size</span>
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1.5px solid #e0ddd8", background: "#fff" }}>
                <button className="px-3 py-2 font-bold transition-colors hover:bg-[#f0eeea]"
                  style={{ color: "#555", fontSize: 16, lineHeight: 1 }}
                  onClick={() => setPanelSize(Math.max(8, panelSize - 1))}>−</button>
                <span className="text-sm w-9 text-center select-none" style={{ fontFamily: "var(--font-barlow)", color: "#333" }}>{panelSize}</span>
                <button className="px-3 py-2 font-bold transition-colors hover:bg-[#f0eeea]"
                  style={{ color: "#555", fontSize: 16, lineHeight: 1 }}
                  onClick={() => setPanelSize(Math.min(200, panelSize + 1))}>+</button>
              </div>
            </div>

            {/* Text color */}
            <div className="flex-1 min-w-0">
              <ColorPicker value={panelColor} onChange={c => setPanelColor(c ?? "#ffffff")} label="Color" />
            </div>
          </div>

          <button
            onClick={handleAddText}
            disabled={!panelText.trim()}
            className="w-full py-2.5 text-sm font-bold uppercase tracking-widest rounded-lg transition-colors disabled:opacity-40"
            style={{ fontFamily: "var(--font-barlow-condensed)", background: "#111", color: "#fff" }}
          >
            + Add Text to Canvas
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <label
          className="cursor-pointer px-6 py-2.5 text-sm font-bold uppercase tracking-widest border-2 transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)", borderColor: "#111", color: "#111" }}
        >
          Add Image
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>

        {hasContent && (
          <button
            onClick={handlePreview}
            className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest border-2 transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)", borderColor: "#888", color: "#888" }}
          >
            Preview on Lighter
          </button>
        )}
        {hasContent && (
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
