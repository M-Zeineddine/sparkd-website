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

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const th = "text-xs uppercase tracking-widest text-white/50 px-4 py-3 text-left whitespace-nowrap";

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

        <h2
          className="text-xl font-black text-white mb-4 uppercase tracking-widest"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          All Orders ({orders.length})
        </h2>

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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 font-bold text-[#f95c05] font-mono">
                      {order.order_number}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
