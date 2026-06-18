'use client';
import { useState, useEffect, useCallback } from 'react';
import { Trend, TrendSource, TrendCategory, TrendsResponse, TrendInsight, AIAnalysis } from '@/lib/types';
import { UserPreferences, loadPreferences, savePreferences, splitByRelevance, ROLE_CONFIG } from '@/lib/personalization';
import Header from '@/components/Header';
import TrendCard from '@/components/FeaturedCard';
import PersonalizeModal from '@/components/PersonalizeModal';

const CATEGORIES: { key: TrendCategory | 'all'; emoji: string; label: string }[] = [
  { key: 'all',       emoji: '🔥', label: 'All Trends' },
  { key: 'tech',      emoji: '💻', label: 'Tech' },
  { key: 'ai',        emoji: '🤖', label: 'AI' },
  { key: 'marketing', emoji: '📣', label: 'Marketing' },
  { key: 'business',  emoji: '💼', label: 'Business' },
  { key: 'science',   emoji: '🔬', label: 'Science' },
  { key: 'design',    emoji: '🎨', label: 'Design' },
  { key: 'crypto',    emoji: '₿',  label: 'Crypto' },
  { key: 'culture',   emoji: '🌍', label: 'Culture' },
];

function SkeletonFeatured() {
  return (
    <div className="rounded-[20px] border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="skeleton w-full" style={{ height: 180 }} />
      <div className="p-4">
        <div className="skeleton h-4 w-3/4 mb-2 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}


export default function Dashboard() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeSource, setActiveSource] = useState<TrendSource | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<TrendCategory | 'all'>('all');
  const [fetchedAt, setFetchedAt] = useState<string>();
  const [sourceStats, setSourceStats] = useState<TrendsResponse['sources']>([]);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = loadPreferences();
    setPrefs(saved);
    if (!saved) setTimeout(() => setShowModal(true), 1200);
  }, []);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trends');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TrendsResponse = await res.json();
      setTrends(data.trends);
      setFetchedAt(data.fetchedAt);
      setSourceStats(data.sources);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trends');
    } finally {
      setLoading(false);
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!trends.length) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trends: trends.slice(0, 20) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AIAnalysis = await res.json();
      setAnalysis(data);
    } catch (e) {
      console.error('Analysis failed:', e);
    } finally {
      setAnalyzing(false);
    }
  }, [trends]);

  useEffect(() => { fetchTrends(); }, [fetchTrends]);
  useEffect(() => {
    if (trends.length > 0 && !analysis && !analyzing) runAnalysis();
  }, [trends]); // eslint-disable-line

  function handleSavePrefs(p: UserPreferences) {
    savePreferences(p);
    setPrefs(p);
  }

  const filtered = trends.filter((t) => {
    if (activeSource !== 'all' && t.source !== activeSource) return false;
    if (activeCategory !== 'all' && t.category !== activeCategory) return false;
    return true;
  });

  const { forYou, more } = splitByRelevance(filtered, prefs);
  const allSorted = [...filtered].sort((a, b) => b.score - a.score);
  const displayForYou = prefs ? forYou : allSorted.slice(0, 3);
  const displayMore = prefs ? more : allSorted.slice(3);

  const insightMap = new Map<string, TrendInsight>();
  analysis?.topTrends?.forEach((ins) => {
    const idx = parseInt(ins.trendId?.replace('trend-', '') || '0') - 1;
    if (trends[idx]) insightMap.set(trends[idx].id, ins);
  });

  // Category counts for sidebar
  const categoryCounts = trends.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    acc['all'] = (acc['all'] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        activeSource={activeSource}
        activeCategory={activeCategory}
        onSourceChange={setActiveSource}
        onCategoryChange={setActiveCategory}
        onRefresh={fetchTrends}
        onAnalyze={runAnalysis}
        onPersonalize={() => setShowModal(true)}
        loading={loading}
        analyzing={analyzing}
        fetchedAt={fetchedAt}
        prefs={prefs}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px 40px', display: 'flex', gap: 24, alignItems: 'flex-start', paddingTop: 20 }}>

        {/* Left sidebar */}
        <aside style={{ width: 208, flexShrink: 0, position: 'sticky', top: 80 }}>
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Categories</p>
            </div>
            {CATEGORIES.map(({ key, emoji, label }) => {
              const count = categoryCounts[key] ?? 0;
              const active = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors"
                  style={{
                    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
                    cursor: 'pointer',
                    border: 'none',
                    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{emoji}</span>
                  <span
                    className="flex-1 text-sm"
                    style={{ color: active ? '#6366f1' : 'var(--text)', fontWeight: active ? 600 : 400 }}
                  >
                    {label}
                  </span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: active ? '#6366f1' : 'var(--border)', color: active ? '#fff' : 'var(--muted)', fontWeight: 600 }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Source status */}
          {sourceStats.length > 0 && (
            <div className="mt-4 rounded-2xl border p-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Sources</p>
              {sourceStats.map((s) => (
                <div key={s.source} className="flex items-center justify-between py-0.5">
                  <span className="text-[11px] flex items-center gap-1" style={{ color: s.ok ? 'var(--text)' : '#ef4444' }}>
                    <span style={{ color: s.ok ? '#22c55e' : '#ef4444', fontSize: 8 }}>●</span>
                    {s.source}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Personalize CTA */}
          {!prefs && !loading && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 w-full p-3 rounded-2xl text-left transition-all"
              style={{
                background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))',
                border: '1.5px dashed rgba(99,102,241,0.4)',
                cursor: 'pointer',
              }}
            >
              <p className="text-xs font-semibold" style={{ color: '#6366f1' }}>Personalize feed</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>Rank trends for your role</p>
            </button>
          )}
          {prefs && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 w-full p-3 rounded-2xl text-left transition-all"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}
            >
              <p className="text-xs font-semibold" style={{ color: '#6366f1' }}>
                {ROLE_CONFIG[prefs.role].emoji} {ROLE_CONFIG[prefs.role].label}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>Edit preferences</p>
            </button>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm" style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' }}>
              {error}
            </div>
          )}

          {loading ? (
            <>
              <div className="skeleton h-4 w-28 rounded mb-4" />
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {Array.from({ length: 9 }).map((_, i) => <SkeletonFeatured key={i} />)}
              </div>
            </>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p className="font-medium">No trends match this filter</p>
              <button
                onClick={() => { setActiveSource('all'); setActiveCategory('all'); }}
                className="mt-3 text-sm underline"
                style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Top Trends */}
              {displayForYou.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="live-dot" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                      {prefs
                        ? `For You — ${ROLE_CONFIG[prefs.role].emoji} ${ROLE_CONFIG[prefs.role].label}`
                        : 'Top Trends'}
                    </h2>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>({displayForYou.length})</span>
                  </div>
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {displayForYou.map((t) => (
                      <TrendCard key={t.id} trend={t} />
                    ))}
                  </div>
                </section>
              )}

              {/* More Trends */}
              {displayMore.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      {prefs ? 'Less Relevant to You' : 'More Trends'}
                    </h2>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>({displayMore.length})</span>
                  </div>
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {displayMore.map((t) => (
                      <TrendCard key={t.id} trend={t} dim={!!prefs} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {showModal && (
        <PersonalizeModal
          initial={prefs}
          onSave={handleSavePrefs}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
