'use client';
import Link from 'next/link';
import { Trend, TrendInsight } from '@/lib/types';
import SourceBadge from './SourceBadge';

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string; gradient: string }> = {
  tech:      { emoji: '💻', color: '#6366f1', gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
  ai:        { emoji: '🤖', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #1a0533, #2e1065)' },
  marketing: { emoji: '📣', color: '#f59e0b', gradient: 'linear-gradient(135deg, #1c1100, #451a03)' },
  culture:   { emoji: '🌍', color: '#10b981', gradient: 'linear-gradient(135deg, #022c22, #064e3b)' },
  business:  { emoji: '💼', color: '#3b82f6', gradient: 'linear-gradient(135deg, #0c1a4b, #1e3a8a)' },
  science:   { emoji: '🔬', color: '#06b6d4', gradient: 'linear-gradient(135deg, #0a2030, #0e4163)' },
  design:    { emoji: '🎨', color: '#ec4899', gradient: 'linear-gradient(135deg, #2d0a1e, #5b1a38)' },
  crypto:    { emoji: '₿',  color: '#f97316', gradient: 'linear-gradient(135deg, #1c0a00, #431407)' },
  other:     { emoji: '📌', color: '#6b7280', gradient: 'linear-gradient(135deg, #111, #222)' },
};

function formatVolume(raw: number, comments: number): string {
  const total = raw + comments;
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `${(total / 1_000).toFixed(1)}K`;
  return `${total}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  trend: Trend;
  insight?: TrendInsight;
  index?: number;
}

export default function PolyCard({ trend, insight, index = 0 }: Props) {
  const cat = CATEGORY_CONFIG[trend.category] ?? CATEGORY_CONFIG.other;
  const momentum = trend.score; // 0-100
  const rising = momentum >= 55;
  const cooling = momentum < 35;
  const statusColor = rising ? '#22c55e' : cooling ? '#ef4444' : '#f59e0b';
  const statusLabel = rising ? 'Rising' : cooling ? 'Cooling' : 'Stable';
  const animClass = `anim-up-${Math.min(index, 5)}`;

  return (
    <Link
      href={`/trends/${trend.id}`}
      className={`group block ${animClass}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="h-full rounded-[18px] border overflow-hidden transition-all duration-200 hover:-translate-y-1"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 2px 12px rgba(15,15,26,0.06)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = cat.color + '55';
          e.currentTarget.style.boxShadow = `0 8px 32px ${cat.color}22`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,15,26,0.06)';
        }}
      >
        {/* Image / Gradient hero */}
        <div className="relative w-full overflow-hidden" style={{ height: 170 }}>
          {trend.thumbnail ? (
            <img
              src={trend.thumbnail}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: cat.gradient }}
            >
              <span style={{ fontSize: 56, opacity: 0.4 }}>{cat.emoji}</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)' }}
          />
          {/* Category badge — top left */}
          <div className="absolute top-3 left-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: cat.color + 'cc', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
              {cat.emoji} {trend.category}
            </span>
          </div>
          {/* Momentum badge — top right */}
          <div className="absolute top-3 right-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', color: statusColor, backdropFilter: 'blur(4px)', border: `1px solid ${statusColor}55` }}
            >
              {momentum}%
            </span>
          </div>
          {/* Source badge — bottom left */}
          <div className="absolute bottom-3 left-3">
            <SourceBadge source={trend.source} />
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Title */}
          <h3
            className="font-semibold text-sm leading-snug mb-3"
            style={{ color: 'var(--text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {trend.title}
          </h3>

          {/* AI insight */}
          {insight?.whyItRising && (
            <p
              className="text-xs leading-relaxed mb-3"
              style={{ color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {insight.whyItRising}
            </p>
          )}

          {/* Polymarket-style outcome row */}
          <div
            className="flex items-center justify-between mb-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--bg)' }}
          >
            <div className="flex items-center gap-2">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block', flexShrink: 0 }} />
              <span className="text-xs font-semibold" style={{ color: statusColor }}>
                {statusLabel}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold" style={{ color: statusColor }}>{momentum}%</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>|</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{100 - momentum}%</span>
            </div>
          </div>

          {/* Probability bar */}
          <div className="relative w-full rounded-full overflow-hidden mb-3" style={{ height: 5, background: 'rgba(239,68,68,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${momentum}%`, background: `linear-gradient(90deg, ${statusColor}, ${statusColor}aa)` }}
            />
          </div>

          {/* Footer — volume, comments, time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                Vol {formatVolume(trend.rawScore, trend.commentCount)}
              </span>
              {trend.commentCount > 0 && (
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  💬 {trend.commentCount}
                </span>
              )}
            </div>
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
              {timeAgo(trend.publishedAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
