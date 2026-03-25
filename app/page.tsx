"use client";

import { useEffect } from "react";
import { LanguageProvider, useLang } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ContentProvider } from "./context/ContentContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import About from "./components/About";
import Contact from "./components/Contact";
import EditPanel from "./components/EditPanel";

function Blobs() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", filter: "blur(120px)", opacity: 0.9, background: "var(--blob1)", top: "-10%", left: "-10%", animation: "blobFloat1 18s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", filter: "blur(100px)", opacity: 0.8, background: "var(--blob2)", top: "30%", right: "-5%", animation: "blobFloat2 22s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", filter: "blur(90px)", opacity: 0.7, background: "var(--blob3)", bottom: "5%", left: "20%", animation: "blobFloat3 26s ease-in-out infinite" }} />
      <style>{`
        @keyframes blobFloat1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,40px) scale(1.05)}66%{transform:translate(-30px,60px) scale(0.97)}}
        @keyframes blobFloat2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-50px,-60px) scale(1.08)}66%{transform:translate(40px,30px) scale(0.95)}}
        @keyframes blobFloat3{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,-40px) scale(1.04)}66%{transform:translate(-60px,-20px) scale(1.02)}}
      `}</style>
    </div>
  );
}

function AppContent() {
  const { isRTL } = useLang();
  useEffect(() => {
    document.body.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = isRTL ? "he" : "en";
  }, [isRTL]);

  return (
    <>
      <Blobs />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <main>
          <Hero />
          <Services />
          <Portfolio />
          <About />
          <Contact />
        </main>
        <footer style={{ borderTop: "1px solid var(--glass-border)", padding: "2rem", textAlign: "center", color: "var(--muted)", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} ALT — Juri Altshooler
        </footer>
      </div>
      <EditPanel />
    </>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <ContentProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ContentProvider>
    </ThemeProvider>
  );
}
