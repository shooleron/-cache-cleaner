'use client';
import Link from 'next/link';
import { Trend, TrendInsight } from '@/lib/types';
import SourceBadge from './SourceBadge';
import HeatBar from './HeatBar';

const CATEGORY_EMOJI: Record<string, string> = {
  tech: '💻', ai: '🤖', marketing: '📣', culture: '🌍',
  business: '💼', science: '🔬', design: '🎨', crypto: '₿', other: '📌',
};

const LONGEVITY_CONFIG = {
  flash:  { label: 'Flash', color: '#ef4444', emoji: '⚡' },
  short:  { label: '1-7d',  color: '#f59e0b', emoji: '🔥' },
  medium: { label: '1-4w',  color: '#6366f1', emoji: '📈' },
  long:   { label: '1m+',   color: '#22c55e', emoji: '🌱' },
};

interface Props {
  trend: Trend;
  insight?: TrendInsight;
  featured?: boolean;
  index?: number;
}

function formatScore(score: number, source: string): string {
  if (score === 0) return '';
  if (source === 'youtube' && score > 10000) return `${(score / 1000).toFixed(0)}K views`;
  if (score > 1000) return `${(score / 1000).toFixed(1)}K pts`;
  return `${score} pts`;
}

export default function TrendCard({ trend, insight, featured, index = 0 }: Props) {
  const animClass = `anim-up-${Math.min(index, 5)}`;
  const longevity = insight?.longevityLabel ? LONGEVITY_CONFIG[insight.longevityLabel] : null;

  return (
    <Link
      href={`/trends/${trend.id}`}
      className={`group block ${animClass}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="h-full rounded-[18px] border overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 2px 12px rgba(15,15,26,0.06)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,15,26,0.06)';
        }}
      >
        {/* Thumbnail */}
        {featured && trend.thumbnail && (
          <div className="relative w-full overflow-hidden" style={{ height: 160 }}>
            <img
              src={trend.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))' }} />
          </div>
        )}

        <div className={`p-4 ${featured ? 'pb-5' : ''}`}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <SourceBadge source={trend.source} />
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}
              >
                {CATEGORY_EMOJI[trend.category]} {trend.category}
              </span>
            </div>
            {longevity && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: `${longevity.color}18`, color: longevity.color }}
              >
                {longevity.emoji} {longevity.label}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-semibold leading-snug mb-2 ${featured ? 'text-base' : 'text-sm'}`}
            style={{ color: 'var(--text)' }}
          >
            {trend.title}
          </h3>

          {/* AI insight excerpt */}
          {insight?.whyItRising && (
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
              {insight.whyItRising}
            </p>
          )}

          {/* Heat bar */}
          <HeatBar score={trend.score} />

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              {trend.rawScore > 0 && (
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {formatScore(trend.rawScore, trend.source)}
                </span>
              )}
              {trend.commentCount > 0 && (
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  💬 {trend.commentCount}
                </span>
              )}
            </div>
            {trend.subreddit && (
              <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>
                r/{trend.subreddit}
              </span>
            )}
            {trend.channelName && (
              <span className="text-[10px]" style={{ color: 'var(--muted)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {trend.channelName}
              </span>
            )}
          </div>

          {/* Content ideas */}
          {insight?.contentIdeas && insight.contentIdeas.length > 0 && featured && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#6366f1' }}>
                Content Ideas
              </p>
              <ul className="space-y-1">
                {insight.contentIdeas.slice(0, 2).map((idea, i) => (
                  <li key={i} className="text-xs flex items-start gap-1" style={{ color: 'var(--muted)' }}>
                    <span>→</span> {idea}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
