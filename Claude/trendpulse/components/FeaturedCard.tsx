'use client';
import Link from 'next/link';
import { Trend } from '@/lib/types';
import { useLang } from '@/lib/i18n';

const CAT_TOKEN: Record<string, string> = {
  tech: 'var(--cat-tech)', ai: 'var(--cat-ai)', marketing: 'var(--cat-marketing)',
  culture: 'var(--cat-culture)', business: 'var(--cat-business)', science: 'var(--cat-science)',
  design: 'var(--cat-design)', crypto: 'var(--cat-crypto)', other: 'var(--cat-other)',
};
const CAT_EMOJI: Record<string, string> = {
  tech: '💻', ai: '🤖', marketing: '📣', culture: '🌍',
  business: '💼', science: '🔬', design: '🎨', crypto: '₿', other: '📌',
};

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  hackernews: { label: 'HN', color: '#b45309', bg: '#fef3c7' },
  reddit:     { label: 'Reddit', color: '#b91c1c', bg: '#fee2e2' },
  youtube:    { label: 'YouTube', color: '#991b1b', bg: '#fee2e2' },
  rss:        { label: 'News', color: '#1e40af', bg: '#dbeafe' },
  producthunt:{ label: 'PH', color: '#92400e', bg: '#fef3c7' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props { trend: Trend; dim?: boolean; large?: boolean }

export default function TrendCard({ trend, dim, large }: Props) {
  const { t } = useLang();
  const catToken = CAT_TOKEN[trend.category] ?? CAT_TOKEN.other;
  const rising = trend.score >= 55;
  const cooling = trend.score < 35;
  const momentumColor = rising ? 'var(--yes-ink)' : cooling ? 'var(--no-ink)' : 'var(--stable-ink)';
  const momentumBar = rising ? 'var(--yes)' : cooling ? 'var(--no)' : 'var(--stable)';
  const isHot = trend.score >= 70;
  const src = SOURCE_CONFIG[trend.source] ?? SOURCE_CONFIG.rss;
  const imgHeight = large ? 280 : 180;

  return (
    <Link href={`/trends/${trend.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%', opacity: dim ? 0.72 : 1 }}>
      <div
        className="group h-full rounded-[20px] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: 'var(--surface)',
          border: isHot ? '2px solid var(--no)' : '1px solid var(--border)',
          boxShadow: isHot ? '0 0 0 1px var(--no-border), var(--shadow-card-soft)' : 'var(--shadow-card)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isHot ? 'var(--no)' : 'var(--accent-border)';
          e.currentTarget.style.boxShadow = isHot ? '0 0 0 1px var(--no-border), 0 8px 32px rgba(247,160,168,0.2)' : '0 8px 32px rgba(163,166,245,0.18)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isHot ? 'var(--no)' : 'var(--border)';
          e.currentTarget.style.boxShadow = isHot ? '0 0 0 1px var(--no-border), var(--shadow-card-soft)' : 'var(--shadow-card)';
        }}
      >
        {/* Image */}
        <div className="relative w-full shrink-0 overflow-hidden" style={{ height: imgHeight }}>
          {trend.thumbnail ? (
            <img src={trend.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: catToken }}>
              <span style={{ fontSize: 52, opacity: 0.45 }}>{CAT_EMOJI[trend.category]}</span>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 30%,rgba(15,15,26,0.4))' }} />
          {/* Left badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: catToken, color: 'var(--text)', backdropFilter: 'blur(4px)' }}
            >
              {CAT_EMOJI[trend.category]} {trend.category}
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: src.bg, color: src.color }}
            >
              {src.label}
            </span>
          </div>
          {/* Right badge */}
          {isHot ? (
            <span
              className="absolute top-3 right-3 text-[11px] font-black px-2.5 py-1 rounded-full"
              style={{ background: 'var(--no)', color: 'var(--no-ink)', letterSpacing: '0.07em', boxShadow: '0 2px 8px var(--no-border)' }}
            >
              TREND
            </span>
          ) : (
            <span
              className="absolute top-3 right-3 text-xs font-black px-2 py-0.5 rounded-full"
              style={{ background: momentumBar, color: momentumColor }}
            >
              {trend.score}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-4" style={{ minHeight: large ? 130 : 110 }}>
          <p
            className={`${large ? 'text-base' : 'text-sm'} font-bold leading-snug mb-3`}
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
              <div style={{ width: `${trend.score}%`, height: '100%', background: momentumBar, borderRadius: 9999, transition: 'width 0.5s ease' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold" style={{ color: momentumColor }}>
                {rising ? t.rising : cooling ? t.cooling : t.stable} {trend.score}%
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
