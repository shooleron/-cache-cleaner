'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Trend, TrendsResponse } from '@/lib/types';
import PriceChart from '@/components/PriceChart';
import MarketCard from '@/components/MarketCard';

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

function toQuestion(title: string): string {
  const t = title.trim().replace(/\?$/, '');
  if (/^(will|can|is|are|does|should|has|have|did|do)\b/i.test(t)) return t + '?';
  return `Will "${t.length > 70 ? t.slice(0, 70) + '…' : t}" dominate the next cycle?`;
}

function formatVol(raw: number, comments: number): string {
  const v = (raw + comments) * 47;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function resolveDate(publishedAt: string, score: number): string {
  const base = new Date(publishedAt);
  const days = score > 80 ? 7 : score > 60 ? 21 : score > 40 ? 60 : 180;
  base.setDate(base.getDate() + days);
  return base.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Simulated recent activity feed */
function generateActivity(trend: Trend) {
  const actions = ['bought Yes', 'bought No', 'sold Yes', 'sold No'];
  const names = ['0x4f…a2', 'trader_92', 'mkr.eth', 'anon_x', 'pulse_user', '0xf1…99', 'trends_dao'];
  const rng = (s: number) => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  return Array.from({ length: 8 }, (_, i) => {
    const r1 = rng(i * 13 + trend.score);
    const r2 = rng(i * 7 + 11);
    const r3 = rng(i * 31 + 3);
    const side = trend.score > 50 ? (r1 > 0.25 ? 'Yes' : 'No') : (r1 > 0.6 ? 'Yes' : 'No');
    const action = r2 > 0.7 ? `sold ${side}` : `bought ${side}`;
    const amount = Math.round(10 + r3 * 490);
    const minsAgo = Math.round(1 + i * r2 * 45);
    const user = names[Math.floor(r1 * names.length)];
    const isYes = action.includes('Yes');
    return { user, action, amount, minsAgo, isYes };
  });
}

export default function MarketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [trend, setTrend] = useState<Trend | null>(null);
  const [related, setRelated] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('50');
  const [bought, setBought] = useState<{ side: 'yes' | 'no'; shares: number; spent: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'activity' | 'resolution'>('chart');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      const data: TrendsResponse = await res.json();
      const found = data.trends.find((t) => t.id === id) ?? data.trends[0];
      setTrend(found);
      setRelated(
        data.trends
          .filter((t) => t.id !== found.id && t.category === found.category)
          .slice(0, 3)
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !trend) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
          <div className="skeleton h-8 w-32 rounded-lg mb-6" />
          <div className="skeleton w-full rounded-2xl mb-6" style={{ height: 300 }} />
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-48 w-full rounded-2xl" />
            </div>
            <div className="skeleton rounded-2xl" style={{ height: 280 }} />
          </div>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_CONFIG[trend.category] ?? CATEGORY_CONFIG.other;
  const yesProb = trend.score;
  const noProb = 100 - yesProb;
  const question = toQuestion(trend.title);
  const activity = generateActivity(trend);
  const sharesOut = Math.round(parseFloat(amount || '0') / (yesProb / 100));
  const seedNum = trend.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rising = yesProb >= 55;
  const cooling = yesProb < 35;
  const statusColor = rising ? '#22c55e' : cooling ? '#ef4444' : '#f59e0b';

  function handleBuy() {
    const spent = parseFloat(amount || '0');
    if (!spent) return;
    setBought({ side, shares: Math.round(spent / ((side === 'yes' ? yesProb : noProb) / 100)), spent });
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Compact header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1.5px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-4">
            <Link href="/markets" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13 }}>
              ← Markets
            </Link>
            <span style={{ color: 'var(--border)' }}>/</span>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)', maxWidth: 300 }}>
              {trend.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${statusColor}18`, color: statusColor }}>
              {yesProb}% Yes
            </span>
            <a
              href={trend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--muted)', textDecoration: 'none' }}
            >
              Source ↗
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        {/* Hero image */}
        <div className="relative w-full rounded-[22px] overflow-hidden mb-6" style={{ height: 260 }}>
          {trend.thumbnail ? (
            <img src={trend.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: cat.gradient }}>
              <span style={{ fontSize: 80, opacity: 0.25 }}>{cat.emoji}</span>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)' }} />

          {/* Overlay content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cat.color + 'cc', color: '#fff', backdropFilter: 'blur(6px)' }}>
                {cat.emoji} {trend.category}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(6px)' }}>
                {formatVol(trend.rawScore, trend.commentCount)} Vol
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>MARKET QUESTION</p>
              <h1 className="text-xl font-bold leading-snug" style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                {question}
              </h1>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="flex gap-6 items-start">
          {/* Left: Chart + Tabs */}
          <div className="flex-1 min-w-0">
            {/* Probability summary */}
            <div className="flex items-center gap-4 mb-4 p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: '#22c55e' }}>Yes</p>
                <p className="text-3xl font-black" style={{ color: '#22c55e' }}>{yesProb}%</p>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex rounded-full overflow-hidden" style={{ height: 10 }}>
                  <div style={{ width: `${yesProb}%`, background: 'linear-gradient(90deg,#16a34a,#4ade80)', transition: 'width 0.6s ease' }} />
                  <div style={{ width: `${noProb}%`, background: 'linear-gradient(90deg,#dc2626,#f87171)' }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>Yes {yesProb}¢</span>
                  <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>No {noProb}¢</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: '#ef4444' }}>No</p>
                <p className="text-3xl font-black" style={{ color: '#ef4444' }}>{noProb}%</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4">
              {(['chart', 'activity', 'resolution'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{
                    background: activeTab === tab ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: `1.5px solid ${activeTab === tab ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                    color: activeTab === tab ? '#6366f1' : 'var(--muted)',
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'chart' ? '📈 Chart' : tab === 'activity' ? '⚡ Activity' : '📋 Resolution'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
              {activeTab === 'chart' && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Yes probability — 30 days</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${statusColor}18`, color: statusColor }}>
                      {rising ? '↑ Rising' : cooling ? '↓ Cooling' : '→ Stable'}
                    </span>
                  </div>
                  <PriceChart yesProb={yesProb} seed={seedNum} height={200} />
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: a.isYes ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: a.isYes ? '#22c55e' : '#ef4444' }}
                        >
                          {a.isYes ? 'YES' : 'NO'}
                        </span>
                        <span className="text-sm font-mono" style={{ color: 'var(--muted)' }}>{a.user}</span>
                        <span className="text-sm" style={{ color: 'var(--text)' }}>{a.action}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>${a.amount}</span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>{a.minsAgo}m ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'resolution' && (
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6366f1' }}>Resolution Date</p>
                    <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{resolveDate(trend.publishedAt, trend.score)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6366f1' }}>Resolution Criteria</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                      This market resolves YES if "{trend.title}" reaches mainstream adoption,
                      defined as sustained coverage across 3+ major media outlets and a heat score
                      above 85 for 7 consecutive days. Otherwise resolves NO.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6366f1' }}>Source</p>
                    <a href={trend.url} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: '#6366f1' }}>
                      {trend.source} ↗
                    </a>
                  </div>
                  {trend.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6366f1' }}>Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {trend.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Related markets */}
            {related.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Related Markets</p>
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {related.map((t, i) => (
                    <MarketCard key={t.id} trend={t} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Order panel */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', position: 'sticky', top: 80 }}>
              <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Place Order</p>
              </div>

              {bought ? (
                <div className="p-5 text-center space-y-3">
                  <div className="text-4xl">{bought.side === 'yes' ? '🟢' : '🔴'}</div>
                  <p className="font-bold" style={{ color: 'var(--text)' }}>Order Placed!</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {bought.shares} shares of <strong style={{ color: bought.side === 'yes' ? '#22c55e' : '#ef4444' }}>
                      {bought.side.toUpperCase()}
                    </strong> for <strong>${bought.spent}</strong>
                  </p>
                  <div className="p-3 rounded-xl text-xs" style={{ background: 'var(--bg)', color: 'var(--muted)' }}>
                    Avg price: {bought.side === 'yes' ? yesProb : noProb}¢ · Max payout: ${bought.shares}
                  </div>
                  <button
                    onClick={() => setBought(null)}
                    className="w-full py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--muted)', cursor: 'pointer' }}
                  >
                    New Order
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {/* Yes / No toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSide('yes')}
                      className="py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: side === 'yes' ? 'rgba(34,197,94,0.15)' : 'var(--bg)',
                        border: `2px solid ${side === 'yes' ? '#22c55e' : 'var(--border)'}`,
                        color: side === 'yes' ? '#22c55e' : 'var(--muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Yes · {yesProb}¢
                    </button>
                    <button
                      onClick={() => setSide('no')}
                      className="py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: side === 'no' ? 'rgba(239,68,68,0.12)' : 'var(--bg)',
                        border: `2px solid ${side === 'no' ? '#ef4444' : 'var(--border)'}`,
                        color: side === 'no' ? '#ef4444' : 'var(--muted)',
                        cursor: 'pointer',
                      }}
                    >
                      No · {noProb}¢
                    </button>
                  </div>

                  {/* Amount input */}
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted)' }}>
                      Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--muted)' }}>$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-semibold outline-none"
                        style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    {/* Quick amounts */}
                    <div className="flex gap-1.5 mt-2">
                      {['10', '25', '50', '100'].map((v) => (
                        <button
                          key={v}
                          onClick={() => setAmount(v)}
                          className="flex-1 py-1 rounded-lg text-[11px] font-semibold"
                          style={{
                            background: amount === v ? 'rgba(99,102,241,0.1)' : 'var(--bg)',
                            border: `1px solid ${amount === v ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                            color: amount === v ? '#6366f1' : 'var(--muted)',
                            cursor: 'pointer',
                          }}
                        >
                          ${v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Order summary */}
                  <div className="p-3 rounded-xl space-y-1.5" style={{ background: 'var(--bg)' }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Avg price</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{side === 'yes' ? yesProb : noProb}¢</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Shares</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{isNaN(sharesOut) ? '—' : sharesOut}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Max payout</span>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>${isNaN(sharesOut) ? '—' : sharesOut}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--muted)' }}>Potential return</span>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>
                        +{((100 / (side === 'yes' ? yesProb : noProb) - 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBuy}
                    disabled={!parseFloat(amount)}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: side === 'yes' ? '#22c55e' : '#ef4444',
                      color: '#fff',
                      border: 'none',
                      cursor: parseFloat(amount) ? 'pointer' : 'not-allowed',
                      opacity: parseFloat(amount) ? 1 : 0.5,
                    }}
                  >
                    Buy {side === 'yes' ? 'Yes' : 'No'} · ${amount || '0'}
                  </button>

                  <p className="text-[10px] text-center" style={{ color: 'var(--muted)' }}>
                    Simulated market — no real funds
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
