"use client";

import { useLang } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";

export default function Hero() {
  const { lang } = useLang();
  const { content } = useContent();
  const { badge, tagline } = content.hero;

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 2rem", position: "relative" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", border: "1px solid var(--glass-border)", boxShadow: "inset 0 1px 0 var(--glass-shine), 0 4px 16px rgba(0,0,0,0.1)", borderRadius: "999px", padding: "8px 20px", marginBottom: "2.5rem", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block", boxShadow: "0 0 8px var(--accent)" }} />
        {lang === "en" ? badge.en : badge.he}
      </div>

      <h1 style={{ fontSize: "clamp(4rem, 12vw, 10rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1, marginBottom: "1.75rem", color: "var(--text)", textShadow: "0 2px 40px rgba(129,140,248,0.3)" }}>
        ALT<span style={{ color: "var(--accent)" }}>.</span>
      </h1>

      <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "var(--muted)", maxWidth: "460px", lineHeight: 1.7, marginBottom: "3rem" }}>
        {lang === "en" ? tagline.en : tagline.he}
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <a href="#contact" style={{ background: "var(--accent)", color: "#fff", padding: "14px 32px", borderRadius: "999px", fontWeight: 700, fontSize: "0.9rem", boxShadow: "0 4px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.2)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; }}>
          {lang === "en" ? "Let's talk" : "בואו נדבר"}
        </a>
        <a href="#portfolio" style={{ background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", color: "var(--text)", padding: "14px 32px", borderRadius: "999px", fontWeight: 600, fontSize: "0.9rem", border: "1px solid var(--glass-border)", boxShadow: "var(--glass-shadow), inset 0 1px 0 var(--glass-shine)", transition: "transform 0.2s, background 0.2s", cursor: "pointer" }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.background = "rgba(255,255,255,0.18)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.background = "var(--glass-bg)"; }}>
          {lang === "en" ? "See my work" : "ראה עבודות"}
        </a>
      </div>

      <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", color: "var(--muted)", animation: "bounce 2s infinite", fontSize: "1.1rem" }}>↓</div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0);opacity:.5} 50%{transform:translateX(-50%) translateY(8px);opacity:1} }`}</style>
    </section>
  );
}
