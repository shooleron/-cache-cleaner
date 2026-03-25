"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteContent, defaultContent } from "../context/ContentContext";

type Tab = "hero" | "services" | "portfolio" | "about" | "contact" | "logo";

const inp: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "9px 14px", color: "#f0f0ff", fontSize: "0.85rem", fontFamily: "inherit", outline: "none" };
const lbl = (t: string) => <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "#8888aa", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: "4px" }}>{t}</label>;
const Field = ({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) => (
  <div style={{ marginBottom: "0.75rem" }}>
    {lbl(label)}
    {rows
      ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} style={{ ...inp, resize: "vertical" }} />
      : <input value={value} onChange={e => onChange(e.target.value)} style={inp} />}
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [tab, setTab] = useState<Tab>("hero");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(data => { setContent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (path: string[], value: unknown) => {
    setContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let obj: Record<string, unknown> = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]] as Record<string, unknown>;
      obj[path[path.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  const uploadFile = (file: File, onDone: (b64: string) => void) => {
    const r = new FileReader();
    r.onload = e => onDone(e.target?.result as string);
    r.readAsDataURL(file);
  };

  const tabs: [Tab, string][] = [["hero","Hero"],["services","Services"],["portfolio","Portfolio"],["about","About"],["contact","Contact"],["logo","Logo & Links"]];

  const card: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1rem" };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#06060f", color: "#f0f0ff" }}>Loading…</div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#06060f", color: "#f0f0ff", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: "220px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", padding: "1.5rem 1rem" }}>
        <div style={{ fontSize: "1.3rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "2rem", paddingLeft: "0.5rem" }}>
          ALT<span style={{ color: "#818cf8" }}>.</span>
          <span style={{ display: "block", fontSize: "0.65rem", fontWeight: 600, color: "#8888aa", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" }}>Admin</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          {tabs.map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)} style={{ textAlign: "left", padding: "9px 14px", borderRadius: "10px", border: "none", fontSize: "0.85rem", fontWeight: tab === id ? 700 : 500, cursor: "pointer", fontFamily: "inherit", background: tab === id ? "rgba(129,140,248,0.15)" : "transparent", color: tab === id ? "#818cf8" : "#8888aa", transition: "all 0.15s" }}>
              {lbl}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <a href="/" target="_blank" style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "0.8rem", color: "#8888aa", fontWeight: 500, transition: "color 0.15s" }}>View site ↗</a>
          <button onClick={logout} style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "0.8rem", color: "#f87171", fontWeight: 500, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ padding: "1rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1rem", fontWeight: 700, color: "#f0f0ff" }}>{tabs.find(([id]) => id === tab)?.[1]}</h1>
          <button onClick={save} disabled={saving} style={{ padding: "9px 24px", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.2)", background: saved ? "#22c55e" : "#818cf8", color: "#fff", cursor: "pointer", fontFamily: "inherit", transition: "background 0.3s", boxShadow: "0 2px 12px rgba(99,102,241,0.3)" }}>
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>

          {/* HERO */}
          {tab === "hero" && (
            <div style={{ maxWidth: "640px" }}>
              <Field label="Badge (EN)" value={content.hero.badge.en} onChange={v => set(["hero","badge","en"], v)} />
              <Field label="Badge (HE)" value={content.hero.badge.he} onChange={v => set(["hero","badge","he"], v)} />
              <Field label="Tagline (EN)" value={content.hero.tagline.en} onChange={v => set(["hero","tagline","en"], v)} rows={3} />
              <Field label="Tagline (HE)" value={content.hero.tagline.he} onChange={v => set(["hero","tagline","he"], v)} rows={3} />
            </div>
          )}

          {/* SERVICES */}
          {tab === "services" && (
            <div style={{ maxWidth: "700px", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {content.services.map((s, i) => (
                <div key={i} style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "1.3rem", color: s.color }}>{s.icon}</span>
                    <input type="color" value={s.color} onChange={e => set(["services", String(i), "color"], e.target.value)} style={{ width: "26px", height: "26px", border: "none", borderRadius: "50%", cursor: "pointer", background: "none", padding: 0 }} title="Accent color" />
                    <span style={{ fontSize: "0.7rem", color: "#8888aa", fontWeight: 600 }}>Service {i + 1}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <Field label="Title EN" value={s.en.title} onChange={v => set(["services", String(i), "en", "title"], v)} />
                    <Field label="Title HE" value={s.he.title} onChange={v => set(["services", String(i), "he", "title"], v)} />
                    <Field label="Description EN" value={s.en.desc} onChange={v => set(["services", String(i), "en", "desc"], v)} rows={3} />
                    <Field label="Description HE" value={s.he.desc} onChange={v => set(["services", String(i), "he", "desc"], v)} rows={3} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PORTFOLIO */}
          {tab === "portfolio" && (
            <div style={{ maxWidth: "700px", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {content.portfolio.map((w, i) => (
                <div key={i} style={{ ...card, borderColor: `${w.accent}44` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                    <input type="color" value={w.accent} onChange={e => set(["portfolio", String(i), "accent"], e.target.value)} style={{ width: "26px", height: "26px", border: "none", borderRadius: "50%", cursor: "pointer", background: "none", padding: 0 }} />
                    <span style={{ fontSize: "0.7rem", color: "#8888aa", fontWeight: 600 }}>Project {i + 1}</span>
                  </div>

                  {/* Image */}
                  <div style={{ marginBottom: "1rem" }}>
                    {lbl("Cover Image")}
                    {w.image && <img src={w.image} alt="" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "10px", marginBottom: "8px" }} />}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, color: "#818cf8", cursor: "pointer" }}>
                        📎 {w.image ? "Replace" : "Upload image"}
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, b64 => set(["portfolio", String(i), "image"], b64)); }} />
                      </label>
                      {w.image && <button onClick={() => set(["portfolio", String(i), "image"], undefined)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit" }}>✕ Remove</button>}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <Field label="Tag EN" value={w.tag} onChange={v => set(["portfolio", String(i), "tag"], v)} />
                    <Field label="Tag HE" value={w.tagHe} onChange={v => set(["portfolio", String(i), "tagHe"], v)} />
                    <Field label="Title EN" value={w.en.title} onChange={v => set(["portfolio", String(i), "en", "title"], v)} />
                    <Field label="Title HE" value={w.he.title} onChange={v => set(["portfolio", String(i), "he", "title"], v)} />
                    <Field label="Description EN" value={w.en.desc} onChange={v => set(["portfolio", String(i), "en", "desc"], v)} rows={3} />
                    <Field label="Description HE" value={w.he.desc} onChange={v => set(["portfolio", String(i), "he", "desc"], v)} rows={3} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ABOUT */}
          {tab === "about" && (
            <div style={{ maxWidth: "640px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Field label="Name EN" value={content.about.en.name} onChange={v => set(["about","en","name"], v)} />
                <Field label="Name HE" value={content.about.he.name} onChange={v => set(["about","he","name"], v)} />
                <Field label="Bio paragraph 1 EN" value={content.about.en.bio1} onChange={v => set(["about","en","bio1"], v)} rows={4} />
                <Field label="Bio paragraph 1 HE" value={content.about.he.bio1} onChange={v => set(["about","he","bio1"], v)} rows={4} />
                <Field label="Bio paragraph 2 EN" value={content.about.en.bio2} onChange={v => set(["about","en","bio2"], v)} rows={4} />
                <Field label="Bio paragraph 2 HE" value={content.about.he.bio2} onChange={v => set(["about","he","bio2"], v)} rows={4} />
              </div>
            </div>
          )}

          {/* CONTACT */}
          {tab === "contact" && (
            <div style={{ maxWidth: "640px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Field label="Headline EN" value={content.contact.en.headline} onChange={v => set(["contact","en","headline"], v)} />
                <Field label="Headline HE" value={content.contact.he.headline} onChange={v => set(["contact","he","headline"], v)} />
                <Field label="Subtext EN" value={content.contact.en.subtext} onChange={v => set(["contact","en","subtext"], v)} rows={3} />
                <Field label="Subtext HE" value={content.contact.he.subtext} onChange={v => set(["contact","he","subtext"], v)} rows={3} />
              </div>
            </div>
          )}

          {/* LOGO & LINKS */}
          {tab === "logo" && (
            <div style={{ maxWidth: "500px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={card}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem" }}>Logo</p>
                {content.logo
                  ? <img src={content.logo} alt="logo" style={{ maxHeight: "56px", marginBottom: "1rem", display: "block" }} />
                  : <p style={{ fontSize: "0.8rem", color: "#8888aa", marginBottom: "1rem" }}>Using default SVG logo</p>}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", background: "#818cf8", color: "#fff", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                    📎 Upload logo
                    <input type="file" accept="image/*,.svg" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, b64 => set(["logo"], b64)); }} />
                  </label>
                  {content.logo && <button onClick={() => set(["logo"], undefined)} style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600, color: "#8888aa", cursor: "pointer", fontFamily: "inherit" }}>✕ Remove</button>}
                </div>
                <p style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: "#8888aa" }}>PNG, JPG or SVG. Recommended height: 32–48px.</p>
              </div>

              <div style={card}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "1rem" }}>Social Links</p>
                {content.socials.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input value={s.label} onChange={e => set(["socials", String(i), "label"], e.target.value)} placeholder="Label" style={{ ...inp, flex: "0 0 100px" }} />
                    <input value={s.href} onChange={e => set(["socials", String(i), "href"], e.target.value)} placeholder="https://…" style={{ ...inp, flex: 1 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
