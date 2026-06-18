'use client';
import { AIAnalysis } from '@/lib/types';

const URGENCY_CONFIG = {
  'now':        { label: 'Act Now',      color: '#ef4444', bg: '#fee2e2' },
  'this-week':  { label: 'This Week',    color: '#f59e0b', bg: '#fef3c7' },
  'this-month': { label: 'This Month',   color: '#22c55e', bg: '#dcfce7' },
};

interface Props {
  analysis: AIAnalysis | null;
  loading: boolean;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function AIInsightPanel({ analysis, loading }: Props) {
  return (
    <div
      className="rounded-[18px] border overflow-hidden sticky top-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 2px 12px rgba(15,15,26,0.06)' }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(99,102,241,0.02))' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🧠</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>AI Trend Intelligence</span>
          </div>
          {loading && (
            <span className="text-[11px] font-medium" style={{ color: '#6366f1' }}>Analyzing...</span>
          )}
          {analysis && !loading && (
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
              {new Date(analysis.generatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Summary */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#6366f1' }}>Executive Summary</p>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {analysis?.summary || 'No analysis yet. Click "Refresh AI" to generate insights.'}
            </p>
          )}
        </div>

        {/* Marketing Opportunities */}
        {(loading || (analysis?.marketingOpportunities?.length ?? 0) > 0) && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#6366f1' }}>
              Marketing Opportunities
            </p>
            {loading ? (
              <div className="space-y-3">
                {[0,1,2].map((i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg)' }}>
                    <Skeleton className="h-3 w-2/3 mb-2" />
                    <Skeleton className="h-2.5 w-full" />
                    <Skeleton className="h-2.5 w-4/5 mt-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {analysis?.marketingOpportunities?.map((opp, i) => {
                  const urg = URGENCY_CONFIG[opp.urgency];
                  return (
                    <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg)' }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{opp.title}</span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: urg.bg, color: urg.color }}
                        >
                          {urg.label}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--muted)' }}>{opp.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {opp.channels.map((ch) => (
                          <span
                            key={ch}
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Weekly Prediction */}
        {(loading || analysis?.weeklyPrediction) && (
          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#6366f1' }}>
              📡 Next Week Prediction
            </p>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
                {analysis?.weeklyPrediction}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
