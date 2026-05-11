"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Product, CategoryRecord, SubcategoryRecord, ProductSize } from "@/lib/types";
import { DEFAULT_SIZES, mergeSizes } from "@/lib/constants";

interface ProductForm {
  name: string;
  name_ar: string;
  price: string;
  category: string;
  subcategory: string;
  image_urls: string[];
  in_stock: boolean;
  sizes: ProductSize[];
}

const emptyForm: ProductForm = {
  name: "",
  name_ar: "",
  price: "4",
  category: "",
  subcategory: "",
  image_urls: [],
  in_stock: true,
  sizes: DEFAULT_SIZES,
};

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const subcategories: SubcategoryRecord[] =
    categories.find((c) => c.name === form.category)?.subcategories ?? [];

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        const cats: CategoryRecord[] = d.categories || [];
        setCategories(cats);
        setForm((f) => ({ ...f, category: f.category || cats[0]?.name || "" }));
      });
  }, []);

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
    const allSlugs = new Set(
      categories.flatMap((c) => c.subcategories.map((s) => s.slug))
    );
    const existingSubcategory = (p.tags || []).find((t) => allSlugs.has(t)) || "";
    const urls = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [];
    setForm({
      name: p.name,
      name_ar: p.name_ar || "",
      price: String(p.price),
      category: p.category,
      subcategory: existingSubcategory,
      image_urls: urls,
      in_stock: p.in_stock !== false,
      sizes: mergeSizes(p.sizes),
    });
    setShowForm(true);
  };

  const handleCategoryChange = (cat: string) => {
    setForm((f) => ({ ...f, category: cat, subcategory: "" }));
  };

  const resizeImage = (file: File, maxPx = 1500): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Canvas failed")), "image/jpeg", 0.88);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const blob = await resizeImage(file);
      const resized = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
      const fd = new FormData();
      fd.append("file", resized);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => {
          const urls = [...f.image_urls];
          urls[idx] = data.url;
          return { ...f, image_urls: urls };
        });
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploadingIdx(null);
      e.target.value = "";
    }
  };

  const addImageSlot = () => setForm((f) => ({ ...f, image_urls: [...f.image_urls, ""] }));

  const removeImage = (idx: number) =>
    setForm((f) => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== idx) }));

  const moveImage = (idx: number, dir: -1 | 1) =>
    setForm((f) => {
      const urls = [...f.image_urls];
      const target = idx + dir;
      if (target < 0 || target >= urls.length) return f;
      [urls[idx], urls[target]] = [urls[target], urls[idx]];
      return { ...f, image_urls: urls };
    });

  const updateImageUrl = (idx: number, val: string) =>
    setForm((f) => {
      const urls = [...f.image_urls];
      urls[idx] = val;
      return { ...f, image_urls: urls };
    });

  const handleSave = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    try {
      const cleanUrls = form.image_urls.filter(Boolean);
      const body = {
        name: form.name,
        name_ar: form.name_ar,
        price: form.sizes.find((s) => s.available)?.price ?? (parseFloat(form.price) || 5),
        category: form.category,
        tags: form.subcategory ? [form.subcategory] : [],
        image_url: cleanUrls[0] || "",
        image_urls: cleanUrls,
        in_stock: form.in_stock,
        sizes: form.sizes,
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
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (editingId) {
        setProducts((prev) => prev.map((p) => (p.id === editingId ? data.product : p)));
      } else {
        if (data.product) setProducts((prev) => [data.product, ...prev]);
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
            <Link
              href="/admin/categories"
              className="text-white/50 hover:text-white text-sm uppercase tracking-wider transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Categories
            </Link>
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
            {products.filter(Boolean).map((p) => (
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[#f95c05] text-xs font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      ${p.price} · {p.category}
                      {p.tags?.[0] && <span className="text-white/40"> / {p.tags[0]}</span>}
                    </p>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5"
                      style={{
                        fontFamily: "var(--font-barlow-condensed)",
                        background: p.in_stock !== false ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                        color: p.in_stock !== false ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {p.in_stock !== false ? "In Stock" : "Sold Out"}
                    </span>
                  </div>
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
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cedar Lighter" style={{ fontFamily: "var(--font-barlow)" }} />
              </div>
              <div>
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Name (AR)</label>
                <input className={inputCls} value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="ملصق الأرز" dir="rtl" style={{ fontFamily: "var(--font-cairo)" }} />
              </div>
              <div>
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Price ($)</label>
                <input type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ fontFamily: "var(--font-barlow)" }} />
              </div>
              <div>
                <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Category *</label>
                <select className={inputCls} value={form.category} onChange={(e) => handleCategoryChange(e.target.value)} style={{ fontFamily: "var(--font-barlow)" }}>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {subcategories.length > 0 && (
                <div className="sm:col-span-2">
                  <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Subcategory</label>
                  <select
                    className={inputCls}
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    style={{ fontFamily: "var(--font-barlow)" }}
                  >
                    <option value="">— None —</option>
                    {subcategories.map(({ name, slug }) => (
                      <option key={slug} value={slug}>{name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    Images <span className="text-white/20 normal-case tracking-normal">(design first, then lighter photo)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addImageSlot}
                    className="text-xs px-2 py-1 border border-white/20 text-white/50 hover:border-[#f95c05] hover:text-[#f95c05] transition-colors"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    + Add Image
                  </button>
                </div>

                {form.image_urls.length === 0 && (
                  <p className="text-white/20 text-xs py-2" style={{ fontFamily: "var(--font-barlow)" }}>
                    No images yet — click &quot;+ Add Image&quot;
                  </p>
                )}

                <div className="flex flex-col gap-3">
                  {form.image_urls.map((url, idx) => {
                    const fileInputId = `file-input-${idx}`;
                    return (
                      <div key={idx} className="flex gap-2 items-start">
                        {url && (
                          <div className="relative w-14 h-14 border border-white/10 overflow-hidden shrink-0">
                            <Image src={url} alt={`Image ${idx + 1}`} fill className="object-contain" sizes="56px" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col gap-1">
                          <input
                            className={inputCls}
                            value={url}
                            onChange={(e) => updateImageUrl(idx, e.target.value)}
                            placeholder={idx === 0 ? "Design / flat image URL" : "Lighter photo URL"}
                            style={{ fontFamily: "var(--font-barlow)" }}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              id={fileInputId}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, idx)}
                            />
                            <label
                              htmlFor={fileInputId}
                              className="text-xs px-2 py-1 border border-white/20 text-white/50 hover:border-[#f95c05] hover:text-[#f95c05] transition-colors cursor-pointer"
                              style={{ fontFamily: "var(--font-barlow-condensed)" }}
                            >
                              {uploadingIdx === idx ? "Uploading..." : "Upload"}
                            </label>
                            <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                              #{idx + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, -1)}
                            disabled={idx === 0}
                            className="text-white/30 hover:text-white disabled:opacity-10 transition-colors"
                            title="Move up"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M18 15l-6-6-6 6" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 1)}
                            disabled={idx === form.image_urls.length - 1}
                            className="text-white/30 hover:text-white disabled:opacity-10 transition-colors"
                            title="Move down"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="text-white/20 hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div className="border-t border-white/10 pt-4 mt-2">
              <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Sizes & Prices</label>
              <div className="flex flex-col gap-2">
                {form.sizes.map((s, idx) => (
                  <div key={s.size} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((f) => {
                        const sizes = [...f.sizes];
                        sizes[idx] = { ...sizes[idx], available: !sizes[idx].available };
                        return { ...f, sizes };
                      })}
                      className="w-20 py-1.5 text-xs font-black uppercase tracking-wider border transition-all shrink-0"
                      style={{
                        fontFamily: "var(--font-barlow-condensed)",
                        background: s.available ? "rgba(34,197,94,0.1)" : "transparent",
                        borderColor: s.available ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)",
                        color: s.available ? "#22c55e" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {s.label}
                    </button>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-white/30 text-xs" style={{ fontFamily: "var(--font-barlow-condensed)" }}>$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputCls}
                        value={s.price}
                        onChange={(e) => setForm((f) => {
                          const sizes = [...f.sizes];
                          sizes[idx] = { ...sizes[idx], price: parseFloat(e.target.value) || 0 };
                          return { ...f, sizes };
                        })}
                        style={{ fontFamily: "var(--font-barlow)" }}
                      />
                    </div>
                    <span className="text-white/20 text-[10px] uppercase tracking-widest w-16 text-right" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                      {s.available ? "on" : "off"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-white/10 mt-2">
              <span className="text-xs uppercase tracking-widest text-white/40" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                Availability
              </span>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, in_stock: !f.in_stock }))}
                className="flex items-center gap-2 px-3 py-1.5 border transition-all text-xs font-bold uppercase tracking-wider"
                style={{
                  fontFamily: "var(--font-barlow-condensed)",
                  background: form.in_stock ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  borderColor: form.in_stock ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)",
                  color: form.in_stock ? "#22c55e" : "#ef4444",
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: form.in_stock ? "#22c55e" : "#ef4444" }} />
                {form.in_stock ? "In Stock" : "Sold Out"}
              </button>
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
