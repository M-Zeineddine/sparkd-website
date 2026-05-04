"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Product, CATEGORIES } from "@/lib/types";

interface ProductForm {
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  price: string;
  category: string;
  tags: string;
  image_url: string;
}

const emptyForm: ProductForm = {
  name: "",
  name_ar: "",
  description: "",
  description_ar: "",
  price: "5",
  category: CATEGORIES[0],
  tags: "",
  image_url: "",
};

export default function AdminProducts() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products", { headers: { "x-admin": "true" } })
      .then((r) => {
        if (r.status === 401) { router.push("/admin"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      name_ar: p.name_ar || "",
      description: p.description || "",
      description_ar: p.description_ar || "",
      price: String(p.price),
      category: p.category,
      tags: (p.tags || []).join(", "),
      image_url: p.image_url || "",
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, image_url: data.url }));
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    try {
      const body = {
        name: form.name,
        name_ar: form.name_ar,
        description: form.description,
        description_ar: form.description_ar,
        price: parseFloat(form.price) || 5,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        image_url: form.image_url,
      };

      const res = editingId
        ? await fetch(`/api/products/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-admin": "true" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin": "true" },
            body: JSON.stringify(body),
          });

      const data = await res.json();
      if (editingId) {
        setProducts((prev) => prev.map((p) => (p.id === editingId ? data.product : p)));
      } else {
        setProducts((prev) => [data.product, ...prev]);
      }
      setShowForm(false);
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin": "true" },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const inputCls = "w-full px-3 py-2.5 text-sm text-white border border-white/10 bg-[#0a0a0a] focus:border-[#f95c05] outline-none";
  const labelCls = "text-xs uppercase tracking-widest text-white/40 block mb-1.5";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-white/10"
        style={{ background: "#111111" }}
      >
        <div className="flex items-center gap-6">
          <span
            className="text-white font-black text-xl uppercase tracking-widest"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Spark&apos;d Admin
          </span>
          <nav className="flex gap-4">
            <Link
              href="/admin/dashboard"
              className="text-white/50 hover:text-white text-sm uppercase tracking-wider transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Orders
            </Link>
            <span
              className="text-[#f95c05] text-sm font-bold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Products
            </span>
          </nav>
        </div>
        <button
          onClick={() => { document.cookie = "admin_session=; max-age=0; path=/"; router.push("/admin"); }}
          className="text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Logout
        </button>
      </div>

      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-black text-white uppercase tracking-widest"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Products ({products.length})
          </h2>
          <button
            onClick={openAdd}
            className="px-5 py-2 text-sm font-black uppercase tracking-widest"
            style={{ background: "#f95c05", color: "#fffdf9", fontFamily: "var(--font-barlow-condensed)" }}
          >
            + Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p.id} className="border border-white/10 overflow-hidden" style={{ background: "#111111" }}>
                <div className="relative aspect-square bg-[#1a1a1a]">
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="250px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">🔥</div>
                  )}
                </div>
                <div className="p-3">
                  <p
                    className="text-white font-bold text-sm uppercase tracking-wide truncate"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    {p.name}
                  </p>
                  <p className="text-[#f95c05] text-xs font-bold mt-0.5" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    ${p.price} · {p.category}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 py-1.5 text-xs font-bold uppercase tracking-wide border border-white/20 text-white hover:border-[#f95c05] hover:text-[#f95c05] transition-colors"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      className="flex-1 py-1.5 text-xs font-bold uppercase tracking-wide border border-white/20 text-white/50 hover:border-red-500 hover:text-red-400 transition-colors"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-2xl border border-white/10 p-6" style={{ background: "#111111" }}>
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-black text-white uppercase tracking-widest"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                {editingId ? "Edit Product" : "Add Product"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Name (EN) *</label>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cedar Wrap" style={{ fontFamily: "var(--font-barlow)" }} />
              </div>
              <div>
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Name (AR)</label>
                <input className={inputCls} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="ملصق الأرز" dir="rtl" style={{ fontFamily: "var(--font-cairo)" }} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Description (EN)</label>
                <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: "vertical", fontFamily: "var(--font-barlow)" }} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Description (AR)</label>
                <textarea className={inputCls} rows={2} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} dir="rtl" style={{ resize: "vertical", fontFamily: "var(--font-cairo)" }} />
              </div>
              <div>
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Price ($)</label>
                <input type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ fontFamily: "var(--font-barlow)" }} />
              </div>
              <div>
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Category *</label>
                <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ fontFamily: "var(--font-barlow)" }}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Tags (comma separated)</label>
                <input className={inputCls} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="flag, cedar, culture" style={{ fontFamily: "var(--font-barlow)" }} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Image</label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      className={inputCls}
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://... or upload below"
                      style={{ fontFamily: "var(--font-barlow)" }}
                    />
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="text-xs px-3 py-2 border border-white/20 text-white/60 hover:border-[#f95c05] hover:text-[#f95c05] transition-colors"
                        style={{ fontFamily: "var(--font-barlow-condensed)" }}
                      >
                        {uploading ? "Uploading..." : "Upload Image"}
                      </button>
                    </div>
                  </div>
                  {form.image_url && (
                    <div className="relative w-20 h-20 border border-white/10 overflow-hidden shrink-0">
                      <Image src={form.image_url} alt="Preview" fill className="object-cover" sizes="80px" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex-1 py-3 text-sm font-black uppercase tracking-widest"
                style={{
                  background: saving || !form.name ? "#333" : "#f95c05",
                  color: "#fffdf9",
                  fontFamily: "var(--font-barlow-condensed)",
                  cursor: saving || !form.name ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Product"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 text-sm font-bold uppercase tracking-widest border border-white/20 text-white/60 hover:text-white transition-colors"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-sm border border-white/10 p-6 text-center" style={{ background: "#111111" }}>
            <p className="text-white text-lg font-bold mb-6" style={{ fontFamily: "var(--font-barlow)" }}>
              Are you sure you want to delete this product?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 text-sm font-black uppercase"
                style={{ background: "#ef4444", color: "#fff", fontFamily: "var(--font-barlow-condensed)" }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 text-sm font-bold uppercase border border-white/20 text-white/60"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
