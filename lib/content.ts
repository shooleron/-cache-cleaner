import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "content.json");

// Import type only — avoids bundling client code into server
export type { SiteContent } from "../app/context/ContentContext";
import type { SiteContent } from "../app/context/ContentContext";
import { defaultContent } from "../app/context/ContentContext";

export function readContent(): SiteContent {
  try {
    if (!fs.existsSync(DATA_PATH)) return defaultContent;
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const saved = JSON.parse(raw) as Partial<SiteContent>;
    return { ...defaultContent, ...saved };
  } catch {
    return defaultContent;
  }
}

export function writeContent(content: SiteContent): void {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2), "utf-8");
}
