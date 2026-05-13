'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

type Step = 'welcome' | 'profile' | 'password' | 'done';

const ROLE_LABELS: Record<string, string> = {
  member: 'עובד',
  viewer: 'צופה',
  owner: 'מנהל',
};

const ROLE_ICONS: Record<string, string> = {
  member: 'badge',
  viewer: 'visibility',
  owner: 'manage_accounts',
};

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'חלשה מאוד', color: '#ef4444' },
    { label: 'חלשה', color: '#f97316' },
    { label: 'בינונית', color: '#eab308' },
    { label: 'חזקה', color: '#22c55e' },
    { label: 'חזקה מאוד', color: '#16a34a' },
  ];
  return { score, ...levels[score] };
}

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function InvitePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = params?.token as string;
  const email = searchParams?.get('email') || '';
  const role = searchParams?.get('role') || 'member';
  const workspace = searchParams?.get('workspace') || 'אטלייה';

  const [step, setStep] = useState<Step>('welcome');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  // Validate token is not empty
  const isValidToken = token && token.length >= 6;

  if (!isValidToken) {
    return (
      <div className="invite-page-root">
        <div className="invite-page-card">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ef4444' }}>link_off</span>
            <h2 style={{ marginTop: 16, fontSize: 20, fontWeight: 700 }}>קישור לא תקין</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: 8 }}>הקישור שהתקבל פג תוקפו או אינו תקין.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileNext = () => {
    if (!firstName.trim()) { setError('נא להזין שם פרטי'); return; }
    if (!lastName.trim()) { setError('נא להזין שם משפחה'); return; }
    setError('');
    setStep('password');
  };

  const handleFinish = async () => {
    if (password.length < 8) { setError('הסיסמה חייבת להכיל לפחות 8 תווים'); return; }
    if (password !== confirmPassword) { setError('הסיסמאות אינן תואמות'); return; }
    setError('');
    setLoading(true);

    try {
      const hash = await hashPassword(password);
      // Store the new user in localStorage so the app can pick it up
      const newUser = {
        id: `user-invite-${token}`,
        name: `${firstName.trim()} ${lastName.trim()}`,
        email,
        phone: phone.trim(),
        jobTitle: jobTitle.trim(),
        role,
        status: 'active',
        avatar: firstName.trim()[0]?.toUpperCase() || '?',
        color: `hsl(${Math.floor(Math.random() * 360)}, 60%, 55%)`,
        passwordHash: hash,
        inviteToken: token,
        workspace,
        joinedAt: new Date().toISOString(),
      };
      localStorage.setItem('atelier_pending_invite_user', JSON.stringify(newUser));
      setStep('done');
    } catch {
      setError('שגיאה בעיבוד הסיסמה, נסה שנית');
    } finally {
      setLoading(false);
    }
  };

  const goToApp = () => {
    router.push('/');
  };

  return (
    <div className="invite-page-root">
      <div className="invite-page-card">
        {/* Logo bar */}
        <div className="invite-page-logo-bar">
          <div className="invite-page-logo-icon">A</div>
          <div>
            <div className="invite-page-logo-name">{workspace}</div>
            <div className="invite-page-logo-sub">מערכת ניהול תפעול</div>
          </div>
        </div>

        {/* Progress dots */}
        {step !== 'done' && (
          <div className="invite-page-steps">
            {(['welcome', 'profile', 'password'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`invite-page-dot ${step === s ? 'active' : (
                  ['welcome', 'profile', 'password'].indexOf(step) > i ? 'done' : ''
                )}`}
              />
            ))}
          </div>
        )}

        {/* ── Step: Welcome ── */}
        {step === 'welcome' && (
          <div className="invite-page-section">
            <div className="invite-page-welcome-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--primary)' }}>
                {ROLE_ICONS[role] || 'badge'}
              </span>
            </div>
            <h1 className="invite-page-title">ברוך הבא לצוות!</h1>
            <p className="invite-page-sub">
              הוזמנת להצטרף לסביבת העבודה <strong>{workspace}</strong>
            </p>

            <div className="invite-page-invite-details">
              <div className="invite-page-detail-row">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mail</span>
                <span dir="ltr">{email}</span>
              </div>
              <div className="invite-page-detail-row">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  {ROLE_ICONS[role] || 'badge'}
                </span>
                <span>תפקיד: {ROLE_LABELS[role] || role}</span>
              </div>
            </div>

            <button className="btn-primary invite-page-btn" onClick={() => setStep('profile')}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              בואו נתחיל
            </button>
          </div>
        )}

        {/* ── Step: Profile ── */}
        {step === 'profile' && (
          <div className="invite-page-section">
            <h2 className="invite-page-title" style={{ fontSize: 22 }}>פרטים אישיים</h2>
            <p className="invite-page-sub">איך תרצה שיכירו אותך במערכת?</p>

            <div className="invite-page-avatar-preview">
              {firstName ? firstName[0].toUpperCase() : '?'}
              {lastName ? lastName[0].toUpperCase() : ''}
            </div>

            <div className="invite-page-form">
              <div className="invite-page-field-row">
                <div className="invite-page-field">
                  <label className="invite-label">שם פרטי</label>
                  <input
                    className="invite-input invite-input-standalone"
                    value={firstName}
                    onChange={e => { setFirstName(e.target.value); setError(''); }}
                    placeholder="ישראל"
                    autoFocus
                  />
                </div>
                <div className="invite-page-field">
                  <label className="invite-label">שם משפחה</label>
                  <input
                    className="invite-input invite-input-standalone"
                    value={lastName}
                    onChange={e => { setLastName(e.target.value); setError(''); }}
                    placeholder="ישראלי"
                  />
                </div>
              </div>

              <div className="invite-page-field">
                <label className="invite-label">תפקיד (אופציונלי)</label>
                <input
                  className="invite-input invite-input-standalone"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="מנהל פרויקטים"
                />
              </div>

              <div className="invite-page-field">
                <label className="invite-label">טלפון (אופציונלי)</label>
                <input
                  className="invite-input invite-input-standalone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="050-0000000"
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <p className="invite-error">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                {error}
              </p>
            )}

            <div className="invite-page-btn-row">
              <button className="btn-secondary" onClick={() => setStep('welcome')}>
                חזור
              </button>
              <button className="btn-primary invite-page-btn" onClick={handleProfileNext}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                המשך
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Password ── */}
        {step === 'password' && (
          <div className="invite-page-section">
            <h2 className="invite-page-title" style={{ fontSize: 22 }}>הגדר סיסמה</h2>
            <p className="invite-page-sub">בחר סיסמה חזקה לחשבון שלך</p>

            <div className="invite-page-form">
              <div className="invite-page-field">
                <label className="invite-label">סיסמה</label>
                <div className="invite-input-row">
                  <input
                    className="invite-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="לפחות 8 תווים"
                    dir="ltr"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', padding: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {password && (
                  <div className="invite-page-strength-wrap">
                    <div className="invite-page-strength-bar">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="invite-page-strength-seg"
                          style={{ background: i < strength.score ? strength.color : 'var(--outline-variant)' }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="invite-page-field">
                <label className="invite-label">אימות סיסמה</label>
                <div className="invite-input-row">
                  <input
                    className="invite-input"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="הזן שוב את הסיסמה"
                    dir="ltr"
                    onKeyDown={e => e.key === 'Enter' && handleFinish()}
                  />
                  {confirmPassword && (
                    <span className="material-symbols-outlined" style={{
                      fontSize: 18,
                      color: confirmPassword === password ? '#22c55e' : '#ef4444',
                      flexShrink: 0,
                    }}>
                      {confirmPassword === password ? 'check_circle' : 'cancel'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <p className="invite-error">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                {error}
              </p>
            )}

            <div className="invite-page-btn-row">
              <button className="btn-secondary" onClick={() => setStep('profile')}>
                חזור
              </button>
              <button
                className="btn-primary invite-page-btn"
                onClick={handleFinish}
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? (
                  <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                )}
                סיים הרשמה
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Done ── */}
        {step === 'done' && (
          <div className="invite-page-section invite-page-done">
            <div className="invite-done-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#00c875' }}>
                check_circle
              </span>
            </div>
            <h2 className="invite-page-title">ברוך הבא, {firstName}!</h2>
            <p className="invite-page-sub">
              החשבון שלך נוצר בהצלחה.<br />
              אתה כעת חלק מצוות <strong>{workspace}</strong>.
            </p>

            <div className="invite-page-done-details">
              <div className="invite-page-detail-row">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#00c875' }}>person</span>
                <span>{firstName} {lastName}</span>
              </div>
              <div className="invite-page-detail-row">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#00c875' }}>mail</span>
                <span dir="ltr">{email}</span>
              </div>
              <div className="invite-page-detail-row">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#00c875' }}>
                  {ROLE_ICONS[role] || 'badge'}
                </span>
                <span>{ROLE_LABELS[role] || role}</span>
              </div>
            </div>

            <button className="btn-primary invite-page-btn" onClick={goToApp}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
              כניסה למערכת
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
