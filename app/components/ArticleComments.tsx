'use client';

import { FormEvent, useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type Comment = Database['public']['Tables']['article_comments']['Row'];

function getVisitorId() {
  const storageKey = 'pulsetech_visitor_id';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(storageKey, id);
  return id;
}

export default function ArticleComments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('article_comments')
      .select('*')
      .eq('external_article_id', articleId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setComments(data ?? []));
  }, [articleId]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanBody = body.trim();
    if (cleanName.length < 2 || cleanBody.length < 2) return;

    setIsSending(true);
    setMessage('');
    setError('');

    const supabase = createClient();
    const { error: insertError } = await supabase.from('article_comments').insert({
      external_article_id: articleId,
      display_name: cleanName,
      body: cleanBody,
      anonymous_id: getVisitorId(),
      status: 'pending',
    });

    if (insertError) {
      setError('לא הצלחנו לשלוח את התגובה. אפשר לנסות שוב.');
    } else {
      setBody('');
      setMessage('התגובה נשלחה ותופיע לאחר אישור המערכת. תודה!');
    }
    setIsSending(false);
  };

  return (
    <section className="border-t border-slate-200 bg-slate-50" aria-labelledby="article-comments-title">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8 lg:py-14">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-blue-100 text-blue-700">
            <MessageCircle size={19} />
          </div>
          <div>
            <h3 id="article-comments-title" className="text-xl font-black text-slate-900">תגובות הקוראים</h3>
            <p className="text-xs text-slate-500">{comments.length ? `${comments.length} תגובות שאושרו` : 'היו הראשונים להגיב'}</p>
          </div>
        </div>

        <form onSubmit={submitComment} className="border border-slate-200 bg-white p-5 md:p-6">
          <label className="mb-2 block text-xs font-bold text-slate-700" htmlFor="comment-name">שם</label>
          <input
            id="comment-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={60}
            required
            className="mb-4 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            placeholder="איך להציג את שמך?"
          />
          <label className="mb-2 block text-xs font-bold text-slate-700" htmlFor="comment-body">תגובה</label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            minLength={2}
            maxLength={1000}
            required
            rows={4}
            className="w-full resize-y border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-400 focus:bg-white"
            placeholder="מה חשבתם על הכתבה?"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">התגובה תפורסם לאחר בדיקה קצרה.</span>
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 bg-slate-900 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={14} /> {isSending ? 'שולח...' : 'שליחת תגובה'}
            </button>
          </div>
          {message ? <p className="mt-4 text-sm font-bold text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-4 text-sm font-bold text-rose-600" role="alert">{error}</p> : null}
        </form>

        {comments.length ? (
          <div className="mt-7 space-y-3">
            {comments.map((comment) => (
              <article key={comment.id} className="border border-slate-200 bg-white p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm text-slate-900">{comment.display_name}</strong>
                  <time className="text-[11px] text-slate-400" dateTime={comment.created_at}>
                    {new Date(comment.created_at).toLocaleDateString('he-IL')}
                  </time>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{comment.body}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
