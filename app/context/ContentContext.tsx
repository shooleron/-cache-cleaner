"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ServiceItem {
  icon: string;
  color: string;
  en: { title: string; desc: string };
  he: { title: string; desc: string };
}

export interface PortfolioItem {
  tag: string;
  tagHe: string;
  accent: string;
  image?: string;
  en: { title: string; desc: string };
  he: { title: string; desc: string };
}

export interface SiteContent {
  logo?: string; // base64 custom logo
  hero: {
    badge: { en: string; he: string };
    tagline: { en: string; he: string };
  };
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  about: {
    en: { name: string; bio1: string; bio2: string };
    he: { name: string; bio1: string; bio2: string };
  };
  contact: {
    en: { headline: string; subtext: string };
    he: { headline: string; subtext: string };
  };
  socials: { label: string; href: string }[];
}

export const defaultContent: SiteContent = {
  hero: {
    badge: { en: "AI × Product × Marketing", he: "AI × מוצר × שיווק" },
    tagline: {
      en: "Helping businesses build and market digital products powered by AI.",
      he: "עוזר לעסקים לבנות ולשווק מוצרים דיגיטלים בעזרת AI.",
    },
  },
  services: [
    {
      icon: "◈",
      color: "#818cf8",
      en: { title: "AI Strategy & Workflows", desc: "Help businesses adopt AI tools to automate content, marketing, and operations — saving time and scaling faster." },
      he: { title: "אסטרטגיית AI ואוטומציה", desc: "עוזר לעסקים לאמץ כלי AI לאוטומציה של תוכן, שיווק ותפעול — חוסך זמן ומגדיל קצב הצמיחה." },
    },
    {
      icon: "⬡",
      color: "#a78bfa",
      en: { title: "Product Development", desc: "From idea to MVP — strategy, UX/UI design, and product thinking that balances user needs with business goals." },
      he: { title: "פיתוח מוצר", desc: "מרעיון ל-MVP — אסטרטגיה, עיצוב UX/UI וחשיבת מוצר שמאזנת בין צרכי המשתמש לבין מטרות עסקיות." },
    },
    {
      icon: "⬟",
      color: "#22d3ee",
      en: { title: "Digital Marketing & Growth", desc: "Creative campaigns, brand identity, and data-driven marketing to grow your digital presence and convert audiences." },
      he: { title: "שיווק דיגיטלי וצמיחה", desc: "קמפיינים יצירתיים, זהות מותג ושיווק מבוסס נתונים להגדלת הנוכחות הדיגיטלית ושיפור ההמרות." },
    },
  ],
  portfolio: [
    { tag: "UX/UI Design", tagHe: "עיצוב UX/UI", accent: "#818cf8", en: { title: "Product Design System", desc: "End-to-end design system for a SaaS platform — components, patterns, and documentation." }, he: { title: "מערכת עיצוב למוצר", desc: "מערכת עיצוב מקצה לקצה עבור פלטפורמת SaaS — רכיבים, תבניות ותיעוד." } },
    { tag: "Branding", tagHe: "מיתוג", accent: "#a78bfa", en: { title: "Brand Identity", desc: "Complete visual identity including logo, color system, typography, and brand guidelines." }, he: { title: "זהות מותג", desc: "זהות ויזואלית מלאה כולל לוגו, פלטת צבעים, טיפוגרפיה והנחיות מותג." } },
    { tag: "Product", tagHe: "מוצר", accent: "#22d3ee", en: { title: "Digital Product MVP", desc: "Strategy and execution from zero to launched product — research, roadmap, design, and delivery." }, he: { title: "MVP למוצר דיגיטלי", desc: "אסטרטגיה וביצוע מאפס למוצר מושק — מחקר, מפת דרכים, עיצוב ואספקה." } },
    { tag: "Marketing", tagHe: "שיווק", accent: "#34d399", en: { title: "Growth Campaign", desc: "Multi-channel digital campaign combining paid ads, content strategy, and creative assets." }, he: { title: "קמפיין צמיחה", desc: "קמפיין דיגיטלי רב-ערוצי המשלב פרסום ממומן, אסטרטגיית תוכן ונכסים יצירתיים." } },
    { tag: "AI Workflow", tagHe: "תהליך AI", accent: "#fbbf24", en: { title: "AI Content Automation", desc: "Automated content pipeline using AI tools — cutting production time by 70% for a media company." }, he: { title: "אוטומציה של תוכן עם AI", desc: "צינור תוכן אוטומטי בעזרת כלי AI — קיצר את זמן הייצור ב-70% עבור חברת מדיה." } },
    { tag: "Web Design", tagHe: "עיצוב אתרים", accent: "#f472b6", en: { title: "Web Experience Design", desc: "High-converting landing pages and web experiences built for performance and engagement." }, he: { title: "עיצוב חוויית אינטרנט", desc: "דפי נחיתה ממירים וחוויות אינטרנט בנויות לביצועים ומעורבות גבוהה." } },
  ],
  about: {
    en: { name: "Juri Altshooler", bio1: "I'm a product manager and digital designer with a passion for building things that work — beautifully and effectively.", bio2: "ALT is where strategy meets execution. I combine AI tools, product thinking, and creative marketing to help businesses grow in the digital age." },
    he: { name: "יורי אלטשולר", bio1: "מנהל מוצר ומעצב דיגיטלי עם תשוקה לבנות דברים שעובדים — בצורה יפה ויעילה.", bio2: "ALT הוא המקום שבו אסטרטגיה פוגשת ביצוע. אני משלב כלי AI, חשיבת מוצר ושיווק יצירתי כדי לעזור לעסקים לצמוח בעידן הדיגיטלי." },
  },
  contact: {
    en: { headline: "Let's build something.", subtext: "Have a project in mind? Reach out and let's make it happen." },
    he: { headline: "בואו נבנה משהו.", subtext: "יש לך פרויקט בראש? צור איתי קשר ונגרום לזה לקרות." },
  },
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/juri-altshooler" },
    { label: "Behance", href: "https://www.behance.net" },
    { label: "Instagram", href: "https://www.instagram.com" },
  ],
};

interface ContentContextType {
  content: SiteContent;
  update: (newContent: SiteContent) => void;
  reset: () => void;
}

const ContentContext = createContext<ContentContextType>({
  content: defaultContent,
  update: () => {},
  reset: () => {},
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    // Fetch from server — falls back to defaultContent on error
    fetch("/api/content")
      .then(r => r.json())
      .then(data => setContent({ ...defaultContent, ...data }))
      .catch(() => {});
  }, []);

  const update = async (newContent: SiteContent) => {
    setContent(newContent);
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContent),
    });
  };

  const reset = async () => {
    setContent(defaultContent);
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaultContent),
    });
  };

  return (
    <ContentContext.Provider value={{ content, update, reset }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
