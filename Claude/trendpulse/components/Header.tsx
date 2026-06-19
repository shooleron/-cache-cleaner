'use client';
import Link from 'next/link';
import { TrendSource, TrendCategory } from '@/lib/types';
import { UserPreferences, ROLE_CONFIG } from '@/lib/personalization';
import { useLang } from '@/lib/i18n';

const SOURCES: { value: TrendSource | 'all'; label: string }[] = [
  { value: 'all', label: 'All Sources' },
  { value: 'hackernews', label: '🟠 Hacker News' },
  { value: 'reddit', label: '🔴 Reddit' },
  { value: 'youtube', label: '▶ YouTube' },
  { value: 'rss', label: '📰 News' },
  { value: 'producthunt', label: '🚀 Product Hunt' },
];

const CATEGORIES: { value: TrendCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ai', label: '🤖 AI' },
  { value: 'tech', label: '💻 Tech' },
  { value: 'marketing', label: '📣 Marketing' },
  { value: 'business', label: '💼 Business' },
  { value: 'culture', label: '🌍 Culture' },
  { value: 'science', label: '🔬 Science' },
  { value: 'design', label: '🎨 Design' },
  { value: 'crypto', label: '₿ Crypto' },
];

interface Props {
  activeSource: TrendSource | 'all';
  activeCategory: TrendCategory | 'all';
  onSourceChange: (s: TrendSource | 'all') => void;
  onCategoryChange: (c: TrendCategory | 'all') => void;
  onRefresh: () => void;
  onAnalyze: () => void;
  onPersonalize: () => void;
  loading: boolean;
  analyzing: boolean;
  fetchedAt?: string;
  prefs?: UserPreferences | null;
}

export default function Header({
  activeSource, activeCategory,
  onSourceChange, onCategoryChange,
  onRefresh, onAnalyze, onPersonalize,
  loading, analyzing, fetchedAt, prefs,
}: Props) {
  const { lang, t, toggle } = useLang();
  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1.5px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        {/* Top row */}
        <div className="flex items-center justify-between" style={{ height: 60 }}>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 22 }}>🔥</span>
              <div>
                <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text)' }}>TrendPulse</span>
                <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>The Future, Translated</span>
              </div>
            </div>
            {/* Nav links */}
            <div className="flex items-center gap-1" style={{ borderLeft: '1.5px solid var(--border)', paddingLeft: 16 }}>
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', textDecoration: 'none', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                {t.feed}
              </Link>
              <Link
                href="/markets"
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ color: 'var(--muted)', textDecoration: 'none' }}
              >
                📊 {t.markets}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {fetchedAt && (
              <span className="text-xs hidden sm:block" style={{ color: 'var(--muted)' }}>
                {t.updated} {new Date(fetchedAt).toLocaleTimeString()}
              </span>
            )}
            {/* Language toggle */}
            <button
              onClick={toggle}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em' }}
            >
              {lang === 'en' ? 'עב' : 'EN'}
            </button>
            {/* Personalize button */}
            <button
              onClick={onPersonalize}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: prefs ? 'rgba(99,102,241,0.08)' : 'var(--bg)',
                border: `1.5px solid ${prefs ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                color: prefs ? '#6366f1' : 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {prefs
                ? `${ROLE_CONFIG[prefs.role].emoji} ${ROLE_CONFIG[prefs.role].label}`
                : t.personalize}
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                color: 'var(--text)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? `⟳ ${t.loading}` : `⟳ ${t.refresh}`}
            </button>
            <button
              onClick={onAnalyze}
              disabled={analyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: analyzing ? 'rgba(99,102,241,0.6)' : '#6366f1',
                color: '#fff',
                border: 'none',
                cursor: analyzing ? 'not-allowed' : 'pointer',
              }}
            >
              {analyzing ? `🧠 ${t.analyzing}` : `🧠 ${t.aiAnalyze}`}
            </button>
          </div>
        </div>

        {/* Filter rows */}
        <div style={{ paddingBottom: 10, overflowX: 'auto' }}>
          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-nowrap pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeCategory === cat.value ? '#6366f1' : 'transparent',
                  color: activeCategory === cat.value ? '#fff' : 'var(--muted)',
                  border: `1.5px solid ${activeCategory === cat.value ? '#6366f1' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}
              >
                {t.catLabels[cat.value]}
              </button>
            ))}
          </div>

          {/* Source pills */}
          <div className="flex items-center gap-1.5 flex-nowrap">
            {SOURCES.map((src) => (
              <button
                key={src.value}
                onClick={() => onSourceChange(src.value)}
                className="px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all"
                style={{
                  background: activeSource === src.value ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color: activeSource === src.value ? '#6366f1' : 'var(--muted)',
                  border: `1.5px solid ${activeSource === src.value ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                  cursor: 'pointer',
                  fontWeight: activeSource === src.value ? 600 : 400,
                }}
              >
                {src.value === 'all' ? t.allSources : src.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
