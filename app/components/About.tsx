"use client";

import { useLang } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";

const skills = [
  { en: "AI Strategy", he: "אסטרטגיית AI" }, { en: "Product Management", he: "ניהול מוצר" },
  { en: "UX/UI Design", he: "עיצוב UX/UI" }, { en: "Digital Marketing", he: "שיווק דיגיטלי" },
  { en: "Brand Identity", he: "זהות מותג" }, { en: "Growth Campaigns", he: "קמפיינים לצמיחה" },
  { en: "Creative Direction", he: "ניהול קריאיטיב" }, { en: "Project Management", he: "ניהול פרויקטים" },
];

const glassPanel: React.CSSProperties = { position: "relative", background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", border: "1px solid var(--glass-border)", borderRadius: "24px", padding: "2.5rem", boxShadow: "var(--glass-shadow), inset 0 1px 0 var(--glass-shine)", overflow: "hidden" };

export default function About() {
  const { lang } = useLang();
  const { content } = useContent();
  const a = lang === "en" ? content.about.en : content.about.he;

  return (
    <section id="about" style={{ padding: "8rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "center" }}>

        <div style={glassPanel}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "24px", background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
          <p style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
            {lang === "en" ? "About" : "אודות"}
          </p>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1.5rem", lineHeight: 1.1, color: "var(--text)" }}>{a.name}</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "1rem" }}>{a.bio1}</p>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "2rem" }}>{a.bio2}</p>
          <a href="#contact" style={{ display: "inline-block", background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", color: "var(--accent)", border: "1px solid var(--accent)", padding: "12px 24px", borderRadius: "999px", fontWeight: 600, fontSize: "0.875rem", boxShadow: "0 0 20px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.15)", transition: "transform 0.2s", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
            {lang === "en" ? "Get in touch →" : "צור קשר ←"}
          </a>
        </div>

        <div style={glassPanel}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "24px", background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
          <p style={{ color: "var(--muted)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {lang === "en" ? "Expertise" : "תחומי מומחיות"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
            {skills.map((s, i) => (
              <span key={i} style={{ background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", border: "1px solid var(--glass-border)", borderRadius: "999px", padding: "8px 16px", fontSize: "0.8rem", color: "var(--text)", fontWeight: 500, boxShadow: "inset 0 1px 0 var(--glass-shine)" }}>
                {lang === "en" ? s.en : s.he}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
