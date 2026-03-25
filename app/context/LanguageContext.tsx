"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "he";

interface LanguageContextType {
  lang: Lang;
  toggle: () => void;
  t: (en: string, he: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  toggle: () => {},
  t: (en) => en,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const toggle = () => setLang((l) => (l === "en" ? "he" : "en"));
  const t = (en: string, he: string) => (lang === "en" ? en : he);
  const isRTL = lang === "he";

  return (
    <LanguageContext.Provider value={{ lang, toggle, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
