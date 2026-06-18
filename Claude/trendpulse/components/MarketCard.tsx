'use client';
import Link from 'next/link';
import { Trend, TrendInsight } from '@/lib/types';

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

/** Convert a trend title to a market question */
function toQuestion(title: string): string {
  const t = title.trim().replace(/\?$/, '');
  // If it's already a question-ish (starts with Will/Can/Is/Are/Does/Should)
  if (/^(will|can|is|are|does|should|has|have|did|do)\b/i.test(t)) return t + '?';
  // Otherwise wrap it
  return `Will "${t.length > 60 ? t.slice(0, 60) + '…' : t}" dominate the next cycle?`;
}

function formatVol(raw: number, comments: number): string {
  const v = (raw + comments) * 47; // synthetic $ volume
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function resolveDate(publishedAt: string, score: number): string {
  const base = new Date(publishedAt);
  // Higher score = shorter lifespan (flash trend)
  const days = score > 80 ? 7 : score > 60 ? 21 : score > 40 ? 60 : 180;
  base.setDate(base.getDate() + days);
  return base.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  trend: Trend;
  insight?: TrendInsight;
  index?: number;
  onBuy?: (trend: Trend, side: 'yes' | 'no') => void;
}

export default function MarketCard({ trend, insight, index = 0, onBuy }: Props) {
  const cat = CATEGORY_CONFIG[trend.category] ?? CATEGORY_CONFIG.other;
  const yesProb = trend.score;
  const noProb = 100 - yesProb;
  const question = toQuestion(trend.title);
  const animClass = `anim-up-${Math.min(index, 5)}`;

  return (
    <div
      className={`group rounded-[20px] border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${animClass}`}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: '0 2px 12px rgba(15,15,26,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = cat.color + '55';
        e.currentTarget.style.boxShadow = `0 8px 32px ${cat.color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,15,26,0.06)';
      }}
    >
      {/* Hero image */}
      <Link href={`/markets/${trend.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="relative w-full overflow-hidden" style={{ height: 180 }}>
          {trend.thumbnail ? (
            <img
              src={trend.thumbnail}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: cat.gradient }}>
              <span style={{ fontSize: 64, opacity: 0.35 }}>{cat.emoji}</span>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 100%)' }} />

          {/* Category pill */}
          <div className="absolute top-3 left-3">
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: cat.color + 'cc', color: '#fff', backdropFilter: 'blur(6px)' }}
            >
              {cat.emoji} {trend.category}
            </span>
          </div>

          {/* Volume chip */}
          <div className="absolute top-3 right-3">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(6px)' }}
            >
              {formatVol(trend.rawScore, trend.commentCount)} Vol
            </span>
          </div>

          {/* Yes probability overlay at bottom */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span
              className="text-xl font-black"
              style={{ color: yesProb >= 55 ? '#4ade80' : yesProb <= 35 ? '#f87171' : '#fbbf24', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
            >
              {yesProb}%
            </span>
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
              Yes chance
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="px-4 pt-3 pb-2">
          <p
            className="font-semibold text-sm leading-snug"
            style={{
              color: 'var(--text)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 54,
            }}
          >
            {question}
          </p>
        </div>
      </Link>

      {/* AI insight */}
      {insight?.whyItRising && (
        <p
          className="px-4 pb-2 text-[11px] leading-relaxed"
          style={{
            color: 'var(--muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {insight.whyItRising}
        </p>
      )}

      {/* Probability bar */}
      <div className="px-4 pb-3">
        <div className="flex rounded-full overflow-hidden" style={{ height: 6 }}>
          <div style={{ width: `${yesProb}%`, background: 'linear-gradient(90deg,#22c55e,#4ade80)', transition: 'width 0.6s ease' }} />
          <div style={{ width: `${noProb}%`, background: 'linear-gradient(90deg,#f87171,#ef4444)' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-semibold" style={{ color: '#22c55e' }}>Yes {yesProb}%</span>
          <span className="text-[10px] font-semibold" style={{ color: '#ef4444' }}>No {noProb}%</span>
        </div>
      </div>

      {/* Footer meta */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          {trend.commentCount > 0 && (
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>💬 {trend.commentCount}</span>
          )}
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Ends {resolveDate(trend.publishedAt, trend.score)}
          </span>
        </div>
        {insight?.longevityLabel && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: insight.longevityLabel === 'flash' ? '#ef444418' : insight.longevityLabel === 'long' ? '#22c55e18' : '#6366f118',
              color: insight.longevityLabel === 'flash' ? '#ef4444' : insight.longevityLabel === 'long' ? '#22c55e' : '#6366f1',
            }}
          >
            {insight.longevityLabel === 'flash' ? '⚡ Flash' : insight.longevityLabel === 'short' ? '🔥 Short' : insight.longevityLabel === 'medium' ? '📈 Medium' : '🌱 Long'}
          </span>
        )}
      </div>

      {/* Buy Yes / Buy No buttons */}
      <div className="p-3 pt-0 flex gap-2">
        <button
          onClick={() => onBuy?.(trend, 'yes')}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          style={{
            background: 'rgba(34,197,94,0.12)',
            border: '1.5px solid rgba(34,197,94,0.35)',
            color: '#22c55e',
            cursor: 'pointer',
          }}
        >
          Buy Yes · {yesProb}¢
        </button>
        <button
          onClick={() => onBuy?.(trend, 'no')}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1.5px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            cursor: 'pointer',
          }}
        >
          Buy No · {noProb}¢
        </button>
      </div>
    </div>
  );
}
