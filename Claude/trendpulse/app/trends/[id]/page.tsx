'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Trend, AIAnalysis, TrendsResponse, TrendInsight } from '@/lib/types';
import PriceChart from '@/components/PriceChart';

const CATEGORY_CONFIG: Record<string, { color: string; gradient: string; emoji: string }> = {
  tech:      { color: '#6366f1', gradient: 'linear-gradient(135deg,#1e1b4b,#312e81)', emoji: '💻' },
  ai:        { color: '#8b5cf6', gradient: 'linear-gradient(135deg,#1a0533,#2e1065)', emoji: '🤖' },
  marketing: { color: '#f59e0b', gradient: 'linear-gradient(135deg,#1c1100,#451a03)', emoji: '📣' },
  culture:   { color: '#10b981', gradient: 'linear-gradient(135deg,#022c22,#064e3b)', emoji: '🌍' },
  business:  { color: '#3b82f6', gradient: 'linear-gradient(135deg,#0c1a4b,#1e3a8a)', emoji: '💼' },
  science:   { color: '#06b6d4', gradient: 'linear-gradient(135deg,#0a2030,#0e4163)', emoji: '🔬' },
  design:    { color: '#ec4899', gradient: 'linear-gradient(135deg,#2d0a1e,#5b1a38)', emoji: '🎨' },
  crypto:    { color: '#f97316', gradient: 'linear-gradient(135deg,#1c0a00,#431407)', emoji: '₿' },
  other:     { color: '#6b7280', gradient: 'linear-gradient(135deg,#111,#222)',       emoji: '📌' },
};

const SOURCE_LABELS: Record<string, string> = {
  hackernews: '🟠 Hacker News',
  reddit: '🔴 Reddit',
  youtube: '▶ YouTube',
  rss: '📰 News',
  producthunt: '🚀 Product Hunt',
};

const LONGEVITY: Record<string, { label: string; color: string; desc: string }> = {
  flash:  { label: '⚡ Flash',  color: '#ef4444', desc: 'Hours to a couple days' },
  short:  { label: '🔥 Short',  color: '#f59e0b', desc: '1–7 days' },
  medium: { label: '📈 Medium', color: '#6366f1', desc: '1–4 weeks' },
  long:   { label: '🌱 Long',   color: '#22c55e', desc: '1 month+' },
};

