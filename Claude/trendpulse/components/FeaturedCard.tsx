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

const SOURCE_LABEL: Record<string, string> = {
  hackernews: 'HN', reddit: 'Reddit', youtube: 'YouTube', rss: 'News', producthunt: 'PH',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props { trend: Trend; dim?: boolean }

export default function TrendCard({ trend, dim }: Props) {
  const color = CAT_COLOR[trend.category] ?? CAT_COLOR.other;
  const rising = trend.score >= 55;
  const cooling = trend.score < 35;
  const statusColor = rising ? '#22c55e' : cooling ? '#ef4444' : '#f59e0b';
  const isHot = trend.score >= 70;

  return (
    <Link href={`/trends/${trend.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%', opacity: dim ? 0.72 : 1 }}>
      <div
        className="group h-full rounded-[20px] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: 'var(--surface)',
          border: isHot ? '2px solid #ef4444' : '1px solid var(--border)',
          boxShadow: isHot ? '0 0 0 1px rgba(239,68,68,0.15), 0 4px 20px rgba(239,68,68,0.14)' : '0 2px 16px rgba(15,15,26,0.07)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isHot ? '#ef4444' : color + '55';
          e.currentTarget.style.boxShadow = isHot ? '0 0 0 1px rgba(239,68,68,0.22), 0 8px 32px rgba(239,68,68,0.2)' : `0 8px 32px ${color}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isHot ? '#ef4444' : 'var(--border)';
          e.currentTarget.style.boxShadow = isHot ? '0 0 0 1px rgba(239,68,68,0.15), 0 4px 20px rgba(239,68,68,0.14)' : '0 2px 16px rgba(15,15,26,0.07)';
        }}
      >
        {/* Image — fixed height, all cards identical */}
        <div className="relative w-full shrink-0 overflow-hidden" style={{ height: 180 }}>
          {trend.thumbnail ? (
            <img src={trend.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: CAT_BG[trend.category] ?? CAT_BG.other }}>
              <span style={{ fontSize: 52, opacity: 0.25 }}>{CAT_EMOJI[trend.category]}</span>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.55))' }} />
          {/* Left badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: color + 'cc', color: '#fff', backdropFilter: 'blur(4px)' }}>
              {CAT_EMOJI[trend.category]} {trend.category}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(4px)' }}>
              {SOURCE_LABEL[trend.source] ?? trend.source}
            </span>
          </div>
          {/* Right badge */}
          {isHot ? (
            <span
              className="absolute top-3 right-3 text-[11px] font-black px-2.5 py-1 rounded-full"
              style={{ background: '#ef4444', color: '#fff', backdropFilter: 'blur(4px)', letterSpacing: '0.07em', boxShadow: '0 2px 8px rgba(239,68,68,0.5)' }}
            >
              TREND
            </span>
          ) : (
            <span
              className="absolute top-3 right-3 text-xs font-black px-2 py-0.5 rounded-full"
              style={{ background: statusColor + 'dd', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
              {trend.score}
            </span>
          )}
        </div>

        {/* Body — fixed min-height so all cards same total height */}
        <div className="flex-1 flex flex-col p-4" style={{ minHeight: 110 }}>
          <p
            className="text-sm font-bold leading-snug mb-3"
            style={{
              color: 'var(--text)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 40,
            }}
          >
            {trend.title}
          </p>

          <div className="mt-auto">
            <div className="w-full rounded-full overflow-hidden mb-1.5" style={{ height: 4, background: 'var(--border)' }}>
              <div style={{ width: `${trend.score}%`, height: '100%', background: statusColor, borderRadius: 9999, transition: 'width 0.5s ease' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold" style={{ color: statusColor }}>
                {rising ? '↑ Rising' : cooling ? '↓ Cooling' : '→ Stable'} {trend.score}%
              </span>
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                {timeAgo(trend.publishedAt)}
                {trend.commentCount > 0 && ` · 💬 ${trend.commentCount}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
