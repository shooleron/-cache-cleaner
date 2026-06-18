'use client';
import Link from 'next/link';
import { Trend } from '@/lib/types';

const CAT_COLOR: Record<string, string> = {
  tech: '#6366f1', ai: '#8b5cf6', marketing: '#f59e0b', culture: '#10b981',
  business: '#3b82f6', science: '#06b6d4', design: '#ec4899', crypto: '#f97316', other: '#6b7280',
};
const CAT_EMOJI: Record<string, string> = {
  tech: '💻', ai: '🤖', marketing: '📣', culture: '🌍',
  business: '💼', science: '🔬', design: '🎨', crypto: '₿', other: '📌',
};
const CAT_BG: Record<string, string> = {
  tech: 'linear-gradient(135deg,#1e1b4b,#312e81)',
  ai: 'linear-gradient(135deg,#1a0533,#2e1065)',
  marketing: 'linear-gradient(135deg,#1c1100,#451a03)',
  culture: 'linear-gradient(135deg,#022c22,#064e3b)',
  business: 'linear-gradient(135deg,#0c1a4b,#1e3a8a)',
  science: 'linear-gradient(135deg,#0a2030,#0e4163)',
  design: 'linear-gradient(135deg,#2d0a1e,#5b1a38)',
  crypto: 'linear-gradient(135deg,#1c0a00,#431407)',
  other: 'linear-gradient(135deg,#111,#222)',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m`;
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface Props { trend: Trend; dim?: boolean }

export default function CompactCard({ trend, dim }: Props) {
  const color = CAT_COLOR[trend.category] ?? CAT_COLOR.other;
  const rising = trend.score >= 55;
  const cooling = trend.score < 35;
  const statusColor = rising ? '#22c55e' : cooling ? '#ef4444' : '#f59e0b';
  const isHot = trend.score >= 70;

  return (
    <Link
      href={`/trends/${trend.id}`}
      style={{ textDecoration: 'none', display: 'block', opacity: dim ? 0.65 : 1 }}
    >
      <div
        className="group flex items-stretch gap-0 rounded-2xl overflow-hidden transition-all duration-150 hover:-translate-y-px"
        style={{
          background: 'var(--surface)',
          border: isHot ? '2px solid #ef4444' : '1px solid var(--border)',
          boxShadow: isHot ? '0 0 0 1px rgba(239,68,68,0.15), 0 2px 12px rgba(239,68,68,0.12)' : '0 1px 6px rgba(15,15,26,0.05)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isHot ? '#ef4444' : color + '50';
          e.currentTarget.style.boxShadow = isHot ? `0 0 0 1px rgba(239,68,68,0.2), 0 6px 24px rgba(239,68,68,0.18)` : `0 4px 20px ${color}18`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isHot ? '#ef4444' : 'var(--border)';
          e.currentTarget.style.boxShadow = isHot ? '0 0 0 1px rgba(239,68,68,0.15), 0 2px 12px rgba(239,68,68,0.12)' : '0 1px 6px rgba(15,15,26,0.05)';
        }}
      >
        {/* Thumbnail */}
        <div className="relative shrink-0 overflow-hidden" style={{ width: 88, minHeight: 88 }}>
          {trend.thumbnail ? (
            <img src={trend.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" style={{ display: 'block' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: CAT_BG[trend.category] ?? CAT_BG.other }}>
              <span style={{ fontSize: 28, opacity: 0.4 }}>{CAT_EMOJI[trend.category]}</span>
            </div>
          )}
          {/* Category color bar */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: color }} />
          {/* Hot TREND badge */}
          {isHot && (
            <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
              <span
                className="text-[9px] font-black px-1.5 py-0.5 rounded-sm tracking-wider"
                style={{ background: '#ef4444', color: '#fff', letterSpacing: '0.08em' }}
              >
                TREND
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between">
          <div>
            {/* Category + time */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: color + '18', color }}>
                {CAT_EMOJI[trend.category]} {trend.category}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{timeAgo(trend.publishedAt)}</span>
            </div>
            {/* Title */}
            <p
              className="text-sm font-semibold leading-snug"
              style={{
                color: 'var(--text)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {trend.title}
            </p>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-2">
            {/* Heat bar */}
            <div className="flex-1 mr-3">
              <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: 'var(--border)' }}>
                <div style={{ width: `${trend.score}%`, height: '100%', background: statusColor, borderRadius: 9999 }} />
              </div>
            </div>
            <span className="text-[11px] font-bold shrink-0" style={{ color: statusColor }}>{trend.score}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
