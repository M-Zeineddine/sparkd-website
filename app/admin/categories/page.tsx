"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CategoryRecord, SubcategoryRecord } from "@/lib/types";

const inputCls =
  "w-full px-3 py-2.5 text-sm text-white border border-white/10 bg-[#0a0a0a] focus:border-[#f95c05] outline-none";
const labelCls =
  "text-xs uppercase tracking-widest text-white/40 block mb-1.5";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface CategoryForm {
  name: string;
  name_ar: string;
  slug: string;
  sort_order: string;
}

interface SubcategoryForm {
  name: string;
  name_ar: string;
  slug: string;
  sort_order: string;
  category_id: string;
}

function CategoryModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial?: CategoryForm;
  onSave: (f: CategoryForm) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CategoryForm>(
    initial ?? { name: "", name_ar: "", slug: "", sort_order: "0" }
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="w-full max-w-md border border-white/10 p-6"
        style={{ background: "#111111" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-lg font-black text-white uppercase tracking-widest"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {initial ? "Edit Category" : "Add Category"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Name (EN) *
            </label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: f.slug === slugify(f.name) || !f.slug ? slugify(name) : f.slug,
                }));
              }}
              style={{ fontFamily: "var(--font-barlow)" }}
            />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Name (AR)
            </label>
            <input
              className={inputCls}
              value={form.name_ar}
              onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
              dir="rtl"
              style={{ fontFamily: "var(--font-cairo)" }}
            />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Slug
            </label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              style={{ fontFamily: "var(--font-barlow)" }}
            />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Sort Order
            </label>
            <input
              type="number"
              className={inputCls}
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              style={{ fontFamily: "var(--font-barlow)" }}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name}
            className="flex-1 py-3 text-sm font-black uppercase tracking-widest"
            style={{
              background: saving || !form.name ? "#333" : "#f95c05",
              color: "#fffdf9",
              fontFamily: "var(--font-barlow-condensed)",
              cursor: saving || !form.name ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold uppercase border border-white/20 text-white/60 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SubcategoryModal({
  initial,
  categoryId,
  onSave,
  onClose,
  saving,
}: {
  initial?: SubcategoryForm;
  categoryId: string;
  onSave: (f: SubcategoryForm) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<SubcategoryForm>(
    initial ?? { name: "", name_ar: "", slug: "", sort_order: "0", category_id: categoryId }
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="w-full max-w-md border border-white/10 p-6"
        style={{ background: "#111111" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-lg font-black text-white uppercase tracking-widest"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            {initial ? "Edit Subcategory" : "Add Subcategory"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Name (EN) *
            </label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: f.slug === slugify(f.name) || !f.slug ? slugify(name) : f.slug,
                }));
              }}
              style={{ fontFamily: "var(--font-barlow)" }}
            />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Name (AR)
            </label>
            <input
              className={inputCls}
              value={form.name_ar}
              onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
              dir="rtl"
              style={{ fontFamily: "var(--font-cairo)" }}
            />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Slug
            </label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              style={{ fontFamily: "var(--font-barlow)" }}
            />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Sort Order
            </label>
            <input
              type="number"
              className={inputCls}
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              style={{ fontFamily: "var(--font-barlow)" }}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name}
            className="flex-1 py-3 text-sm font-black uppercase tracking-widest"
            style={{
              background: saving || !form.name ? "#333" : "#f95c05",
              color: "#fffdf9",
              fontFamily: "var(--font-barlow-condensed)",
              cursor: saving || !form.name ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold uppercase border border-white/20 text-white/60 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Category modal state
  const [catModal, setCatModal] = useState<{
    open: boolean;
    editing: CategoryRecord | null;
  }>({ open: false, editing: null });

  // Subcategory modal state
  const [subModal, setSubModal] = useState<{
    open: boolean;
    categoryId: string;
    editing: SubcategoryRecord | null;
  }>({ open: false, categoryId: "", editing: null });

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "category" | "subcategory";
    id: string;
  } | null>(null);

  const adminHeaders = {
    "Content-Type": "application/json",
    "x-admin": "true",
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  // ── Category CRUD ─────────────────────────────────────────────────────────

  const saveCategory = async (form: {
    name: string;
    name_ar: string;
    slug: string;
    sort_order: string;
  }) => {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        name_ar: form.name_ar,
        slug: form.slug || slugify(form.name),
        sort_order: parseInt(form.sort_order) || 0,
      };

      if (catModal.editing) {
        const res = await fetch(`/api/admin/categories/${catModal.editing.id}`, {
          method: "PUT",
          headers: adminHeaders,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setCategories((prev) =>
          prev.map((c) =>
            c.id === catModal.editing!.id
              ? { ...data.category, subcategories: c.subcategories }
              : c
          )
        );
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setCategories((prev) =>
          [...prev, data.category].sort((a, b) => a.sort_order - b.sort_order)
        );
      }
      setCatModal({ open: false, editing: null });
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ── Subcategory CRUD ──────────────────────────────────────────────────────

  const saveSubcategory = async (form: {
    name: string;
    name_ar: string;
    slug: string;
    sort_order: string;
    category_id: string;
  }) => {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        name_ar: form.name_ar,
        slug: form.slug || slugify(form.name),
        sort_order: parseInt(form.sort_order) || 0,
        category_id: form.category_id,
      };

      if (subModal.editing) {
        const res = await fetch(`/api/admin/subcategories/${subModal.editing.id}`, {
          method: "PUT",
          headers: adminHeaders,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setCategories((prev) =>
          prev.map((c) =>
            c.id === form.category_id
              ? {
                  ...c,
                  subcategories: c.subcategories.map((s) =>
                    s.id === subModal.editing!.id ? data.subcategory : s
                  ),
                }
              : c
          )
        );
      } else {
        const res = await fetch("/api/admin/subcategories", {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setCategories((prev) =>
          prev.map((c) =>
            c.id === form.category_id
              ? {
                  ...c,
                  subcategories: [...c.subcategories, data.subcategory].sort(
                    (a, b) => a.sort_order - b.sort_order
                  ),
                }
              : c
          )
        );
      }
      setSubModal({ open: false, categoryId: "", editing: null });
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteSubcategory = async (id: string, categoryId: string) => {
    try {
      await fetch(`/api/admin/subcategories/${id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== id) }
            : c
        )
      );
    } catch {
      alert("Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

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
            <Link
              href="/admin/products"
              className="text-white/50 hover:text-white text-sm uppercase tracking-wider transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Products
            </Link>
            <span
              className="text-[#f95c05] text-sm font-bold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Categories
            </span>
          </nav>
        </div>
        <button
          onClick={() => {
            document.cookie = "admin_session=; max-age=0; path=/";
            router.push("/admin");
          }}
          className="text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          Logout
        </button>
      </div>

      <div className="px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-black text-white uppercase tracking-widest"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Categories ({categories.length})
          </h2>
          <button
            onClick={() => setCatModal({ open: true, editing: null })}
            className="px-5 py-2 text-sm font-black uppercase tracking-widest"
            style={{
              background: "#f95c05",
              color: "#fffdf9",
              fontFamily: "var(--font-barlow-condensed)",
            }}
          >
            + Add Category
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="border border-white/10 overflow-hidden"
                style={{ background: "#111111" }}
              >
                {/* Category row */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div>
                    <span
                      className="text-white font-bold text-sm uppercase tracking-wide"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      {cat.name}
                    </span>
                    {cat.name_ar && (
                      <span
                        className="text-white/40 text-sm ml-3"
                        style={{ fontFamily: "var(--font-cairo)" }}
                        dir="rtl"
                      >
                        {cat.name_ar}
                      </span>
                    )}
                    <span className="text-white/20 text-xs ml-3 font-mono">
                      /{cat.slug}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCatModal({ open: true, editing: cat })}
                      className="px-3 py-1 text-xs font-bold uppercase border border-white/20 text-white hover:border-[#f95c05] hover:text-[#f95c05] transition-colors"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({ type: "category", id: cat.id })
                      }
                      className="px-3 py-1 text-xs font-bold uppercase border border-white/20 text-white/40 hover:border-red-500 hover:text-red-400 transition-colors"
                      style={{ fontFamily: "var(--font-barlow-condensed)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="px-4 py-2 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-3 pl-3">
                        <span className="text-white/20 text-xs">└</span>
                        <span
                          className="text-white/70 text-sm"
                          style={{ fontFamily: "var(--font-barlow)" }}
                        >
                          {sub.name}
                        </span>
                        {sub.name_ar && (
                          <span
                            className="text-white/30 text-xs"
                            style={{ fontFamily: "var(--font-cairo)" }}
                            dir="rtl"
                          >
                            {sub.name_ar}
                          </span>
                        )}
                        <span className="text-white/15 text-xs font-mono">
                          {sub.slug}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setSubModal({
                              open: true,
                              categoryId: cat.id,
                              editing: sub,
                            })
                          }
                          className="px-2 py-0.5 text-xs font-bold uppercase border border-white/10 text-white/50 hover:border-[#f95c05] hover:text-[#f95c05] transition-colors"
                          style={{ fontFamily: "var(--font-barlow-condensed)" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ type: "subcategory", id: sub.id })
                          }
                          className="px-2 py-0.5 text-xs font-bold uppercase border border-white/10 text-white/30 hover:border-red-500 hover:text-red-400 transition-colors"
                          style={{ fontFamily: "var(--font-barlow-condensed)" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add subcategory */}
                  <button
                    onClick={() =>
                      setSubModal({
                        open: true,
                        categoryId: cat.id,
                        editing: null,
                      })
                    }
                    className="w-full text-left py-1.5 pl-6 text-xs text-white/25 hover:text-[#f95c05] transition-colors uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-barlow-condensed)" }}
                  >
                    + Add Subcategory
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category modal */}
      {catModal.open && (
        <CategoryModal
          initial={
            catModal.editing
              ? {
                  name: catModal.editing.name,
                  name_ar: catModal.editing.name_ar || "",
                  slug: catModal.editing.slug,
                  sort_order: String(catModal.editing.sort_order),
                }
              : undefined
          }
          onSave={saveCategory}
          onClose={() => setCatModal({ open: false, editing: null })}
          saving={saving}
        />
      )}

      {/* Subcategory modal */}
      {subModal.open && (
        <SubcategoryModal
          initial={
            subModal.editing
              ? {
                  name: subModal.editing.name,
                  name_ar: subModal.editing.name_ar || "",
                  slug: subModal.editing.slug,
                  sort_order: String(subModal.editing.sort_order),
                  category_id: subModal.categoryId,
                }
              : undefined
          }
          categoryId={subModal.categoryId}
          onSave={saveSubcategory}
          onClose={() => setSubModal({ open: false, categoryId: "", editing: null })}
          saving={saving}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div
            className="w-full max-w-sm border border-white/10 p-6 text-center"
            style={{ background: "#111111" }}
          >
            <p
              className="text-white text-base font-bold mb-2"
              style={{ fontFamily: "var(--font-barlow)" }}
            >
              Delete this {deleteConfirm.type}?
            </p>
            {deleteConfirm.type === "category" && (
              <p className="text-white/40 text-sm mb-6" style={{ fontFamily: "var(--font-barlow)" }}>
                All subcategories will also be deleted.
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  if (deleteConfirm.type === "category") {
                    deleteCategory(deleteConfirm.id);
                  } else {
                    const cat = categories.find((c) =>
                      c.subcategories.some((s) => s.id === deleteConfirm.id)
                    );
                    if (cat) deleteSubcategory(deleteConfirm.id, cat.id);
                  }
                }}
                className="flex-1 py-3 text-sm font-black uppercase"
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  fontFamily: "var(--font-barlow-condensed)",
                }}
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
