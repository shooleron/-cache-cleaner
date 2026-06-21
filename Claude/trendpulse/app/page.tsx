'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Trend, TrendSource, TrendCategory, TrendsResponse, TrendInsight, AIAnalysis } from '@/lib/types';
import { UserPreferences, loadPreferences, savePreferences, splitByRelevance } from '@/lib/personalization';
import Header from '@/components/Header';
import TrendCard from '@/components/FeaturedCard';
import PersonalizeModal from '@/components/PersonalizeModal';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

const CARD_WIDTH = 380;
const CARD_GAP = 16;

function HotSlider({ trends }: { trends: Trend[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  function scrollTo(i: number) {
    const clamped = Math.max(0, Math.min(i, trends.length - 1));
    setIdx(clamped);
    ref.current?.scrollTo({ left: clamped * (CARD_WIDTH + CARD_GAP), behavior: 'smooth' });
  }

  function onScroll() {
    if (!ref.current) return;
    const i = Math.round(ref.current.scrollLeft / (CARD_WIDTH + CARD_GAP));
    setIdx(i);
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Scroll track */}
      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          display: 'flex',
          gap: CARD_GAP,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          paddingBottom: 4,
        }}
      >
        {trends.map((tr) => (
          <div key={tr.id} style={{ flex: `0 0 ${CARD_WIDTH}px`, scrollSnapAlign: 'start' }}>
            <TrendCard trend={tr} />
          </div>
        ))}
      </div>

      {/* Arrows */}
      {idx > 0 && (
        <button
          onClick={() => scrollTo(idx - 1)}
          style={{
            position: 'absolute', top: '50%', left: -18, transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--surface)', border: '1.5px solid var(--border)',
            color: 'var(--text)', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-card)', zIndex: 10,
          }}
        >‹</button>
      )}
      {idx < trends.length - 1 && (
        <button
          onClick={() => scrollTo(idx + 1)}
          style={{
            position: 'absolute', top: '50%', right: -18, transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--surface)', border: '1.5px solid var(--border)',
            color: 'var(--text)', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-card)', zIndex: 10,
          }}
        >›</button>
      )}

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {trends.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            style={{
              width: i === idx ? 20 : 6, height: 6, borderRadius: 99,
              background: i === idx ? 'var(--accent-ink)' : 'var(--border)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'width 0.2s ease, background 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}


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


function HeroCover({ trendCount, topTrend }: { trendCount: number; topTrend: Trend | null }) {
  const fallbackImg = topTrend
    ? `https://picsum.photos/seed/${encodeURIComponent(topTrend.id)}/600/400`
    : '';

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        height: 200,
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 40%, #0d1f3c 100%)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Background grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.6,
        }}
      />
      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: -40, left: '15%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.18)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: -60, right: '20%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(244,63,94,0.12)', filter: 'blur(50px)' }} />

      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
        {/* Left: branding + stats */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>🔥</span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
              TrendPulse
            </h1>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
              The Future, Translated
            </span>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(255,255,255,0.55)', maxWidth: 400, lineHeight: 1.5 }}>
            Real-time signals from Hacker News, Reddit, YouTube, Product Hunt, and the web — ranked by AI.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ textAlign: 'center', padding: '7px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{trendCount}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Trends</div>
            </div>
            <div style={{ textAlign: 'center', padding: '7px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#a5b4fc', lineHeight: 1 }}>5</div>
              <div style={{ fontSize: 9, color: 'rgba(165,180,252,0.55)', marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sources</div>
            </div>
            <div style={{ textAlign: 'center', padding: '7px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>Live</span>
              </div>
              <div style={{ fontSize: 9, color: 'rgba(74,222,128,0.45)', marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Updating</div>
            </div>
          </div>
        </div>

        {/* Right: Top Trend card */}
        {topTrend && (
          <Link href={`/trends/${topTrend.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(244,63,94,0.4)',
                borderRadius: 16,
                padding: '10px 14px 10px 10px',
                width: 340,
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              {/* Thumbnail */}
              <div style={{ width: 90, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={topTrend.thumbnail || fallbackImg}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: '#f87171', textTransform: 'uppercase', background: 'rgba(244,63,94,0.2)', padding: '2px 6px', borderRadius: 99 }}>
                    #1 Today
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>{topTrend.score}%</span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.35,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {topTrend.title}
                </p>
                <div style={{ marginTop: 6, width: '100%', height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ width: `${topTrend.score}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #f43f5e, #fb923c)' }} />
                </div>
              </div>
            </div>
          </Link>
        )}
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

  const hotTrends = filtered.filter((t) => t.score >= 70).sort((a, b) => b.score - a.score);
  const regularTrends = filtered.filter((t) => t.score < 70).sort((a, b) => b.score - a.score);

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
        categoryCounts={categoryCounts}
      />

      <HeroCover trendCount={trends.length} topTrend={trends.length ? [...trends].sort((a, b) => b.score - a.score)[0] : null} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px', paddingTop: 20 }}>

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
              {/* Hot Trends — Slider */}
              {hotTrends.length > 0 && (
                <section className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="live-dot" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                      {t.topTrends}
                    </h2>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>({hotTrends.length})</span>
                  </div>
                  <HotSlider trends={hotTrends} />
                </section>
              )}

              {/* Regular Trends */}
              {regularTrends.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      {t.moreTrends}
                    </h2>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>({regularTrends.length})</span>
                  </div>
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {regularTrends.map((tr) => (
                      <TrendCard key={tr.id} trend={tr} />
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
