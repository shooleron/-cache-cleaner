"use client";

import { useState, useRef } from "react";
import { useContent, SiteContent, defaultContent } from "../context/ContentContext";

type Tab = "hero" | "services" | "portfolio" | "about" | "contact" | "logo";

const label = (txt: string) => (
  <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>{txt}</label>
);

const field = (value: string, onChange: (v: string) => void, multiline = false) => {
  const base: React.CSSProperties = { width: "100%", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "9px 12px", color: "var(--text)", fontSize: "0.82rem", fontFamily: "inherit", outline: "none", resize: multiline ? "vertical" : "none" };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={base} />
    : <input value={value} onChange={e => onChange(e.target.value)} style={base} />;
};

export default function EditPanel() {
  const { content, update, reset } = useContent();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("hero");
  const [draft, setDraft] = useState<SiteContent>(content);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => { update(draft); setOpen(false); };
  const discard = () => { setDraft(content); setOpen(false); };
  const setDraftField = (path: string[], value: unknown) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let obj: Record<string, unknown> = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]] as Record<string, unknown>;
      obj[path[path.length - 1]] = value;
      return next;
    });
  };

  const uploadFile = (file: File, onDone: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = e => onDone(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const tabBtn = (id: Tab, label: string) => (
    <button key={id} onClick={() => setTab(id)} style={{ padding: "6px 14px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, border: "1px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", borderColor: tab === id ? "var(--accent)" : "var(--glass-border)", background: tab === id ? "var(--accent)" : "var(--glass-bg)", color: tab === id ? "#fff" : "var(--muted)" }}>
      {label}
    </button>
  );

  const panelStyle: React.CSSProperties = { position: "fixed", top: 0, right: 0, bottom: 0, width: "400px", zIndex: 200, background: "var(--glass-bg)", backdropFilter: "blur(32px) saturate(200%)", WebkitBackdropFilter: "blur(32px) saturate(200%)", borderLeft: "1px solid var(--glass-border)", boxShadow: "-8px 0 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)" };

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => { setDraft(content); setOpen(true); }}
        title="Edit site content"
        style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 150, width: "52px", height: "52px", borderRadius: "999px", background: "var(--accent)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "1.2rem", cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        ✏️
      </button>

      {/* Overlay */}
      {open && <div onClick={discard} style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }} />}

      {/* Panel */}
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>Edit Content</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { if (confirm("Reset all content to defaults?")) { reset(); setDraft(defaultContent); setOpen(false); } }} style={{ padding: "5px 12px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600, border: "1px solid var(--glass-border)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
            <button onClick={discard} style={{ padding: "5px 12px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600, border: "1px solid var(--glass-border)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button onClick={save} style={{ padding: "5px 16px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.2)", background: "var(--accent)", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Save</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--glass-border)", display: "flex", gap: "0.5rem", flexWrap: "wrap", flexShrink: 0 }}>
          {([["hero", "Hero"], ["services", "Services"], ["portfolio", "Portfolio"], ["about", "About"], ["contact", "Contact"], ["logo", "Logo & Links"]] as [Tab, string][]).map(([id, lbl]) => tabBtn(id, lbl))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>

          {/* ── HERO ── */}
          {tab === "hero" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>{label("Badge (EN)")}{field(draft.hero.badge.en, v => setDraftField(["hero","badge","en"], v))}</div>
              <div>{label("Badge (HE)")}{field(draft.hero.badge.he, v => setDraftField(["hero","badge","he"], v))}</div>
              <div>{label("Tagline (EN)")}{field(draft.hero.tagline.en, v => setDraftField(["hero","tagline","en"], v), true)}</div>
              <div>{label("Tagline (HE)")}{field(draft.hero.tagline.he, v => setDraftField(["hero","tagline","he"], v), true)}</div>
            </div>
          )}

          {/* ── SERVICES ── */}
          {tab === "services" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {draft.services.map((s, i) => (
                <div key={i} style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "14px", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "1.2rem", color: s.color }}>{s.icon}</span>
                    <input type="color" value={s.color} onChange={e => setDraftField(["services", String(i), "color"], e.target.value)} style={{ width: "28px", height: "28px", border: "none", borderRadius: "50%", cursor: "pointer", background: "none", padding: 0 }} title="Accent color" />
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 600 }}>Service {i + 1}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <div>{label("Title (EN)")}{field(s.en.title, v => setDraftField(["services", String(i), "en", "title"], v))}</div>
                    <div>{label("Title (HE)")}{field(s.he.title, v => setDraftField(["services", String(i), "he", "title"], v))}</div>
                    <div>{label("Description (EN)")}{field(s.en.desc, v => setDraftField(["services", String(i), "en", "desc"], v), true)}</div>
                    <div>{label("Description (HE)")}{field(s.he.desc, v => setDraftField(["services", String(i), "he", "desc"], v), true)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PORTFOLIO ── */}
          {tab === "portfolio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {draft.portfolio.map((w, i) => (
                <div key={i} style={{ background: "var(--glass-bg)", border: `1px solid ${w.accent}44`, borderRadius: "14px", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                    <input type="color" value={w.accent} onChange={e => setDraftField(["portfolio", String(i), "accent"], e.target.value)} style={{ width: "28px", height: "28px", border: "none", borderRadius: "50%", cursor: "pointer", background: "none", padding: 0 }} title="Accent color" />
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 600 }}>Project {i + 1}</span>
                  </div>
                  {/* Image upload */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    {label("Cover Image")}
                    {w.image && <img src={w.image} alt="" style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "8px", marginBottom: "6px" }} />}
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>
                      📎 {w.image ? "Replace image" : "Upload image"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, b64 => setDraftField(["portfolio", String(i), "image"], b64)); }} />
                    </label>
                    {w.image && <button onClick={() => setDraftField(["portfolio", String(i), "image"], undefined)} style={{ marginLeft: "8px", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.75rem" }}>✕ Remove</button>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <div>{label("Tag (EN)")}{field(w.tag, v => setDraftField(["portfolio", String(i), "tag"], v))}</div>
                    <div>{label("Tag (HE)")}{field(w.tagHe, v => setDraftField(["portfolio", String(i), "tagHe"], v))}</div>
                    <div>{label("Title (EN)")}{field(w.en.title, v => setDraftField(["portfolio", String(i), "en", "title"], v))}</div>
                    <div>{label("Title (HE)")}{field(w.he.title, v => setDraftField(["portfolio", String(i), "he", "title"], v))}</div>
                    <div>{label("Description (EN)")}{field(w.en.desc, v => setDraftField(["portfolio", String(i), "en", "desc"], v), true)}</div>
                    <div>{label("Description (HE)")}{field(w.he.desc, v => setDraftField(["portfolio", String(i), "he", "desc"], v), true)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ABOUT ── */}
          {tab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>{label("Name (EN)")}{field(draft.about.en.name, v => setDraftField(["about","en","name"], v))}</div>
              <div>{label("Name (HE)")}{field(draft.about.he.name, v => setDraftField(["about","he","name"], v))}</div>
              <div>{label("Bio paragraph 1 (EN)")}{field(draft.about.en.bio1, v => setDraftField(["about","en","bio1"], v), true)}</div>
              <div>{label("Bio paragraph 1 (HE)")}{field(draft.about.he.bio1, v => setDraftField(["about","he","bio1"], v), true)}</div>
              <div>{label("Bio paragraph 2 (EN)")}{field(draft.about.en.bio2, v => setDraftField(["about","en","bio2"], v), true)}</div>
              <div>{label("Bio paragraph 2 (HE)")}{field(draft.about.he.bio2, v => setDraftField(["about","he","bio2"], v), true)}</div>
            </div>
          )}

          {/* ── CONTACT ── */}
          {tab === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>{label("Headline (EN)")}{field(draft.contact.en.headline, v => setDraftField(["contact","en","headline"], v))}</div>
              <div>{label("Headline (HE)")}{field(draft.contact.he.headline, v => setDraftField(["contact","he","headline"], v))}</div>
              <div>{label("Subtext (EN)")}{field(draft.contact.en.subtext, v => setDraftField(["contact","en","subtext"], v), true)}</div>
              <div>{label("Subtext (HE)")}{field(draft.contact.he.subtext, v => setDraftField(["contact","he","subtext"], v), true)}</div>
            </div>
          )}

          {/* ── LOGO & LINKS ── */}
          {tab === "logo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Logo upload */}
              <div style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "14px", padding: "1.25rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)", marginBottom: "1rem" }}>Logo</div>
                {draft.logo
                  ? <img src={draft.logo} alt="logo" style={{ maxHeight: "60px", marginBottom: "1rem", display: "block", filter: "var(--logo-filter, none)" }} />
                  : <div style={{ padding: "1rem", background: "var(--glass-bg)", borderRadius: "10px", marginBottom: "1rem", textAlign: "center", color: "var(--muted)", fontSize: "0.8rem" }}>Using default SVG logo</div>
                }
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "var(--accent)", color: "#fff", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                    📎 Upload logo
                    <input ref={fileRef} type="file" accept="image/*,.svg" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, b64 => setDraftField(["logo"], b64)); }} />
                  </label>
                  {draft.logo && <button onClick={() => setDraftField(["logo"], undefined)} style={{ padding: "8px 16px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", cursor: "pointer", fontFamily: "inherit" }}>✕ Remove</button>}
                </div>
                <p style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.5 }}>PNG, JPG, or SVG. Recommended height: 32–48px.</p>
              </div>

              {/* Social links */}
              <div style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "14px", padding: "1.25rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)", marginBottom: "1rem" }}>Social Links</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {draft.socials.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input value={s.label} onChange={e => setDraftField(["socials", String(i), "label"], e.target.value)} placeholder="Label" style={{ flex: "0 0 90px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "8px", padding: "7px 10px", color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit", outline: "none" }} />
                      <input value={s.href} onChange={e => setDraftField(["socials", String(i), "href"], e.target.value)} placeholder="https://..." style={{ flex: 1, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "8px", padding: "7px 10px", color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit", outline: "none" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
