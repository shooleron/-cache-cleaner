'use client';

export default function HeatBar({ score }: { score: number }) {
  const color =
    score >= 80 ? '#ef4444' :
    score >= 60 ? '#f59e0b' :
    score >= 40 ? '#6366f1' : '#94a3b8';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-mono font-semibold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}
