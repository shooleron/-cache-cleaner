'use client';
import { useState } from 'react';
import { Sparkles, Link as LinkIcon, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Article } from '../types';

interface Props {
  onArticleConverted: (article: Article) => void;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function AILinkConverterBox({ onArticleConverted, showToast }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(false);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setLastSuccess(false);

    try {
      const res = await fetch('/api/convert-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!res.ok) {
        throw new Error('המרת הקישור נכשלה');
      }

      const data = await res.json();
      if (data && data.article) {
        onArticleConverted(data.article);
        setUrlInput('');
        setLastSuccess(true);
        showToast('סוכן ה-AI סרק את הקישור והוסיף כתבה חדשה לראש הפיד!', 'success');
        setTimeout(() => setLastSuccess(false), 4000);
      } else {
        throw new Error('לא התקבל אובייקט כתבה תקין');
      }
    } catch (err: any) {
      console.error(err);
      showToast('שגיאה בסריקת הקישור. בדוק שהקישור תקין ונסה שוב.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-900 text-white rounded-none border border-slate-800 p-6 shadow-md mb-8 dir-rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-none flex items-center justify-center text-white shrink-0">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>סוכן AI להמרת קישורים לכתבות בפיד</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-none font-medium">
                GPT Agent
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              הדבק כל קישור (אינסטגרם, מגזין, מחקר או פוסט) וסוכן ה-AI ינתח וימיר אותו מידית לכרטיסייה בפיד
            </p>
          </div>
        </div>

        {lastSuccess && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-none">
            <CheckCircle2 size={14} />
            <span>הכתבה נוצרה בהצלחה!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleConvert} className="flex flex-col md:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <LinkIcon size={16} />
          </div>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="הדבק כאן קישור: https://www.instagram.com/p/... או כל כתבה ברשת"
            required
            className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs md:text-sm pr-10 pl-4 py-3 rounded-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !urlInput.trim()}
          className={`px-6 py-3 text-xs md:text-sm font-bold rounded-none transition-all flex items-center justify-center gap-2 shrink-0 ${
            loading || !urlInput.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 shadow-sm active:scale-95'
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>סוכן AI מנתח קישור...</span>
            </>
          ) : (
            <>
              <span>המר לכתבה בפיד</span>
              <ArrowLeft size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
