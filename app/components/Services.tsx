"use client";

import { useLang } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";

export default function Services() {
  const { lang } = useLang();
  const { content } = useContent();

  return (
    <section id="services" style={{ padding: "8rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
      <p style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
        {lang === "en" ? "Services" : "שירותים"}
      </p>
      <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem", lineHeight: 1.1, color: "var(--text)" }}>
        {lang === "en" ? "What I do" : "מה אני עושה"}
      </h2>
      <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: "480px", lineHeight: 1.7, marginBottom: "4rem" }}>
        {lang === "en" ? "End-to-end capabilities across AI, product, and marketing — so you don't need five different agencies." : "יכולות מקצה לקצה ב-AI, מוצר ושיווק — כדי שלא תצטרך חמש סוכנויות שונות."}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {content.services.map((s, i) => {
          const c = lang === "en" ? s.en : s.he;
          return (
            <div key={i} style={{ position: "relative", background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", border: "1px solid var(--glass-border)", borderRadius: "20px", padding: "2rem", boxShadow: "var(--glass-shadow), inset 0 1px 0 var(--glass-shine)", transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, box-shadow 0.2s", overflow: "hidden", cursor: "default" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-6px) scale(1.01)"; el.style.background = "rgba(255,255,255,0.18)"; el.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px ${s.color}55, inset 0 1px 0 var(--glass-shine)`; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0) scale(1)"; el.style.background = "var(--glass-bg)"; el.style.boxShadow = "var(--glass-shadow), inset 0 1px 0 var(--glass-shine)"; }}
            >
              <div style={{ position: "absolute", inset: 0, borderRadius: "20px", pointerEvents: "none", background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, ${s.color}11 100%)` }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", borderRadius: "0 0 20px 20px", background: `linear-gradient(90deg, ${s.color}88, ${s.color}22)` }} />
              <span style={{ fontSize: "1.75rem", color: s.color, display: "block", marginBottom: "1.25rem", filter: `drop-shadow(0 0 8px ${s.color}66)` }}>{s.icon}</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "-0.02em", color: "var(--text)" }}>{c.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.7 }}>{c.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
