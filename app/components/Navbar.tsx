"use client";

import { useLang } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useContent } from "../context/ContentContext";
import { useState, useEffect } from "react";
import AltLogo from "./AltLogo";

export default function Navbar() {
  const { lang, toggle, t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { content } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#services", label: t("Services", "שירותים") },
    { href: "#portfolio", label: t("Work", "עבודות") },
    { href: "#about", label: t("About", "אודות") },
    { href: "#contact", label: t("Contact", "צור קשר") },
  ];

  const pillStyle: React.CSSProperties = {
    background: "var(--glass-bg)",
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    border: "1px solid var(--glass-border)",
    boxShadow: "inset 0 1px 0 var(--glass-shine), 0 2px 8px rgba(0,0,0,0.15)",
    color: "var(--text)",
    padding: "6px 16px",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.05em",
    transition: "background 0.2s, border-color 0.2s",
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: scrolled ? "12px" : "0",
          left: scrolled ? "50%" : "0",
          right: scrolled ? "auto" : "0",
          transform: scrolled ? "translateX(-50%)" : "none",
          width: scrolled ? "min(90vw, 780px)" : "100%",
          zIndex: 100,
          padding: "0 1.75rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          border: "1px solid var(--glass-border)",
          borderRadius: scrolled ? "20px" : "0",
          boxShadow: scrolled
            ? "var(--glass-shadow), inset 0 1px 0 var(--glass-shine)"
            : "inset 0 -1px 0 var(--glass-border)",
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <a href="#" style={{ display: "flex", alignItems: "center", color: "var(--text)" }}>
          {content.logo
            ? <img src={content.logo} alt="ALT" style={{ height: "28px", objectFit: "contain" }} />
            : <AltLogo height={24} />
          }
        </a>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: "1.75rem", alignItems: "center" }} className="hidden md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{ color: "var(--muted)", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}
            >
              {l.label}
            </a>
          ))}

          <button onClick={toggleTheme} style={{ ...pillStyle, fontSize: "1rem", padding: "5px 11px" }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button onClick={toggle} style={pillStyle}>
            {lang === "en" ? "עב" : "EN"}
          </button>
        </div>

        {/* Mobile */}
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }} className="flex md:hidden">
          <button onClick={toggleTheme} style={{ ...pillStyle, fontSize: "1rem", padding: "5px 10px" }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button onClick={toggle} style={{ ...pillStyle, padding: "5px 12px" }}>
            {lang === "en" ? "עב" : "EN"}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", fontSize: "1.2rem" }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "72px",
            left: "1rem",
            right: "1rem",
            zIndex: 99,
            background: "var(--glass-bg)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            border: "1px solid var(--glass-border)",
            borderRadius: "16px",
            boxShadow: "var(--glass-shadow), inset 0 1px 0 var(--glass-shine)",
            padding: "1.25rem 1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 500 }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
