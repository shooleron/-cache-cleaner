'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Article } from '@/app/types';
import ArticleDetail from '@/app/components/ArticleDetail';

export default function ArticlePageClient({
  initialArticle,
  relatedArticles,
}: {
  initialArticle: Article;
  relatedArticles: Article[];
}) {
  const router = useRouter();
  const [article, setArticle] = useState(initialArticle);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let anonymousId = window.localStorage.getItem('pulsetech_visitor_id');
    if (!anonymousId) {
      anonymousId = crypto.randomUUID();
      window.localStorage.setItem('pulsetech_visitor_id', anonymousId);
    }
    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        slug: initialArticle.id,
        anonymousId,
        referrer: document.referrer,
        utm: {
          source: params.get('utm_source') ?? '',
          medium: params.get('utm_medium') ?? '',
          campaign: params.get('utm_campaign') ?? '',
        },
      }),
    }).catch(() => undefined);
  }, [initialArticle.id]);

  return (
    <main className="min-h-screen bg-slate-50 p-3 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1280px] flex-col">
        <ArticleDetail
          article={article}
          relatedArticles={relatedArticles}
          onClose={() => router.push('/')}
          onToggleBookmark={() =>
            setArticle((current) => ({ ...current, isBookmarked: !current.isBookmarked }))
          }
        />
      </div>
    </main>
  );
}
