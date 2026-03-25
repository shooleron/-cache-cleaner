import type { Metadata } from "next";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "ALT Admin",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
