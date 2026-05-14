"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Order, OrderStatus, Product } from "@/lib/types";
import { LEBANESE_CITIES, BUNDLE_QTY, BUNDLE_PRICE, BUNDLE_SIZE, DEFAULT_SIZES } from "@/lib/constants";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const SOURCES = ["WhatsApp", "Instagram", "In Person", "Other"] as const;
type Source = (typeof SOURCES)[number];

const CUSTOM_ID = "__custom__";

type OrderLineItem = {
  product_id: string | null;
  name: string;
  name_ar: string;
  image_url: string;
  quantity: number;
  price: number;
};

const emptyForm = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  building_details: "",
  source: "WhatsApp" as Source,
  notes: "",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Multi-item order state
  const [orderItems, setOrderItems] = useState<OrderLineItem[]>([]);
  const [addCat, setAddCat] = useState("");
  const [addProductId, setAddProductId] = useState("");
  const [addCustomDesc, setAddCustomDesc] = useState("");
  const [addQty, setAddQty] = useState(1);
  const [addPrice, setAddPrice] = useState("4.00");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/api/orders", { headers: { "x-admin": "true" } })
      .then((r) => {
        if (r.status === 401) { router.push("/admin"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, [router]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin": "true" },
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      setSelectedOrder((prev) => (prev?.id === id ? { ...prev, status } : prev));
    } finally {
      setUpdatingId(null);
    }
  };

  // Bundle auto-calculation from order items
  const largePrice = DEFAULT_SIZES.find((s) => s.size === BUNDLE_SIZE)?.price ?? 4;
  const largeQty = orderItems
    .filter((i) => i.price >= largePrice)
    .reduce((s, i) => s + i.quantity, 0);
  const bundleCount = Math.floor(largeQty / BUNDLE_QTY);
  const bundleSavings = bundleCount * (BUNDLE_QTY * largePrice - BUNDLE_PRICE);
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - bundleSavings);

  const openModal = () => {
    setShowModal(true);
    setFormError("");
    if (products.length === 0) {
      setProductsLoading(true);
      fetch("/api/products")
        .then((r) => r.json())
        .then((d) => setProducts(d.products || []))
        .finally(() => setProductsLoading(false));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setOrderItems([]);
    setAddCat("");
    setAddProductId("");
    setAddCustomDesc("");
    setAddQty(1);
    setAddPrice("4.00");
  };

  const handleAddItem = () => {
    if (!addProductId) return;
    const isCustom = addProductId === CUSTOM_ID;
    if (isCustom && !addCustomDesc.trim()) return;
    const p = products.find((x) => x.id === addProductId);
    const name = isCustom ? addCustomDesc.trim() : (p?.name ?? "");
    const name_ar = isCustom ? addCustomDesc.trim() : (p?.name_ar ?? name);
    const image_url = isCustom ? "" : (p?.image_urls?.[0] || p?.image_url || "");
    setOrderItems((prev) => [...prev, {
      product_id: isCustom ? null : addProductId,
      name,
      name_ar,
      image_url,
      quantity: addQty,
      price: Number(addPrice),
    }]);
    setAddProductId("");
    setAddCustomDesc("");
    setAddQty(1);
    setAddPrice("4.00");
  };

  const submitManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.first_name || !form.phone || !form.address || !form.city) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (orderItems.length === 0) {
      setFormError("Add at least one item to the order.");
      return;
    }
    setSubmitting(true);
    try {
      const notes = [form.source ? `[${form.source}]` : "", form.notes].filter(Boolean).join(" ");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          email: form.email || "",
          address: form.address,
          city: form.city,
          building_details: form.building_details,
          notes,
          items: orderItems.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
            product: { name: i.name, name_ar: i.name_ar, image_url: i.image_url },
          })),
          total,
          bundle_count: bundleCount,
          bundle_savings: bundleSavings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOrders((prev) => [data.order, ...prev]);
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const th = "text-xs uppercase tracking-widest text-white/50 px-4 py-3 text-left whitespace-nowrap";

  const inputStyle = {
    background: "#0a0a0a",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fffdf9",
    fontFamily: "var(--font-barlow)",
    outline: "none",
  };

  const labelClass = "text-xs uppercase tracking-widest text-white/50 mb-1 block";

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
            <span className="text-[#f95c05] text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Orders
            </span>
            <Link href="/admin/products" className="text-white/50 hover:text-white text-sm uppercase tracking-wider transition-colors" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Products
            </Link>
            <Link href="/admin/categories" className="text-white/50 hover:text-white text-sm uppercase tracking-wider transition-colors" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Categories
            </Link>
            <Link href="/admin/analytics" className="text-white/50 hover:text-white text-sm uppercase tracking-wider transition-colors" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              Analytics
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
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {(["pending", "confirmed", "delivered", "cancelled"] as OrderStatus[]).map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            return (
              <div key={s} className="p-4 border border-white/10" style={{ background: "#111111" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-barlow-condensed)", color: STATUS_COLORS[s] }}>
                  {STATUS_LABELS[s]}
                </p>
                <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            All Orders ({orders.length})
          </h2>
          <button
            onClick={openModal}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest"
            style={{ background: "#f95c05", color: "#fffdf9", fontFamily: "var(--font-barlow-condensed)" }}
          >
            + New Manual Order
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-white/30" style={{ fontFamily: "var(--font-barlow)" }}>No orders yet</div>
        ) : (
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full text-sm" style={{ background: "#111111" }}>
              <thead style={{ background: "#1a1a1a" }}>
                <tr>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Order #</th>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Date</th>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Customer</th>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>City</th>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Items</th>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Total</th>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => {
                  const srcMatch = order.notes?.match(/^\[([^\]]+)\]/);
                  const src = srcMatch ? srcMatch[1] : null;
                  const itemCount = (order.items || []).reduce((s, i) => s + i.quantity, 0);
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer transition-colors"
                      style={{ background: isSelected ? "rgba(249,92,5,0.08)" : undefined }}
                      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isSelected ? "rgba(249,92,5,0.08)" : ""; }}
                    >
                      <td className="px-4 py-4 font-bold text-[#f95c05] font-mono whitespace-nowrap">
                        {order.order_number}
                        {src && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 uppercase tracking-wide font-bold" style={{ background: "rgba(249,92,5,0.15)", color: "#f95c05" }}>
                            {src}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-white/60 whitespace-nowrap" style={{ fontFamily: "var(--font-barlow)" }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ fontFamily: "var(--font-barlow)" }}>
                        <span className="text-white">{order.first_name} {order.last_name}</span>
                        <br />
                        <span className="text-white/40 text-xs">{order.phone}</span>
                      </td>
                      <td className="px-4 py-4 text-white/70 whitespace-nowrap" style={{ fontFamily: "var(--font-barlow)" }}>
                        {order.city}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ fontFamily: "var(--font-barlow)" }}>
                        <span className="text-white/70 text-sm">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                        {(order.bundle_count ?? 0) > 0 && (
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5" style={{ background: "rgba(249,92,5,0.15)", color: "#f95c05" }}>
                            🔥 bundle
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-black text-white whitespace-nowrap" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                          className="text-xs font-bold uppercase tracking-wide px-2 py-1.5 cursor-pointer disabled:opacity-50"
                          style={{
                            background: "#1a1a1a",
                            color: STATUS_COLORS[order.status],
                            border: `1px solid ${STATUS_COLORS[order.status]}40`,
                            fontFamily: "var(--font-barlow-condensed)",
                            outline: "none",
                          }}
                        >
                          {(["pending", "confirmed", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                            <option key={s} value={s} style={{ color: STATUS_COLORS[s] }}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] z-50 flex flex-col overflow-hidden"
            style={{ background: "#111111", borderLeft: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0" style={{ background: "#1a1a1a" }}>
              <div>
                <span className="text-[#f95c05] font-black font-mono text-base">{selectedOrder.order_number}</span>
                {(() => {
                  const m = selectedOrder.notes?.match(/^\[([^\]]+)\]/);
                  return m ? (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wide" style={{ background: "rgba(249,92,5,0.15)", color: "#f95c05" }}>
                      {m[1]}
                    </span>
                  ) : null;
                })()}
                <p className="text-white/40 text-xs mt-0.5" style={{ fontFamily: "var(--font-barlow)" }}>
                  {formatDateTime(selectedOrder.created_at)}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors text-xl leading-none">
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Status */}
              <div className="px-6 py-5 border-b border-white/10">
                <p className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Status</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(["pending", "confirmed", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                    <button
                      key={s}
                      disabled={updatingId === selectedOrder.id}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className="px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40"
                      style={{
                        fontFamily: "var(--font-barlow-condensed)",
                        background: selectedOrder.status === s ? STATUS_COLORS[s] : "transparent",
                        color: selectedOrder.status === s ? "#fff" : STATUS_COLORS[s],
                        border: `1px solid ${STATUS_COLORS[s]}`,
                      }}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div className="px-6 py-5 border-b border-white/10">
                <p className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Customer</p>
                <div className="mt-2 flex flex-col gap-1.5" style={{ fontFamily: "var(--font-barlow)" }}>
                  <p className="text-white font-bold">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p className="text-white/70 text-sm">{selectedOrder.phone}</p>
                  {selectedOrder.email && <p className="text-white/50 text-sm">{selectedOrder.email}</p>}
                  <p className="text-white/70 text-sm mt-1">
                    {selectedOrder.address}{selectedOrder.building_details ? `, ${selectedOrder.building_details}` : ""}
                  </p>
                  <p className="text-white/50 text-sm">{selectedOrder.city}</p>
                </div>
              </div>

              {/* Items */}
              <div className="px-6 py-5 border-b border-white/10">
                <p className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  Items ({(selectedOrder.items || []).reduce((s, i) => s + i.quantity, 0)})
                </p>
                <ul className="mt-3 flex flex-col gap-3">
                  {(selectedOrder.items || []).map((item, i) => {
                    const imgSrc = item.product?.image_url;
                    return (
                      <li key={i} className="flex items-center gap-3">
                        <div
                          className="relative shrink-0 overflow-hidden"
                          style={{ width: 44, height: 44, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                          {imgSrc ? (
                            <Image src={imgSrc} alt={item.product?.name || ""} fill className="object-contain" sizes="44px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-lg">✦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0" style={{ fontFamily: "var(--font-barlow)" }}>
                          <p className="text-white text-sm font-bold leading-tight truncate">{item.product?.name || "Custom item"}</p>
                          <p className="text-white/40 text-xs mt-0.5">${Number(item.price).toFixed(2)} × {item.quantity}</p>
                        </div>
                        <span className="text-white font-black text-sm shrink-0" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Total */}
              <div className="px-6 py-5 border-b border-white/10">
                {(selectedOrder.bundle_count ?? 0) > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                      🔥 {selectedOrder.bundle_count}× Bundle Deal
                    </span>
                    <span className="text-sm font-bold" style={{ color: "#f95c05" }}>
                      −${Number(selectedOrder.bundle_savings).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs uppercase tracking-widest font-bold" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Total</span>
                  <span className="text-xl font-black" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                    ${Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="px-6 py-5">
                  <p className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Notes</p>
                  <p className="text-white/60 text-sm mt-1" style={{ fontFamily: "var(--font-barlow)" }}>
                    {selectedOrder.notes.replace(/^\[[^\]]+\]\s*/, "")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Manual Order Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-xl border border-white/10" style={{ background: "#111111" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10" style={{ background: "#1a1a1a" }}>
              <h3 className="text-lg font-black text-white uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                New Manual Order
              </h3>
              <button onClick={closeModal} className="text-white/40 hover:text-white text-xl leading-none transition-colors">×</button>
            </div>

            <form onSubmit={submitManualOrder} className="p-6 flex flex-col gap-5">
              {/* Source */}
              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Source *</label>
                <div className="flex gap-2 flex-wrap">
                  {SOURCES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, source: s }))}
                      className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
                      style={{
                        fontFamily: "var(--font-barlow-condensed)",
                        background: form.source === s ? "#f95c05" : "#1a1a1a",
                        color: form.source === s ? "#fffdf9" : "rgba(255,255,255,0.5)",
                        border: `1px solid ${form.source === s ? "#f95c05" : "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>First Name *</label>
                  <input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className="w-full px-3 py-2 text-sm" style={inputStyle} placeholder="Ahmad" />
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Last Name</label>
                  <input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className="w-full px-3 py-2 text-sm" style={inputStyle} placeholder="Khalil" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Phone *</label>
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 text-sm" style={inputStyle} placeholder="+961 70 000 000" />
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 text-sm" style={inputStyle} placeholder="optional" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Address *</label>
                  <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2 text-sm" style={inputStyle} placeholder="Street / Area" />
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>City *</label>
                  <select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2 text-sm" style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="" disabled>— Select city —</option>
                    {LEBANESE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Building / Floor</label>
                <input value={form.building_details} onChange={(e) => setForm((f) => ({ ...f, building_details: e.target.value }))} className="w-full px-3 py-2 text-sm" style={inputStyle} placeholder="optional" />
              </div>

              {/* ── Items ── */}
              <div className="border-t border-white/10 pt-5 flex flex-col gap-3">
                <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  Items {orderItems.length > 0 && `(${orderItems.length})`}
                </label>

                {/* Added items list */}
                {orderItems.length > 0 && (
                  <ul className="flex flex-col gap-1.5">
                    {orderItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 px-3 py-2.5"
                        style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}
                      >
                        <div style={{ fontFamily: "var(--font-barlow)" }}>
                          <p className="text-white text-sm font-bold leading-tight">{item.name}</p>
                          <p className="text-white/40 text-xs mt-0.5">
                            ${item.price.toFixed(2)} × {item.quantity} = <span style={{ color: "#f95c05" }}>${(item.price * item.quantity).toFixed(2)}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOrderItems((prev) => prev.filter((_, j) => j !== i))}
                          className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add item panel */}
                <div className="flex flex-col gap-2 p-3" style={{ background: "#0d0d0d", border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <p className="text-[10px] uppercase tracking-widest text-white/30" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    Add item
                  </p>
                  {productsLoading ? (
                    <div className="flex items-center gap-2 py-1 text-white/40 text-sm" style={{ fontFamily: "var(--font-barlow)" }}>
                      <div className="w-4 h-4 border border-[#f95c05] border-t-transparent rounded-full animate-spin" />
                      Loading products...
                    </div>
                  ) : (
                    <>
                      <select
                        value={addCat}
                        onChange={(e) => { setAddCat(e.target.value); setAddProductId(""); }}
                        className="w-full px-3 py-2 text-sm"
                        style={{ ...inputStyle, cursor: "pointer" }}
                      >
                        <option value="" disabled>— Category —</option>
                        {[...new Set(products.map((p) => p.category))].sort().map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {addCat && (
                        <select
                          value={addProductId}
                          onChange={(e) => {
                            const id = e.target.value;
                            setAddProductId(id);
                            if (id !== CUSTOM_ID) {
                              const p = products.find((x) => x.id === id);
                              if (p) setAddPrice(String(p.price));
                            }
                          }}
                          className="w-full px-3 py-2 text-sm"
                          style={{ ...inputStyle, cursor: "pointer" }}
                        >
                          <option value="" disabled>— Product —</option>
                          {products.filter((p) => p.category === addCat).map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                          <option value={CUSTOM_ID}>✏ Custom item</option>
                        </select>
                      )}
                      {addProductId === CUSTOM_ID && (
                        <input
                          value={addCustomDesc}
                          onChange={(e) => setAddCustomDesc(e.target.value)}
                          placeholder='e.g. "Custom cedar tree design"'
                          className="w-full px-3 py-2 text-sm"
                          style={inputStyle}
                        />
                      )}
                      <div className="flex gap-2 items-end">
                        <div className="w-20">
                          <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Qty</label>
                          <input
                            type="number"
                            min={1}
                            value={addQty}
                            onChange={(e) => setAddQty(Math.max(1, Number(e.target.value)))}
                            className="w-full px-3 py-2 text-sm"
                            style={inputStyle}
                          />
                        </div>
                        <div className="flex-1">
                          <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Price ($)</label>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={addPrice}
                            onChange={(e) => setAddPrice(e.target.value)}
                            className="w-full px-3 py-2 text-sm"
                            style={inputStyle}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddItem}
                          disabled={!addProductId || (addProductId === CUSTOM_ID && !addCustomDesc.trim())}
                          className="px-4 py-2 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30"
                          style={{
                            fontFamily: "var(--font-barlow-condensed)",
                            background: "#f95c05",
                            color: "#fffdf9",
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Running total */}
                {orderItems.length > 0 && (
                  <div className="flex flex-col gap-1 px-3 py-2.5" style={{ background: "#0d0d0d", border: "1px solid rgba(249,92,5,0.2)" }}>
                    {bundleSavings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                          🔥 {bundleCount}× Bundle Deal
                        </span>
                        <span className="text-xs font-bold" style={{ color: "#f95c05" }}>−${bundleSavings.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-white/40" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Total</span>
                      <span className="font-black text-base" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 text-sm resize-none"
                  style={inputStyle}
                  placeholder="Any additional notes..."
                />
              </div>

              {formError && (
                <p className="text-red-400 text-xs" style={{ fontFamily: "var(--font-barlow)" }}>{formError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all"
                  style={{ fontFamily: "var(--font-barlow-condensed)", background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  style={{ fontFamily: "var(--font-barlow-condensed)", background: submitting ? "#333" : "#f95c05", color: "#fffdf9" }}
                >
                  {submitting ? "Saving..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
