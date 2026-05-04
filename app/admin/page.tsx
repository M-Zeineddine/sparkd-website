"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SparkdLogo from "@/components/SparkdLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError("Incorrect password");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#111111" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <SparkdLogo size="md" textColor="white"
          />
        </div>

        <div className="border border-white/10 p-8" style={{ background: "#1a1a1a" }}>
          <h1
            className="text-2xl font-black text-white mb-1 uppercase tracking-widest"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Admin Login
          </h1>
          <p className="text-white/40 text-sm mb-8" style={{ fontFamily: "var(--font-barlow)" }}>
            Spark&apos;d management portal
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                className="text-xs uppercase tracking-widest text-white/50"
                style={{ fontFamily: "var(--font-barlow-condensed)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-white text-sm"
                style={{
                  background: "#111111",
                  border: `2px solid ${error ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                  fontFamily: "var(--font-barlow)",
                  outline: "none",
                }}
                placeholder="••••••••"
                autoFocus
              />
              {error && (
                <span
                  className="text-red-400 text-xs"
                  style={{ fontFamily: "var(--font-barlow)" }}
                >
                  {error}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 font-black text-sm uppercase tracking-widest transition-all"
              style={{
                fontFamily: "var(--font-barlow-condensed)",
                background: loading || !password ? "#333" : "#f95c05",
                color: "#fffdf9",
                cursor: loading || !password ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "..." : "Login"}
            </button>
          </form>
        </div>

        <p
          className="text-center text-white/20 text-xs mt-6"
          style={{ fontFamily: "var(--font-barlow)", letterSpacing: "0.1em" }}
        >
          SPARKD ADMIN · AUTHORIZED ACCESS ONLY
        </p>
      </div>
    </div>
  );
}
