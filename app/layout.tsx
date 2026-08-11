import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "פולס-טק | Wellness Tech Magazine",
  description: "המגזין המוביל לטכנולוגיית בריאות, כושר, תזונה ואריכות ימים. מחקרים, חדשנות ופריצות דרך.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
