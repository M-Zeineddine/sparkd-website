"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Order, OrderStatus } from "@/lib/types";

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

const emptyForm = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  building_details: "",
  item_description: "",
  quantity: 1,
  price_each: "5.00",
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
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const total = (Number(form.price_each) * form.quantity).toFixed(2);

  const submitManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.first_name || !form.phone || !form.address || !form.city || !form.item_description) {
      setFormError("Please fill in all required fields.");
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
          items: [
            {
              product_id: null,
              quantity: form.quantity,
              price: Number(form.price_each),
              product: { name: form.item_description, name_ar: form.item_description },
            },
          ],
          total: Number(total),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOrders((prev) => [data.order, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
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
            <span
              className="text-[#f95c05] text-sm font-bold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Orders
            </span>
            <Link
              href="/admin/products"
              className="text-white/50 hover:text-white text-sm uppercase tracking-wider transition-colors"
              style={{ fontFamily: "var(--font-barlow-condensed)" }}
            >
              Products
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
          <h2
            className="text-xl font-black text-white uppercase tracking-widest"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            All Orders ({orders.length})
          </h2>
          <button
            onClick={() => { setShowModal(true); setFormError(""); }}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest transition-all"
            style={{
              background: "#f95c05",
              color: "#fffdf9",
              fontFamily: "var(--font-barlow-condensed)",
            }}
          >
            + New Manual Order
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-white/30" style={{ fontFamily: "var(--font-barlow)" }}>
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full text-sm" style={{ background: "#111111" }}>
              <thead style={{ background: "#1a1a1a" }}>
                <tr>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Order #</th>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Date</th>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Customer</th>
                  <th className={th} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Phone</th>
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
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 font-bold text-[#f95c05] font-mono">
                        {order.order_number}
                        {src && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide font-bold" style={{ background: "rgba(249,92,5,0.15)", color: "#f95c05" }}>
                            {src}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-white/60 whitespace-nowrap" style={{ fontFamily: "var(--font-barlow)" }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-4 text-white whitespace-nowrap" style={{ fontFamily: "var(--font-barlow)" }}>
                        {order.first_name} {order.last_name}
                        <br />
                        <span className="text-white/40 text-xs">{order.email}</span>
                      </td>
                      <td className="px-4 py-4 text-white/70" style={{ fontFamily: "var(--font-barlow)" }}>
                        {order.phone}
                      </td>
                      <td className="px-4 py-4 text-white/70 whitespace-nowrap" style={{ fontFamily: "var(--font-barlow)" }}>
                        {order.city}
                        <br />
                        <span className="text-white/40 text-xs">{order.address}</span>
                      </td>
                      <td className="px-4 py-4 max-w-xs" style={{ fontFamily: "var(--font-barlow)" }}>
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="text-white/70 text-xs">
                            {item.product?.name} × {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-4 font-black text-white whitespace-nowrap" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
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
                            <option key={s} value={s} style={{ color: STATUS_COLORS[s] }}>
                              {STATUS_LABELS[s]}
                            </option>
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

      {/* Manual Order Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setForm(emptyForm); } }}
        >
          <div className="w-full max-w-xl border border-white/10" style={{ background: "#111111" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10" style={{ background: "#1a1a1a" }}>
              <h3
                className="text-lg font-black text-white uppercase tracking-widest"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                New Manual Order
              </h3>
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm); }}
                className="text-white/40 hover:text-white text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitManualOrder} className="p-6 flex flex-col gap-5">
              {/* Source */}
              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                  Source *
                </label>
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
                  <input
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm"
                    style={inputStyle}
                    placeholder="Ahmad"
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Last Name</label>
                  <input
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm"
                    style={inputStyle}
                    placeholder="Khalil"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Phone *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm"
                    style={inputStyle}
                    placeholder="+961 70 000 000"
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm"
                    style={inputStyle}
                    placeholder="optional"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Address *</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2 text-sm"
                    style={inputStyle}
                    placeholder="Street / Area"
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>City *</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 text-sm"
                    style={inputStyle}
                    placeholder="Beirut"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Building / Floor</label>
                <input
                  value={form.building_details}
                  onChange={(e) => setForm((f) => ({ ...f, building_details: e.target.value }))}
                  className="w-full px-3 py-2 text-sm"
                  style={inputStyle}
                  placeholder="optional"
                />
              </div>

              {/* Item */}
              <div className="border-t border-white/10 pt-5">
                <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Item Description *</label>
                <input
                  value={form.item_description}
                  onChange={(e) => setForm((f) => ({ ...f, item_description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm"
                  style={inputStyle}
                  placeholder='e.g. "Flames Collection - Red" or "Custom design"'
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: Math.max(1, Number(e.target.value)) }))}
                    className="w-full px-3 py-2 text-sm"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Price Each ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price_each}
                    onChange={(e) => setForm((f) => ({ ...f, price_each: e.target.value }))}
                    className="w-full px-3 py-2 text-sm"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: "var(--font-barlow-condensed)" }}>Total</label>
                  <div
                    className="w-full px-3 py-2 text-sm font-black"
                    style={{ ...inputStyle, color: "#f95c05", background: "transparent", border: "1px solid rgba(249,92,5,0.2)" }}
                  >
                    ${total}
                  </div>
                </div>
              </div>

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
                <p className="text-red-400 text-xs" style={{ fontFamily: "var(--font-barlow)" }}>
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(emptyForm); }}
                  className="flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all"
                  style={{
                    fontFamily: "var(--font-barlow-condensed)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  style={{
                    fontFamily: "var(--font-barlow-condensed)",
                    background: submitting ? "#333" : "#f95c05",
                    color: "#fffdf9",
                  }}
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
