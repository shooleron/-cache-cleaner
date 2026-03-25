"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "2rem" }}>

      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", filter: "blur(120px)", background: "rgba(99,102,241,0.25)", top: "-15%", left: "-10%" }} />
        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", filter: "blur(90px)", background: "rgba(139,92,246,0.2)", bottom: "5%", right: "5%" }} />
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.05em", color: "var(--text)" }}>
            ALT<span style={{ color: "#818cf8" }}>.</span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Admin Panel</p>
        </div>

        {/* Login card */}
        <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: "2rem", boxShadow: "0 4px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)" }}>

          <div style={{ position: "absolute", inset: 0, borderRadius: "20px", background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                required
                placeholder="Enter admin password"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.12)"}`, borderRadius: "12px", padding: "12px 16px", color: "var(--text)", fontSize: "0.9rem", fontFamily: "inherit", outline: "none" }}
              />
              {error && <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "6px" }}>{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ background: loading ? "rgba(129,140,248,0.5)" : "#818cf8", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "13px", borderRadius: "12px", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.25)", transition: "opacity 0.2s", fontFamily: "inherit" }}
            >
              {loading ? "Verifying…" : "Sign in →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--muted)" }}>
          <a href="/" style={{ color: "var(--muted)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "1px" }}>
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  );
}
