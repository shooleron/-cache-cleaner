import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// ═══════════════════════════════════════════════════════════════
// PERSISTENT ARTICLES STORAGE API
// Reads/writes articles to a JSON file on disk so all data
// (articles, bookmarks, moderation status, custom content)
// persists across browser sessions and restarts.
// ═══════════════════════════════════════════════════════════════

const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// GET — Load all saved articles from disk
export async function GET() {
  try {
    await ensureDataDir();
    const fileExists = await fs.access(ARTICLES_FILE).then(() => true).catch(() => false);
    
    if (!fileExists) {
      return NextResponse.json({ articles: [], version: null });
    }

    const raw = await fs.readFile(ARTICLES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error reading articles file:', err);
    return NextResponse.json({ articles: [], version: null });
  }
}

// POST — Save articles to disk
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    const body = await request.json();
    const { articles, version } = body;

    if (!Array.isArray(articles)) {
      return NextResponse.json({ error: 'articles must be an array' }, { status: 400 });
    }

    const data = {
      articles,
      version: version || null,
      lastSaved: new Date().toISOString(),
      count: articles.length
    };

    await fs.writeFile(ARTICLES_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      count: articles.length,
      lastSaved: data.lastSaved 
    });
  } catch (err) {
    console.error('Error saving articles file:', err);
    return NextResponse.json({ error: 'Failed to save articles' }, { status: 500 });
  }
}
