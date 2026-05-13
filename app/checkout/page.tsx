"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useCartStore } from "@/lib/store";
import { DEFAULT_SIZES, LEBANESE_CITIES } from "@/lib/constants";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  buildingDetails: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const { t, isRTL } = useLang();
  const router = useRouter();
  const { items, totalPrice, bundleInfo, clearCart } = useCartStore();
  const total = totalPrice();
  const { count: bundleCount, savings: bundleSavings } = bundleInfo();

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    buildingDetails: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const fontHeading = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow-condensed)",
    textTransform: isRTL ? "none" as const : "uppercase" as const,
    letterSpacing: isRTL ? "0" : "0.04em",
  };
  const fontBody = {
    fontFamily: isRTL ? "var(--font-cairo)" : "var(--font-barlow)",
  };

  const labelStyle = {
    ...fontHeading,
    fontSize: "0.7rem",
    letterSpacing: "0.1em",
    color: "#666",
  };

  const inputStyle = {
    ...fontBody,
    border: "2px solid #e5e3de",
    background: "#fff",
    padding: "0.75rem 1rem",
    fontSize: "0.9rem",
    width: "100%",
    color: "#111",
    outline: "none",
  };

  const validate = () => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = t("required");
    if (!form.lastName.trim()) e.lastName = t("required");
    if (!form.email.trim()) e.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("invalidEmail");
    if (!form.phone.trim()) e.phone = t("required");
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(form.phone)) e.phone = t("invalidPhone");
    if (!form.address.trim()) e.address = t("required");
    if (!form.city.trim()) e.city = t("required");
    if (!form.buildingDetails.trim()) e.buildingDetails = t("required");
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          building_details: form.buildingDetails,
          notes: form.notes,
          items,
          total,
          bundle_count: bundleCount,
          bundle_savings: bundleSavings,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      clearCart();
      router.push(`/order-confirmation?order=${data.order_number}`);
    } catch {
      setSubmitting(false);
      alert(t("error"));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center" style={{ background: "#fffdf9" }}>
        <span className="text-6xl">🛒</span>
        <h2 className="text-2xl font-black" style={{ ...fontHeading, color: "#111111" }}>
          {t("emptyCart")}
        </h2>
        <Link href="/shop">
          <button className="btn-primary px-10 py-3">{t("shopNow")}</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#fffdf9" }} className="min-h-screen">
      {/* Header */}
      <div className="py-10 px-4 border-b border-[#e5e3de]" style={{ background: "#111111" }}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-white" style={fontHeading}>
            {t("checkoutTitle")}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form Fields */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>{t("firstName")} *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => { setForm({ ...form, firstName: e.target.value }); setErrors({ ...errors, firstName: "" }); }}
                    style={{ ...inputStyle, borderColor: errors.firstName ? "#ef4444" : "#e5e3de" }}
                    placeholder={isRTL ? "محمد" : "John"}
                  />
                  {errors.firstName && <span className="text-red-500 text-xs" style={fontBody}>{errors.firstName}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>{t("lastName")} *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => { setForm({ ...form, lastName: e.target.value }); setErrors({ ...errors, lastName: "" }); }}
                    style={{ ...inputStyle, borderColor: errors.lastName ? "#ef4444" : "#e5e3de" }}
                    placeholder={isRTL ? "زيدان" : "Doe"}
                  />
                  {errors.lastName && <span className="text-red-500 text-xs" style={fontBody}>{errors.lastName}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>{t("email")} *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                  style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : "#e5e3de" }}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="text-red-500 text-xs" style={fontBody}>{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>{t("phone")} *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }}
                  style={{ ...inputStyle, borderColor: errors.phone ? "#ef4444" : "#e5e3de" }}
                  placeholder="+961 70 000 000"
                  dir="ltr"
                />
                {errors.phone && <span className="text-red-500 text-xs" style={fontBody}>{errors.phone}</span>}
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>{t("address")} *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => { setForm({ ...form, address: e.target.value }); setErrors({ ...errors, address: "" }); }}
                  style={{ ...inputStyle, borderColor: errors.address ? "#ef4444" : "#e5e3de" }}
                  placeholder={isRTL ? "الشارع والمنطقة" : "Street, District"}
                />
                {errors.address && <span className="text-red-500 text-xs" style={fontBody}>{errors.address}</span>}
              </div>

              {/* City + Building */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>{t("city")} *</label>
                  <select
                    value={form.city}
                    onChange={(e) => { setForm({ ...form, city: e.target.value }); setErrors({ ...errors, city: "" }); }}
                    style={{ ...inputStyle, borderColor: errors.city ? "#ef4444" : "#e5e3de", cursor: "pointer" }}
                  >
                    <option value="" disabled>{isRTL ? "اختر مدينة" : "Select a city"}</option>
                    {LEBANESE_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.city && <span className="text-red-500 text-xs" style={fontBody}>{errors.city}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>{t("buildingDetails")} *</label>
                  <input
                    type="text"
                    value={form.buildingDetails}
                    onChange={(e) => { setForm({ ...form, buildingDetails: e.target.value }); setErrors({ ...errors, buildingDetails: "" }); }}
                    style={{ ...inputStyle, borderColor: errors.buildingDetails ? "#ef4444" : "#e5e3de" }}
                    placeholder={isRTL ? "مبنى / طابق / شقة" : "Bldg / Floor / Apt"}
                  />
                  {errors.buildingDetails && <span className="text-red-500 text-xs" style={fontBody}>{errors.buildingDetails}</span>}
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>{t("notes")}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
                  placeholder={isRTL ? "أي ملاحظات إضافية؟" : "Any special instructions?"}
                />
              </div>

              {/* COD Notice */}
              <div
                className="flex items-center gap-3 p-4 border-2 border-[#f95c05]"
              >
                <span className="text-2xl">💵</span>
                <div style={fontBody}>
                  <span className="font-bold text-[#111] block">{t("cod")}</span>
                  <span className="text-sm text-[#666]">{t("codNote")}</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-[#e5e3de] p-5 sticky top-20">
                <h2
                  className="text-lg font-black mb-5 pb-4 border-b border-[#e5e3de]"
                  style={{ ...fontHeading, color: "#111111" }}
                >
                  {t("orderSummary")}
                </h2>

                <div className="flex flex-col gap-3 mb-4">
                  {items.map(({ cartKey, product, size, quantity }) => (
                    <div key={cartKey} className="flex gap-3 items-start">
                      <div className="relative w-14 h-14 shrink-0 bg-[#f0ede8] overflow-hidden">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#111] line-clamp-2" style={fontHeading}>
                          {product.name}
                        </p>
                        <p className="text-xs text-[#999] mt-0.5" style={fontBody}>× {quantity}</p>
                      </div>
                      <span className="text-sm font-bold shrink-0" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                        ${((DEFAULT_SIZES.find((s) => s.size === size.size)?.price ?? size.price) * quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {bundleCount > 0 && (
                  <div
                    className="flex items-center justify-between px-3 py-2 mb-3"
                    style={{ background: "rgba(249,92,5,0.08)", border: "1px solid rgba(249,92,5,0.3)" }}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                      🔥 {bundleCount}× Bundle Deal
                    </span>
                    <span className="text-xs font-bold" style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}>
                      −${bundleSavings.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-[#e5e3de] pt-4 flex justify-between items-center mb-5">
                  <span className="font-black" style={fontHeading}>{t("total")}</span>
                  <span
                    className="text-2xl font-black"
                    style={{ fontFamily: "var(--font-barlow-condensed)", color: "#f95c05" }}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-4 text-base"
                  style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}
                >
                  {submitting ? t("processing") : t("placeOrder")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
