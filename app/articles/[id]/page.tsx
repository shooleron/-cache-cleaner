import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleById, getRelatedArticles } from '@/lib/articles';
import ArticlePageClient from './ArticlePageClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(decodeURIComponent(id));

  if (!article) return { title: 'הכתבה לא נמצאה | PulseTech' };

  return {
    title: `${article.title} | PulseTech`,
    description: article.summary,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.summary,
      images: article.imageUrl ? [{ url: article.imageUrl, alt: article.title }] : [],
      publishedTime: article.publishedAt,
      modifiedTime: article.lastUpdated,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticleById(decodeURIComponent(id));
  if (!article) notFound();
  const relatedArticles = await getRelatedArticles(article);

  return <ArticlePageClient initialArticle={article} relatedArticles={relatedArticles} />;
}
