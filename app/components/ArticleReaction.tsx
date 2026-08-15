'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Reaction = 'liked' | 'disliked';

function getVisitorId() {
  const storageKey = 'pulsetech_visitor_id';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(storageKey, id);
  return id;
}

export default function ArticleReaction({ articleId }: { articleId: string }) {
  const voteKey = `pulsetech_reaction_${articleId}`;
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(voteKey);
    if (saved === 'liked' || saved === 'disliked') setReaction(saved);
  }, [voteKey]);

  const submitReaction = async (nextReaction: Reaction) => {
    if (reaction || isSaving) return;
    setIsSaving(true);
    setError('');

    const supabase = createClient();
    const { error: insertError } = await supabase.from('article_reactions').insert({
      external_article_id: articleId,
      anonymous_id: getVisitorId(),
      reaction: nextReaction === 'liked',
    });

    if (insertError && insertError.code !== '23505') {
      setError('לא הצלחנו לשמור את הבחירה. אפשר לנסות שוב.');
      setIsSaving(false);
      return;
    }

    localStorage.setItem(voteKey, nextReaction);
    setReaction(nextReaction);
    setIsSaving(false);
  };

  return (
    <section className="border-t border-slate-200 bg-white" aria-labelledby="article-reaction-title">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 text-center md:px-8">
        <h3 id="article-reaction-title" className="text-lg font-black text-slate-900 md:text-xl">
          אהבתם את הכתבה?
        </h3>
        <p className="mt-1 text-sm text-slate-500">המשוב שלכם עוזר לנו לבחור את התוכן הבא.</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={Boolean(reaction) || isSaving}
            onClick={() => submitReaction('liked')}
            className={`min-w-36 border px-5 py-4 text-sm font-bold transition ${
              reaction === 'liked'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
            } disabled:cursor-default`}
          >
            <span className="mb-1 block text-3xl" aria-hidden="true">😊</span>
            אהבתי
          </button>
          <button
            type="button"
            disabled={Boolean(reaction) || isSaving}
            onClick={() => submitReaction('disliked')}
            className={`min-w-36 border px-5 py-4 text-sm font-bold transition ${
              reaction === 'disliked'
                ? 'border-rose-400 bg-rose-50 text-rose-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50'
            } disabled:cursor-default`}
          >
            <span className="mb-1 block text-3xl" aria-hidden="true">😞</span>
            לא אהבתי
          </button>
        </div>

        {reaction ? <p className="mt-4 text-sm font-bold text-blue-700">תודה על המשוב!</p> : null}
        {error ? <p className="mt-4 text-sm font-bold text-rose-600" role="alert">{error}</p> : null}
      </div>
    </section>
  );
}
