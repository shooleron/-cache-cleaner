import { cache } from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import { INITIAL_ARTICLES } from '@/app/mockData';
import type { Article } from '@/app/types';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

export const getAllArticles = cache(async (): Promise<Article[]> => {
  try {
    const raw = await fs.readFile(ARTICLES_FILE, 'utf-8');
    const stored = JSON.parse(raw) as { articles?: Article[] };
    if (stored.articles?.length) return stored.articles;
  } catch {
    // The curated articles below remain available if persistent storage is empty.
  }

  return INITIAL_ARTICLES;
});

export const getArticleById = cache(async (id: string): Promise<Article | null> => {
  const articles = await getAllArticles();
  return articles.find((item) => item.id === id) ?? null;
});

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const articles = await getAllArticles();
  const impactTerms = new Set(article.physiologicalImpact);

  return articles
    .filter((candidate) => candidate.id !== article.id && candidate.status !== 'rejected')
    .map((candidate) => ({
      candidate,
      score:
        (candidate.category === article.category ? 10 : 0) +
        candidate.physiologicalImpact.filter((term) => impactTerms.has(term)).length * 3,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.candidate.publishedAt).getTime() - new Date(a.candidate.publishedAt).getTime()
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
