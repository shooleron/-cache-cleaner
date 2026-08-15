import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import type { Article } from '../types';

export default function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="border-t border-slate-200 bg-white" aria-labelledby="related-articles-title">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8 lg:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black tracking-[0.16em] text-blue-600">להמשך הקריאה</span>
            <h3 id="related-articles-title" className="mt-1 text-xl font-black text-slate-900 md:text-2xl">
              כתבות נוספות שיעניינו אותך
            </h3>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${encodeURIComponent(article.id)}`}
              className="group flex min-h-full flex-col overflow-hidden border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              {article.imageUrl ? (
                <div className="h-36 overflow-hidden bg-slate-100">
                  <img
                    src={article.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-4">
                <h4 className="line-clamp-3 text-sm font-bold leading-relaxed text-slate-900 transition group-hover:text-blue-700">
                  {article.title}
                </h4>
                <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {article.readTime}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-blue-700">
                    לכתבה <ArrowLeft size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
