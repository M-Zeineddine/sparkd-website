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

export default function AdminAnalytics() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  const nonCancelled = orders.filter((o) => o.status !== "cancelled");
  const delivered = orders.filter((o) => o.status === "delivered");
  const totalRevenue = nonCancelled.reduce((s, o) => s + Number(o.total), 0);
  const collectedRevenue = delivered.reduce((s, o) => s + Number(o.total), 0);
  const avgOrder = nonCancelled.length ? totalRevenue / nonCancelled.length : 0;

  const productTally: Record<string, { name: string; qty: number }> = {};
  const sizeTally: Record<string, number> = { S: 0, M: 0, L: 0 };
  const cityTally: Record<string, number> = {};
  const statusTally: Record<OrderStatus, number> = { pending: 0, confirmed: 0, delivered: 0, cancelled: 0 };

  orders.forEach((order) => {
    statusTally[order.status] = (statusTally[order.status] || 0) + 1;
    const city = order.city?.trim() || "Unknown";
    cityTally[city] = (cityTally[city] || 0) + 1;
    (order.items || []).forEach((item) => {
      const name = item.product?.name || "Custom";
      if (!productTally[name]) productTally[name] = { name, qty: 0 };
      productTally[name].qty += item.quantity;
      if (item.size?.size) sizeTally[item.size.size] = (sizeTally[item.size.size] || 0) + item.quantity;
    });
  });

  const topProducts = Object.values(productTally).sort((a, b) => b.qty - a.qty).slice(0, 10);
  const topCities = Object.entries(cityTally).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const totalSizes = Object.values(sizeTally).reduce((s, n) => s + n, 0);
  const maxProductQty = topProducts[0]?.qty || 1;

  const navLink = "text-white/50 hover:text-white text-sm uppercase tracking-wider transition-colors";
  const activeLink = "text-[#f95c05] text-sm font-bold uppercase tracking-wider";

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10" style={{ background: "#111111" }}>
        <div className="flex items-center gap-6">
          <span className="text-white font-black text-xl uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Spark&apos;d Admin
          </span>
          <nav className="flex gap-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            <Link href="/admin/dashboard" className={navLink}>Orders</Link>
            <Link href="/admin/products" className={navLink}>Products</Link>
            <Link href="/admin/categories" className={navLink}>Categories</Link>
            <span className={activeLink}>Analytics</span>
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
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-8 h-8 border-2 border-[#f95c05] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-40 text-white/30" style={{ fontFamily: "var(--font-barlow)" }}>No orders yet</div>
        ) : (
          <>
            {/* Revenue */}
            <p className="text-xs uppercase tracking-widest text-white/30 mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Revenue</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, sub: "excl. cancelled" },
                { label: "Collected", value: `$${collectedRevenue.toFixed(2)}`, sub: "delivered orders only" },
                { label: "Avg Order", value: `$${avgOrder.toFixed(2)}`, sub: "per active order" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="p-5 border border-white/10" style={{ background: "#111111" }}>
                  <p className="text-xs uppercase tracking-widest mb-2 text-white/40" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{label}</p>
                  <p className="text-4xl font-black" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>{value}</p>
                  <p className="text-xs text-white/30 mt-1" style={{ fontFamily: "var(--font-barlow)" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Order status */}
            <p className="text-xs uppercase tracking-widest text-white/30 mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Order Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {(["pending", "confirmed", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                <div key={s} className="p-5 border border-white/10" style={{ background: "#111111" }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-barlow-condensed)", color: STATUS_COLORS[s] }}>{s}</p>
                  <p className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{statusTally[s]}</p>
                  <p className="text-xs text-white/30 mt-1" style={{ fontFamily: "var(--font-barlow)" }}>
                    {orders.length ? Math.round((statusTally[s] / orders.length) * 100) : 0}% of total
                  </p>
                </div>
              ))}
            </div>

            {/* Top designs + sizes */}
            <p className="text-xs uppercase tracking-widest text-white/30 mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Products</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Best-selling designs */}
              <div className="sm:col-span-2 p-5 border border-white/10" style={{ background: "#111111" }}>
                <p className="text-xs uppercase tracking-widest mb-4 text-white/40" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Top Designs</p>
                <div className="flex flex-col gap-3">
                  {topProducts.map(({ name, qty }, i) => {
                    const pct = Math.round((qty / maxProductQty) * 100);
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-white/20 text-xs w-5 shrink-0" style={{ fontFamily: "var(--font-barlow-condensed)" }}>#{i + 1}</span>
                            <span className="text-white text-sm truncate" style={{ fontFamily: "var(--font-barlow)" }}>{name}</span>
                          </div>
                          <span className="text-[#f95c05] font-black text-sm shrink-0 ml-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{qty}×</span>
                        </div>
                        <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-1 transition-all" style={{ width: `${pct}%`, background: "#f95c05" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Size breakdown */}
              <div className="p-5 border border-white/10" style={{ background: "#111111" }}>
                <p className="text-xs uppercase tracking-widest mb-4 text-white/40" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Size Breakdown</p>
                {totalSizes === 0 ? (
                  <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-barlow)" }}>No size data yet</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {(["S", "M", "L"] as const).map((s) => {
                      const count = sizeTally[s] || 0;
                      const pct = totalSizes ? Math.round((count / totalSizes) * 100) : 0;
                      return (
                        <div key={s}>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-white/70 text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                              {s === "S" ? "Small" : s === "M" ? "Medium" : "Large"}
                            </span>
                            <span className="text-white/50 text-xs" style={{ fontFamily: "var(--font-barlow)" }}>{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 w-full rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: "#f95c05" }} />
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-white/20 text-xs mt-2" style={{ fontFamily: "var(--font-barlow)" }}>{totalSizes} total units</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cities */}
            <p className="text-xs uppercase tracking-widest text-white/30 mb-3" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Geography</p>
            <div className="p-5 border border-white/10 mb-8" style={{ background: "#111111" }}>
              <p className="text-xs uppercase tracking-widest mb-4 text-white/40" style={{ fontFamily: "var(--font-barlow-condensed)" }}>Top Cities</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topCities.map(([city, count], i) => {
                  const pct = Math.round((count / (topCities[0]?.[1] || 1)) * 100);
                  return (
                    <div key={city}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white/20 text-xs w-5" style={{ fontFamily: "var(--font-barlow-condensed)" }}>#{i + 1}</span>
                          <span className="text-white text-sm" style={{ fontFamily: "var(--font-barlow)" }}>{city}</span>
                        </div>
                        <span className="text-white/50 text-sm" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{count} orders</span>
                      </div>
                      <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-1" style={{ width: `${pct}%`, background: "#f95c05" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
