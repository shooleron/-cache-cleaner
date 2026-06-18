'use client';
import { useMemo } from 'react';

interface DataPoint { day: number; yes: number }

/** Simulate plausible price history ending at currentYes */
function simulateHistory(currentYes: number, days = 30, seed = 42): DataPoint[] {
  const points: DataPoint[] = [];
  let rng = seed;
  const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return (rng >>> 0) / 0xffffffff; };

  // Start from a "noisier" past value
  let val = Math.max(10, Math.min(90, currentYes + (rand() - 0.5) * 40));
  for (let i = 0; i <= days; i++) {
    const target = currentYes;
    const drift = (target - val) * 0.08;
    const noise = (rand() - 0.5) * 6;
    val = Math.max(2, Math.min(98, val + drift + noise));
    points.push({ day: i, yes: Math.round(val) });
  }
  // Force end to current
  points[points.length - 1].yes = currentYes;
  return points;
}

interface Props {
  yesProb: number;
  seed?: number;
  height?: number;
}

export default function PriceChart({ yesProb, seed = 42, height = 200 }: Props) {
  const data = useMemo(() => simulateHistory(yesProb, 30, seed), [yesProb, seed]);

  const W = 600;
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minY = 0;
  const maxY = 100;
  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minY) / (maxY - minY)) * chartH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.yes).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${toX(data.length - 1).toFixed(1)},${(PAD.top + chartH).toFixed(1)} L${PAD.left},${(PAD.top + chartH).toFixed(1)} Z`;

  const rising = yesProb >= 55;
  const cooling = yesProb < 35;
  const color = rising ? '#22c55e' : cooling ? '#ef4444' : '#f59e0b';

  // Y-axis grid lines
  const gridLines = [0, 25, 50, 75, 100];

  // X-axis labels (every 5 days)
  const xLabels = [0, 7, 14, 21, 30].map((d) => ({
    x: toX(d),
    label: d === 0 ? '30d ago' : d === 30 ? 'Today' : `-${30 - d}d`,
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`area-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`line-${seed}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridLines.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left} y1={toY(v)}
            x2={PAD.left + chartW} y2={toY(v)}
            stroke="var(--border)" strokeWidth="1" strokeDasharray="4,4"
          />
          <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="var(--muted-hex, #888)">
            {v}%
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#area-${seed})`} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={`url(#line-${seed})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Current value dot */}
      <circle
        cx={toX(data.length - 1)} cy={toY(yesProb)}
        r="5" fill={color} stroke="var(--surface)" strokeWidth="2"
      />

      {/* X labels */}
      {xLabels.map(({ x, label }) => (
        <text key={label} x={x} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--muted-hex, #888)">
          {label}
        </text>
      ))}
    </svg>
  );
}