function MomentumRing({ score, color }: { score: number; color: string }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width={110} height={110} viewBox="0 0 110 110">
      <circle cx={55} cy={55} r={r} fill="none" stroke="var(--border)" strokeWidth={8} />
      <circle
        cx={55} cy={55} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x={55} y={50} textAnchor="middle" fontSize={22} fontWeight="800" fill={color}>{score}</text>
      <text x={55} y={67} textAnchor="middle" fontSize={10} fill="var(--muted-hex,#888)">/ 100</text>
    </svg>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

export default function TrendDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [trend, setTrend] = useState<Trend | null>(null);
  const [insight, setInsight] = useState<TrendInsight | null>(null);
  const [related, setRelated] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'momentum' | 'insights' | 'ideas' | 'read'>('momentum');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      const data: TrendsResponse = await res.json();
      const found = data.trends.find((t) => t.id === id) ?? data.trends[0];
      setTrend(found);
      setRelated(data.trends.filter((t) => t.id !== found.id && t.category === found.category).slice(0, 4));

      // Run AI analysis
      setAnalyzing(true);
      try {
        const aRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trends: [found] }),
        });
        const aData: AIAnalysis = await aRes.json();
        if (aData.topTrends?.[0]) setInsight(aData.topTrends[0]);
      } catch { /* silent */ }
      setAnalyzing(false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !trend) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px' }}>
          <div className="skeleton h-6 w-24 rounded-lg mb-8" />
          <div className="skeleton w-full rounded-3xl mb-6" style={{ height: 320 }} />
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 260px' }}>
            <div className="space-y-3">
              <div className="skeleton h-7 w-4/5 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
            <div className="skeleton rounded-2xl" style={{ height: 220 }} />
          </div>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_CONFIG[trend.category] ?? CATEGORY_CONFIG.other;
  const score = trend.score;
  const rising = score >= 55;
  const cooling = score < 35;
  const statusColor = rising ? '#22c55e' : cooling ? '#ef4444' : '#f59e0b';
  const statusLabel = rising ? 'Rising' : cooling ? 'Cooling' : 'Stable';
  const lon = insight?.longevityLabel ? LONGEVITY[insight.longevityLabel] : null;
  const seedNum = trend.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1.5px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              ← Feed
            </Link>
            <span style={{ color: 'var(--border)' }}>/</span>
            <span
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--text)' }}
            >
              {trend.title}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}
            >
              {statusLabel} {score}
            </span>
            <a
              href={trend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--muted)', textDecoration: 'none' }}
            >
              Read Source ↗
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 920, margin: '0 auto', padding: '28px 24px' }}>
        {/* Hero */}
        <div className="relative w-full rounded-[24px] overflow-hidden mb-7" style={{ height: 300 }}>
          <img
            src={trend.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(trend.id)}/1200/600`}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.75) 100%)' }} />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cat.color + 'cc', color: '#fff', backdropFilter: 'blur(6px)' }}>
              {cat.emoji} {trend.category}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(6px)' }}>
              {SOURCE_LABELS[trend.source] ?? trend.source}
            </span>
          </div>

          {/* Momentum badge top right */}
          <div className="absolute top-4 right-4">
            <span
              className="text-sm font-black px-3 py-1.5 rounded-full"
              style={{ background: `${statusColor}dd`, color: '#fff', backdropFilter: 'blur(6px)', boxShadow: `0 0 16px ${statusColor}60` }}
            >
              {score} Heat
            </span>
          </div>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-2xl font-bold leading-snug" style={{ color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              {trend.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{timeAgo(trend.publishedAt)}</span>
              {trend.rawScore > 0 && (
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {formatCount(trend.rawScore)} points
                </span>
              )}
              {trend.commentCount > 0 && (
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  💬 {formatCount(trend.commentCount)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body grid */}
        <div className="flex gap-6 items-start">
          {/* Left: main content */}
          <div className="flex-1 min-w-0">

            {/* Tabs */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {([
                { key: 'momentum', label: '📈 Momentum' },
                { key: 'read',     label: '📖 Read' },
                { key: 'insights', label: '🧠 AI Insights' },
                { key: 'ideas',    label: '💡 Content Ideas' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: activeTab === key ? cat.color + '15' : 'transparent',
                    border: `1.5px solid ${activeTab === key ? cat.color + '55' : 'var(--border)'}`,
                    color: activeTab === key ? cat.color : 'var(--muted)',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                  {key === 'read' && trend.fullContent && (
                    <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: cat.color, color: '#fff' }}>
                      FULL
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab: Momentum chart */}
            {activeTab === 'momentum' && (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Heat score — 30 days</p>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${statusColor}18`, color: statusColor }}>
                      {rising ? '↑ Rising' : cooling ? '↓ Cooling' : '→ Stable'}
                    </span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
                    Momentum index based on engagement, growth rate, and cross-platform signals
                  </p>
                  <PriceChart yesProb={score} seed={seedNum} height={190} />
                </div>

                {/* Signals */}
                <div className="grid grid-cols-3 divide-x" style={{ borderTop: '1.5px solid var(--border)', borderColor: 'var(--border)' }}>
                  {[
                    { label: 'Engagement', value: formatCount(trend.rawScore), sub: 'points / views' },
                    { label: 'Discussions', value: formatCount(trend.commentCount), sub: 'comments' },
                    { label: 'Heat Score', value: `${score}/100`, sub: statusLabel },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 text-center" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--muted)' }}>{stat.label}</p>
                      <p className="text-xl font-black" style={{ color: 'var(--text)' }}>{stat.value}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Read */}
            {activeTab === 'read' && (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                {/* Credits bar */}
                <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--bg)' }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    {trend.publication && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: cat.color + '18', color: cat.color, border: `1px solid ${cat.color}30` }}>
                        {trend.publication}
                      </span>
                    )}
                    {trend.domain && (
                      <a href={trend.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
                        {trend.domain}
                      </a>
                    )}
                    {trend.author && (
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>
                        By <strong style={{ color: 'var(--text)' }}>{trend.author}</strong>
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{timeAgo(trend.publishedAt)}</span>
                  </div>
                  <a
                    href={trend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: cat.color, color: '#fff', textDecoration: 'none' }}
                  >
                    Open Original ↗
                  </a>
                </div>

                {/* Content */}
                <div className="px-6 py-6" style={{ maxWidth: 680 }}>
                  {trend.fullContent ? (
                    <>
                      {trend.description && (
                        <p className="text-base font-semibold leading-relaxed mb-5" style={{ color: 'var(--text)', borderLeft: `3px solid ${cat.color}`, paddingLeft: 16 }}>
                          {trend.description}
                        </p>
                      )}
                      <div
                        className="text-sm leading-[1.85] space-y-4"
                        style={{ color: 'var(--text)' }}
                      >
                        {trend.fullContent.split(/\n{2,}|\. {2,}/).filter(p => p.trim().length > 60).map((para, i) => (
                          <p key={i}>{para.trim()}</p>
                        ))}
                      </div>
                    </>
                  ) : trend.description ? (
                    <>
                      <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text)' }}>
                        {trend.description}
                      </p>
                      <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 20 }}>📰</span>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Full article available at source</p>
                          <a href={trend.url} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: cat.color }}>
                            {trend.domain || trend.url}
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <span style={{ fontSize: 32 }}>📄</span>
                      <p className="text-sm mt-3 mb-4" style={{ color: 'var(--muted)' }}>
                        Full content not available in feed — read at source
                      </p>
                      <a
                        href={trend.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold px-4 py-2 rounded-xl"
                        style={{ background: cat.color, color: '#fff', textDecoration: 'none' }}
                      >
                        Read at {trend.domain || 'Source'} ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Credits footer */}
                <div className="px-6 py-4 mt-2" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Credits & Sources</p>
                  <div className="space-y-1">
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Content sourced from{' '}
                      <a href={trend.url} target="_blank" rel="noopener noreferrer" style={{ color: cat.color, fontWeight: 600 }}>
                        {trend.publication || trend.domain || trend.source}
                      </a>
                      {trend.author && <> · Written by <strong style={{ color: 'var(--text)' }}>{trend.author}</strong></>}
                      {' '}· Published {timeAgo(trend.publishedAt)}
                    </p>
                    {trend.hnId && (
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        Discussed on{' '}
                        <a href={`https://news.ycombinator.com/item?id=${trend.hnId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#f97316', fontWeight: 600 }}>
                          Hacker News
                        </a>
                        {' '}· {formatCount(trend.commentCount)} comments · {formatCount(trend.rawScore)} points
                      </p>
                    )}
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Trend data aggregated by TrendPulse · Heat score: {trend.score}/100
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: AI Insights */}
            {activeTab === 'insights' && (
              <div className="space-y-3">
                {analyzing && (
                  <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                    <div className="text-2xl mb-2">🧠</div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Analyzing trend...</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>AI is processing signals</p>
                  </div>
                )}

                {insight ? (
                  <>
                    {insight.whyItRising && (
                      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                        <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: cat.color }}>Why It's Rising</p>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{insight.whyItRising}</p>
                      </div>
                    )}
                    {insight.audienceMatch && (
                      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                        <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: cat.color }}>Target Audience</p>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{insight.audienceMatch}</p>
                      </div>
                    )}
                    {lon && (
                      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                        <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: cat.color }}>Trend Lifespan</p>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black" style={{ color: lon.color }}>{lon.label}</span>
                          <span className="text-sm" style={{ color: 'var(--muted)' }}>{lon.desc}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : !analyzing && (
                  <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>No AI analysis available for this trend yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Content Ideas */}
            {activeTab === 'ideas' && (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                {analyzing ? (
                  <div className="p-6 text-center">
                    <div className="text-2xl mb-2">💡</div>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Generating ideas...</p>
                  </div>
                ) : insight?.contentIdeas?.length ? (
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {insight.contentIdeas.map((idea, i) => (
                      <div key={i} className="flex items-start gap-4 p-4">
                        <span
                          className="text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: cat.color + '18', color: cat.color }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{idea}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Content ideas will appear after AI analysis.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {trend.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {trend.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Related trends */}
            {related.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>
                  More in {cat.emoji} {trend.category}
                </p>
                <div className="space-y-2">
                  {related.map((t) => (
                    <Link
                      key={t.id}
                      href={`/trends/${t.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all"
                      style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', textDecoration: 'none', display: 'flex' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color + '44'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <img
                        src={t.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(t.id)}/200/150`}
                        alt=""
                        className="rounded-lg object-cover shrink-0"
                        style={{ width: 52, height: 38 }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{t.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{timeAgo(t.publishedAt)} · {t.score} heat</p>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: (t.score >= 55 ? '#22c55e' : t.score < 35 ? '#ef4444' : '#f59e0b') + '18', color: t.score >= 55 ? '#22c55e' : t.score < 35 ? '#ef4444' : '#f59e0b' }}
                      >
                        {t.score}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar: momentum ring + meta */}
          <div style={{ width: 250, flexShrink: 0 }}>
            {/* Momentum ring */}
            <div
              className="rounded-2xl p-5 text-center mb-4"
              style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', position: 'sticky', top: 74 }}
            >
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--muted)' }}>
                Momentum
              </p>
              <div className="flex justify-center mb-3">
                <MomentumRing score={score} color={statusColor} />
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: statusColor }}>{statusLabel}</p>
              {lon && (
                <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Lifespan: {lon.desc}</p>
              )}

              <a
                href={trend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all"
                style={{ background: cat.color, color: '#fff', textDecoration: 'none', marginBottom: 8 }}
              >
                Read Original ↗
              </a>

              {/* Credits block */}
              <div className="mt-3 pt-3 text-left" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--muted)' }}>Credits</p>
                {trend.publication && (
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{trend.publication}</p>
                )}
                {trend.domain && (
                  <a href={trend.url} target="_blank" rel="noopener noreferrer" className="text-[11px] block mb-1" style={{ color: cat.color, textDecoration: 'none', fontFamily: 'monospace' }}>
                    {trend.domain}
                  </a>
                )}
                {trend.hnId && (
                  <a href={`https://news.ycombinator.com/item?id=${trend.hnId}`} target="_blank" rel="noopener noreferrer" className="text-[11px] block" style={{ color: '#f97316', textDecoration: 'none' }}>
                    🟠 HN Discussion ↗
                  </a>
                )}
              </div>

              {/* Meta */}
              <div className="space-y-2 mt-3 text-left">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>Source</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{SOURCE_LABELS[trend.source]?.replace(/^[\S]+ /, '') ?? trend.source}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>Category</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{cat.emoji} {trend.category}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>Published</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{timeAgo(trend.publishedAt)}</span>
                </div>
                {trend.commentCount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--muted)' }}>Comments</span>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>💬 {formatCount(trend.commentCount)}</span>
                  </div>
                )}
                {trend.author && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--muted)' }}>Author</span>
                    <span className="truncate ml-2" style={{ color: 'var(--text)', fontWeight: 600, maxWidth: 110 }}>{trend.author}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
