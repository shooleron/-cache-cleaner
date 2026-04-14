'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { verifyPassword, saveSession } from '@/lib/password';

export function PasswordGate() {
  const { state, dispatch } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const firstName = state.currentUser.name.split(' ')[0];

  const handleUnlock = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const { getStoredPasswordHash } = await import('@/lib/password');
      const hash = getStoredPasswordHash();
      if (!hash) {
        saveSession();
        dispatch({ type: 'UNLOCK_APP' });
        return;
      }
      const ok = await verifyPassword(password, hash);
      if (ok) {
        saveSession();
        dispatch({ type: 'UNLOCK_APP' });
      } else {
        setError('סיסמה שגויה — נסה שוב');
        setPassword('');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
    return <ForgotPasswordScreen onBack={() => setShowForgot(false)} />;
  }

  return (
    <div className="password-gate-overlay">
      <div className="password-gate-card">
        <div className="password-gate-logo">
          <div className="password-gate-logo-icon">A</div>
          <span className="password-gate-logo-name">{state.workspaceName || 'אטלייה'}</span>
        </div>

        <div className="password-gate-avatar" style={{ background: state.currentUser.color }}>
          {state.currentUser.avatar}
        </div>

        <h2 className="password-gate-title">שלום, {firstName}</h2>
        <p className="password-gate-sub">הכנס את הסיסמה כדי להיכנס לסביבת העבודה</p>

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
            <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
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

        <button className="password-gate-btn" onClick={handleUnlock} disabled={!password || loading}>
          {loading
            ? <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span>
            : <><span>כניסה</span><span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span></>
          }
        </button>

        <button className="password-gate-forgot" onClick={() => setShowForgot(true)}>
          שכחתי סיסמה
        </button>
      </div>
    </div>
  );
}

// ── Forgot Password ──────────────────────────────────────────────
function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const { state } = useStore();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const strength = (() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabel = ['', 'חלשה', 'בינונית', 'טובה', 'חזקה'][strength];
  const strengthColor = ['#e5e7eb', '#e2445c', '#fdab3d', '#00c875', '#0073ea'][strength];

  const handleEmailSubmit = () => {
    if (email.trim().toLowerCase() !== state.currentUser.email.toLowerCase()) {
      setEmailError('כתובת המייל אינה תואמת לחשבון');
      return;
    }
    setEmailError('');
    setStep('reset');
  };

  const handleReset = async () => {
    if (newPassword.length < 6) { setSaveError('סיסמה חייבת להכיל לפחות 6 תווים'); return; }
    if (newPassword !== confirmPassword) { setSaveError('הסיסמאות אינן תואמות'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const { hashPassword, savePasswordHash, saveSession } = await import('@/lib/password');
      const hash = await hashPassword(newPassword);
      savePasswordHash(hash);
      saveSession();
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="password-gate-overlay">
      <div className="password-gate-card">
        <div className="password-gate-logo">
          <div className="password-gate-logo-icon">A</div>
          <span className="password-gate-logo-name">{state.workspaceName || 'אטלייה'}</span>
        </div>

        {done ? (
          <>
            <div className="forgot-success-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#00c875' }}>check_circle</span>
            </div>
            <h2 className="password-gate-title">הסיסמה עודכן</h2>
            <p className="password-gate-sub">תוכל להיכנס עם הסיסמה החדשה שלך</p>
            <button className="password-gate-btn" onClick={onBack}>
              חזור לכניסה
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
            </button>
          </>
        ) : step === 'email' ? (
          <>
            <div className="forgot-icon-wrap">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--primary)' }}>lock_reset</span>
            </div>
            <h2 className="password-gate-title">איפוס סיסמה</h2>
            <p className="password-gate-sub">הכנס את כתובת המייל הרשומה בחשבון לאימות זהות</p>

            <div className="password-gate-field">
              <div className={`password-gate-input-wrap ${emailError ? 'error' : ''}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)', flexShrink: 0 }}>mail</span>
                <input
                  className="password-gate-input"
                  type="email"
                  placeholder="כתובת מייל"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                  autoFocus
                  dir="ltr"
                />
              </div>
              {emailError && (
                <div className="password-gate-error">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                  {emailError}
                </div>
              )}
            </div>

            <button className="password-gate-btn" onClick={handleEmailSubmit} disabled={!email.trim()}>
              אמת זהות
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            </button>
            <button className="password-gate-forgot" onClick={onBack}>חזור לכניסה</button>
          </>
        ) : (
          <>
            <div className="forgot-icon-wrap">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#00c875' }}>verified_user</span>
            </div>
            <h2 className="password-gate-title">הגדר סיסמה חדשה</h2>
            <p className="password-gate-sub">בחר סיסמה חזקה לסביבת העבודה שלך</p>

            <div className="password-gate-field">
              <div className="password-gate-input-wrap">
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)', flexShrink: 0 }}>lock</span>
                <input
                  className="password-gate-input"
                  type={showNew ? 'text' : 'password'}
                  placeholder="סיסמה חדשה"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setSaveError(''); }}
                  autoFocus
                  dir="ltr"
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showNew ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {newPassword.length > 0 && (
                <div className="password-strength" style={{ marginTop: 8 }}>
                  <div className="password-strength-bar">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="password-strength-seg" style={{ background: i <= strength ? strengthColor : '#e5e7eb' }} />
                    ))}
                  </div>
                  <span className="password-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}

              <div className="password-gate-input-wrap" style={{ marginTop: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)', flexShrink: 0 }}>lock_open</span>
                <input
                  className="password-gate-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="אישור סיסמה"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setSaveError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  dir="ltr"
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {saveError && (
                <div className="password-gate-error">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                  {saveError}
                </div>
              )}
            </div>

            <button className="password-gate-btn" onClick={handleReset} disabled={!newPassword || !confirmPassword || saving}>
              {saving
                ? <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                : <><span>שמור סיסמה</span><span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span></>
              }
            </button>
            <button className="password-gate-forgot" onClick={() => setStep('email')}>חזור</button>
          </>
        )}
      </div>
    </div>
  );
}
