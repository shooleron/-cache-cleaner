'use client';
import { TrendSource } from '@/lib/types';

const SOURCE_CONFIG: Record<TrendSource, { label: string; color: string; bg: string; icon: string }> = {
  hackernews: { label: 'HN', color: '#b45309', bg: '#fef3c7', icon: 'Y' },
  reddit:     { label: 'Reddit', color: '#b91c1c', bg: '#fee2e2', icon: 'R' },
  youtube:    { label: 'YouTube', color: '#991b1b', bg: '#fee2e2', icon: '▶' },
  rss:        { label: 'News', color: '#1e40af', bg: '#dbeafe', icon: '📰' },
  producthunt:{ label: 'PH', color: '#92400e', bg: '#fef3c7', icon: '🚀' },
};

export default function SourceBadge({ source }: { source: TrendSource }) {
  const cfg = SOURCE_CONFIG[source];
  return (
    <span
      style={{ color: cfg.color, background: cfg.bg }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
    >
      <span className="text-[10px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}
