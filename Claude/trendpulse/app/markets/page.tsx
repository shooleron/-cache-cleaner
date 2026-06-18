'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Trend, AIAnalysis, TrendSource, TrendCategory, TrendsResponse, TrendInsight } from '@/lib/types';
import MarketCard from '@/components/MarketCard';

const CATEGORIES: { value: TrendCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all',       label: 'All Markets', emoji: '🌐' },
  { value: 'ai',        label: 'AI',          emoji: '🤖' },
  { value: 'tech',      label: 'Tech',        emoji: '💻' },
  { value: 'marketing', label: 'Marketing',   emoji: '📣' },
  { value: 'business',  label: 'Business',    emoji: '💼' },
  { value: 'culture',   label: 'Culture',     emoji: '🌍' },
  { value: 'science',   label: 'Science',     emoji: '🔬' },
  { value: 'design',    label: 'Design',      emoji: '🎨' },
  { value: 'crypto',    label: 'Crypto',      emoji: '₿' },
];

const SORT_OPTIONS = [
  { value: 'trending',  label: '🔥 Trending' },
  { value: 'volume',    label: '💰 Volume' },
  { value: 'newest',    label: '🕐 Newest' },
  { value: 'closing',   label: '⏳ Closing Soon' },
];

function SkeletonMarket() {
  return (
    <div className="rounded-[20px] border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="skeleton w-full" style={{ height: 180 }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-full rounded-full mt-4" />
      </div>
      <div className="p-3 flex gap-2">
        <div className="skeleton flex-1 h-9 rounded-xl" />
        <div className="skeleton flex-1 h-9 rounded-xl" />
      </div>
    </div>
  );
}

type SortKey = 'trending' | 'volume' | 'newest' | 'closing';

function sortTrends(trends: Trend[], key: SortKey): Trend[] {
  return [...trends].sort((a, b) => {
    if (key === 'trending') return b.score - a.score;
    if (key === 'volume')   return (b.rawScore + b.commentCount) - (a.rawScore + a.commentCount);
    if (key === 'newest')   return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    if (key === 'closing')  return a.score - b.score; // lower score = closing sooner
    return 0;
  });
}

export default function MarketsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<TrendCategory | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('trending');
  const [buyToast, setBuyToast] = useState<string | null>(null);
  const [totalVol, setTotalVol] = useState(0);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      const data: TrendsResponse = await res.json();
      setTrends(data.trends);
      setTotalVol(data.trends.reduce((s, t) => s + (t.rawScore + t.commentCount) * 47, 0));
    } finally {
      setLoading(false);
    }
  }, []);

  const runAnalysis = useCallback(async (t: Trend[]) => {
    if (!t.length || analyzing) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trends: t.slice(0, 20) }),
      });
      const data: AIAnalysis = await res.json();
      setAnalysis(data);
    } finally {
      setAnalyzing(false);
    }
  }, [analyzing]);

  useEffect(() => { fetchTrends(); }, [fetchTrends]);
  useEffect(() => { if (trends.length && !analysis) runAnalysis(trends); }, [trends]); // eslint-disable-line

  const insightMap = new Map<string, TrendInsight>();
  analysis?.topTrends?.forEach((ins) => {
    const idx = parseInt(ins.trendId?.replace('trend-', '') || '0') - 1;
    if (trends[idx]) insightMap.set(trends[idx].id, ins);
  });

  const filtered = trends.filter((t) => activeCategory === 'all' || t.category === activeCategory);
  const sorted = sortTrends(filtered, sortKey);

  function handleBuy(trend: Trend, side: 'yes' | 'no') {
    setBuyToast(`${side === 'yes' ? '🟢' : '🔴'} Bought ${side.toUpperCase()} on "${trend.title.slice(0, 40)}…"`);
    setTimeout(() => setBuyToast(null), 3000);
  }

  const formatVol = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1.5px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <div className="flex items-center justify-between" style={{ height: 60 }}>
            {/* Logo + nav */}
            <div className="flex items-center gap-6">
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>🔥</span>
                <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text)' }}>TrendPulse</span>
              </Link>
              <div className="flex items-center gap-1" style={{ borderLeft: '1.5px solid var(--border)', paddingLeft: 16 }}>
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ color: 'var(--muted)', textDecoration: 'none' }}
                >
                  Feed
                </Link>
                <Link
                  href="/markets"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', textDecoration: 'none', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  📊 Markets
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>Total Volume</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatVol(totalVol)}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>Open Markets</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{trends.length}</p>
              </div>
              <button
                onClick={fetchTrends}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}
              >
                ⟳ Refresh
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 pb-3 overflow-x-auto flex-nowrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeCategory === cat.value ? '#6366f1' : 'transparent',
                  border: `1.5px solid ${activeCategory === cat.value ? '#6366f1' : 'var(--border)'}`,
                  color: activeCategory === cat.value ? '#fff' : 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* Hero stats bar */}
        <div
          className="flex items-center justify-between mb-6 px-5 py-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))', border: '1.5px solid rgba(99,102,241,0.15)' }}
        >
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: '#6366f1' }}>Markets</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text)' }}>{filtered.length}</p>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: '#6366f1' }}>Total Volume</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text)' }}>{formatVol(totalVol)}</p>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: '#22c55e' }}>Trending Up</p>
              <p className="text-2xl font-black" style={{ color: '#22c55e' }}>
                {filtered.filter((t) => t.score >= 55).length}
              </p>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: '#ef4444' }}>Cooling</p>
              <p className="text-2xl font-black" style={{ color: '#ef4444' }}>
                {filtered.filter((t) => t.score < 35).length}
              </p>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortKey(opt.value as SortKey)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: sortKey === opt.value ? 'rgba(99,102,241,0.12)' : 'transparent',
                  border: `1.5px solid ${sortKey === opt.value ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                  color: sortKey === opt.value ? '#6366f1' : 'var(--muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {Array.from({ length: 9 }).map((_, i) => <SkeletonMarket key={i} />)}
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {sorted.map((t, i) => (
              <MarketCard
                key={t.id}
                trend={t}
                insight={insightMap.get(t.id)}
                index={i % 6}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </main>

      {/* Buy toast */}
      {buyToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-semibold"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            color: 'var(--text)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 200,
            whiteSpace: 'nowrap',
          }}
        >
          {buyToast}
        </div>
      )}
    </div>
  );
}
