"use client";

import { useLang } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";

export default function Portfolio() {
  const { lang } = useLang();
  const { content } = useContent();

  return (
    <section id="portfolio" style={{ padding: "8rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <p style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
          {lang === "en" ? "Work" : "עבודות"}
        </p>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem", lineHeight: 1.1, color: "var(--text)" }}>
          {lang === "en" ? "Selected Projects" : "פרויקטים נבחרים"}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: "480px", lineHeight: 1.7, marginBottom: "4rem" }}>
          {lang === "en" ? "A selection of projects across design, product, and marketing." : "מבחר פרויקטים בתחומי עיצוב, מוצר ושיווק."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {content.portfolio.map((w, i) => {
            const c = lang === "en" ? w.en : w.he;
            const tag = lang === "en" ? w.tag : w.tagHe;
            return (
              <div key={i} style={{ position: "relative", background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", border: "1px solid var(--glass-border)", borderRadius: "20px", overflow: "hidden", boxShadow: "var(--glass-shadow), inset 0 1px 0 var(--glass-shine)", transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.2s", cursor: "pointer" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-6px) scale(1.01)"; el.style.background = "rgba(255,255,255,0.18)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0) scale(1)"; el.style.background = "var(--glass-bg)"; }}
              >
                <div style={{ position: "absolute", inset: 0, borderRadius: "20px", pointerEvents: "none", background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
                {/* Card image */}
                {w.image && (
                  <div style={{ height: "160px", overflow: "hidden" }}>
                    <img src={w.image} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ height: "3px", background: `linear-gradient(90deg, ${w.accent}, ${w.accent}44)` }} />
                <div style={{ padding: "1.75rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: w.accent, marginBottom: "0.75rem", display: "block", filter: `drop-shadow(0 0 6px ${w.accent}66)` }}>{tag}</span>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem", letterSpacing: "-0.02em", color: "var(--text)" }}>{c.title}</h3>
                  <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
