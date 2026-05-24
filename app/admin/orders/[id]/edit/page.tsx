"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { DesignExport, DesignLayout } from "@/app/custom/DesignEditor";

const DesignEditor = dynamic(() => import("@/app/custom/DesignEditor"), { ssr: false });

interface OrderDetail {
  id: string;
  first_name: string;
  last_name: string | null;
  design_layout: DesignLayout | null;
}

export default function EditDesignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/custom-orders/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => { setOrder(data.order); setLoading(false); })
      .catch(() => { setError("Failed to load order."); setLoading(false); });
  }, [id]);

  const handleExport = async (d: DesignExport) => {
    setSaving(true);
    setError("");
    const blob = await fetch(d.dataUrl).then(r => r.blob());
    const fd = new FormData();
    fd.append("design", new File([blob], "design.png", { type: "image/png" }));
    fd.append("design_mode", d.layout.mode);
    fd.append("design_layout", JSON.stringify(d.layout));
    fd.append("image_count", String(d.sourceFiles.length));
    d.sourceFiles.forEach((f, i) => { if (f) fd.append(`image_${i}`, f); });
    const res = await fetch(`/api/admin/custom-orders/${id}`, { method: "PUT", body: fd });
    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save.");
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "#fffdf9", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#111", borderBottom: "2px solid #f95c05" }}>
        <div className="flex items-center gap-4 px-6 py-4" style={{ maxWidth: 960, margin: "0 auto" }}>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-xs font-bold uppercase tracking-widest transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)", color: "#888" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#888")}
          >
            ← Dashboard
          </button>
          <div className="flex-1">
            {order && (
              <p className="text-xs font-bold uppercase tracking-widest"
                style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                Editing — {order.first_name} {order.last_name ?? ""}
              </p>
            )}
          </div>
          {saving && (
            <p className="text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-barlow-condensed)", color: "#888" }}>
              Saving…
            </p>
          )}
          {error && (
            <p className="text-xs" style={{ fontFamily: "var(--font-barlow)", color: "#ef4444" }}>
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-12" style={{ maxWidth: 960, margin: "0 auto" }}>
        {loading ? (
          <p className="text-center text-sm" style={{ fontFamily: "var(--font-barlow)", color: "#aaa" }}>
            Loading design…
          </p>
        ) : error && !order ? (
          <p className="text-center text-sm" style={{ fontFamily: "var(--font-barlow)", color: "#ef4444" }}>
            {error}
          </p>
        ) : (
          <DesignEditor
            onExport={handleExport}
            initialLayout={order?.design_layout ?? undefined}
          />
        )}
      </div>
    </div>
  );
}
