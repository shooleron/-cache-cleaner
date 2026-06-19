'use client';
import { useState, useEffect, useCallback } from 'react';
import { Trend, TrendSource, TrendCategory, TrendsResponse, TrendInsight, AIAnalysis } from '@/lib/types';
import { UserPreferences, loadPreferences, savePreferences, splitByRelevance, ROLE_CONFIG } from '@/lib/personalization';
import Header from '@/components/Header';
import TrendCard from '@/components/FeaturedCard';
import PersonalizeModal from '@/components/PersonalizeModal';
import { useLang } from '@/lib/i18n';

const CATEGORY_KEYS: { key: TrendCategory | 'all'; emoji: string }[] = [
  { key: 'all',       emoji: '🔥' },
  { key: 'tech',      emoji: '💻' },
  { key: 'ai',        emoji: '🤖' },
  { key: 'marketing', emoji: '📣' },
  { key: 'business',  emoji: '💼' },
  { key: 'science',   emoji: '🔬' },
  { key: 'design',    emoji: '🎨' },
  { key: 'crypto',    emoji: '₿'  },
  { key: 'culture',   emoji: '🌍' },
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
  const { t } = useLang();
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

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px', paddingTop: 20 }}>

        {/* Top category bar */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {CATEGORY_KEYS.map(({ key, emoji }) => {
            const count = categoryCounts[key] ?? 0;
            const active = activeCategory === key;
            const label = t.categories[key as keyof typeof t.categories];
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: active ? 'var(--accent-ink)' : 'var(--surface)',
                  color: active ? '#fff' : 'var(--text)',
                  border: active ? '1px solid var(--accent-ink)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  boxShadow: active ? '0 2px 8px rgba(109,112,224,0.3)' : 'none',
                }}
              >
                <span style={{ fontSize: 13 }}>{emoji}</span>
                {label}
                {count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: active ? 'rgba(255,255,255,0.25)' : 'var(--border)', color: active ? '#fff' : 'var(--muted)' }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          {prefs && (
            <button
              onClick={() => setShowModal(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-border)', color: 'var(--accent-ink)', cursor: 'pointer' }}
            >
              {ROLE_CONFIG[prefs.role].emoji} {ROLE_CONFIG[prefs.role].label}
            </button>
          )}
          {!prefs && !loading && (
            <button
              onClick={() => setShowModal(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{ background: 'var(--accent-light)', border: '1.5px dashed var(--accent-border)', color: 'var(--accent-ink)', cursor: 'pointer' }}
            >
              {t.personalize}
            </button>
          )}
        </div>

        {/* Main content */}
        <main>
          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm" style={{ background: 'var(--no-tint)', border: '1px solid var(--no-border)', color: 'var(--no-ink)' }}>
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
              <p className="font-medium">{t.noTrends}</p>
              <button
                onClick={() => { setActiveSource('all'); setActiveCategory('all'); }}
                className="mt-3 text-sm underline"
                style={{ color: 'var(--accent-ink)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {t.clearFilters}
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
                        ? `${t.forYou} — ${ROLE_CONFIG[prefs.role].emoji} ${ROLE_CONFIG[prefs.role].label}`
                        : t.topTrends}
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
                      {prefs ? t.lessRelevant : t.moreTrends}
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
