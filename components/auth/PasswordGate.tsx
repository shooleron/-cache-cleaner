'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { verifyPassword } from '@/lib/password';

export function PasswordGate() {
  const { state, dispatch } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const firstName = state.currentUser.name.split(' ')[0];

  const handleUnlock = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const { getStoredPasswordHash } = await import('@/lib/password');
      const hash = getStoredPasswordHash();
      if (!hash) {
        dispatch({ type: 'UNLOCK_APP' });
        return;
      }
      const ok = await verifyPassword(password, hash);
      if (ok) {
        dispatch({ type: 'UNLOCK_APP' });
      } else {
        setError('סיסמה שגויה — נסה שוב');
        setPassword('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-gate-overlay">
      <div className="password-gate-card">
        {/* Logo */}
        <div className="password-gate-logo">
          <div className="password-gate-logo-icon">A</div>
          <span className="password-gate-logo-name">{state.workspaceName || 'אטלייה'}</span>
        </div>

        {/* Avatar */}
        <div className="password-gate-avatar" style={{ background: state.currentUser.color }}>
          {state.currentUser.avatar}
        </div>

        <h2 className="password-gate-title">שלום, {firstName}</h2>
        <p className="password-gate-sub">הכנס את הסיסמה כדי להיכנס לסביבת העבודה</p>

        {/* Password input */}
        <div className="password-gate-field">
          <div className={`password-gate-input-wrap ${error ? 'error' : ''}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)', flexShrink: 0 }}>lock</span>
            <input
              className="password-gate-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="סיסמה"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              autoFocus
              dir="ltr"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {error && (
            <div className="password-gate-error">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
              {error}
            </div>
          )}
        </div>

        <button
          className="password-gate-btn"
          onClick={handleUnlock}
          disabled={!password || loading}
        >
          {loading ? (
            <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span>
          ) : (
            <>
              כניסה
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
