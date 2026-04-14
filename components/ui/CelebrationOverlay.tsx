'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';

const CONFETTI_COLORS = ['#5a45cb', '#00c875', '#fdab3d', '#e2445c', '#9c27b0', '#0073ea', '#f2d600'];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = `${(index * 37 + 5) % 100}%`;
  const delay = `${(index * 0.12) % 1.2}s`;
  const size = 8 + (index % 5) * 2;
  const shape = index % 3 === 0 ? '50%' : index % 3 === 1 ? '0%' : '2px';
  return (
    <div
      className="confetti-piece"
      style={{
        left,
        animationDelay: delay,
        width: size,
        height: size,
        background: color,
        borderRadius: shape,
      }}
    />
  );
}

export function CelebrationOverlay() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    if (!state.celebrationTaskId) return;
    const timer = setTimeout(() => dispatch({ type: 'DISMISS_CELEBRATION' }), 4000);
    return () => clearTimeout(timer);
  }, [state.celebrationTaskId]);

  if (!state.celebrationTaskId) return null;

  const task = state.tasks.find(t => t.id === state.celebrationTaskId);

  return (
    <div className="celebration-overlay" onClick={() => dispatch({ type: 'DISMISS_CELEBRATION' })}>
      <div className="confetti-container">
        {Array.from({ length: 40 }).map((_, i) => <ConfettiPiece key={i} index={i} />)}
      </div>
      <div className="celebration-card">
        <div className="celebration-emoji">🎉</div>
        <h2 className="celebration-title">כל הכבוד!</h2>
        <p className="celebration-task">{task?.title || 'משימה הושלמה'}</p>
        <p className="celebration-sub">המשימה הושלמה בהצלחה. עבודה מעולה! ⭐</p>
      </div>
    </div>
  );
}
