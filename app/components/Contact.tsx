"use client";

import { useLang } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import { useState } from "react";

const inputStyle: React.CSSProperties = { background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", border: "1px solid var(--glass-border)", borderRadius: "999px", padding: "12px 20px", color: "var(--text)", fontSize: "0.875rem", width: "100%", outline: "none", fontFamily: "inherit", boxShadow: "inset 0 1px 0 var(--glass-shine)" };

export default function Contact() {
  const { lang } = useLang();
  const { content } = useContent();
  const [sent, setSent] = useState(false);
  const c = lang === "en" ? content.contact.en : content.contact.he;

  return (
    <section id="contact" style={{ padding: "8rem 2rem" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <p style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
          {lang === "en" ? "Contact" : "צור קשר"}
        </p>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem", lineHeight: 1.1, color: "var(--text)" }}>{c.headline}</h2>
        <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "3rem" }}>{c.subtext}</p>

        <div style={{ position: "relative", background: "var(--glass-bg)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", border: "1px solid var(--glass-border)", borderRadius: "24px", padding: "2.5rem", boxShadow: "var(--glass-shadow), inset 0 1px 0 var(--glass-shine)", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "24px", background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
          {sent ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✦</div>
              <p style={{ color: "var(--accent)", fontWeight: 600 }}>{lang === "en" ? "Message sent! I'll be in touch soon." : "ההודעה נשלחה! אחזור אליך בקרוב."}</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <input type="text" placeholder={lang === "en" ? "Name" : "שם"} required style={inputStyle} />
                <input type="email" placeholder={lang === "en" ? "Email" : "אימייל"} required style={inputStyle} />
              </div>
              <input type="text" placeholder={lang === "en" ? "Subject" : "נושא"} style={inputStyle} />
              <textarea placeholder={lang === "en" ? "Tell me about your project..." : "ספר לי על הפרויקט שלך..."} required rows={5} style={{ ...inputStyle, borderRadius: "16px", resize: "vertical" }} />
              <button type="submit" style={{ background: "var(--accent)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "14px 28px", borderRadius: "999px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", alignSelf: "flex-start", boxShadow: "0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.25)", transition: "transform 0.2s", fontFamily: "inherit" }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "translateY(0)"; }}>
                {lang === "en" ? "Send message" : "שלח הודעה"}
              </button>
            </form>
          )}
        </div>

        <div style={{ marginTop: "2.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          {content.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}>
              {s.label} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
