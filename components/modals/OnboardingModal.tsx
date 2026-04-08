'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { hashPassword } from '@/lib/password';

const JOB_TITLES = [
  'מנכ״ל / בעלים',
  'מנהל תפעול',
  'מנהל מוצר',
  'מנהל פרויקטים',
  'מנהל מכירות',
  'מפתח תוכנה',
  'מעצב UX/UI',
  'מנהל שיווק',
  'אנליסט עסקי',
  'אחר',
];

const TOTAL_STEPS = 4;

export function OnboardingModal() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Step 2
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Step 3
  const [company, setCompany] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Step 4
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const canStep1 = name.trim().length > 1 && isAdmin !== null;
  const canStep2 = jobTitle.length > 0;
  const canStep3 = company.trim().length > 0;
  const canStep4 = password.length >= 6 && password === confirmPassword;

  const handleSubmit = async () => {
    if (password && password !== confirmPassword) {
      setPasswordError('הסיסמאות אינן תואמות');
      return;
    }
    if (password && password.length < 6) {
      setPasswordError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    // Save password hash if set
    if (password) {
      const { savePasswordHash } = await import('@/lib/password');
      const hash = await hashPassword(password);
      savePasswordHash(hash);
    }
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: {
        name: name.trim(),
        isAdmin: isAdmin!,
        phone: phone.trim(),
        email: email.trim(),
        jobTitle,
        company: company.trim(),
        companyAddress: companyAddress.trim(),
      },
    });
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Logo */}
        <div className="onboarding-logo">
          <div className="onboarding-logo-icon">A</div>
          <span className="onboarding-logo-name">אטלייה</span>
        </div>

        {/* Progress */}
        <div className="onboarding-progress-bar">
          <div
            className="onboarding-progress-fill"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <div className="onboarding-step-label">שלב {step} מתוך {TOTAL_STEPS}</div>

        {/* ── STEP 1: Name + Role ── */}
        {step === 1 && (
          <>
            <h2 className="onboarding-title">ברוכים הבאים!</h2>
            <p className="onboarding-sub">בואו נכיר — מה שמך ומה תפקידך בארגון?</p>

            <div className="onboarding-field">
              <label className="onboarding-label">שם מלא</label>
              <input
                className="onboarding-input"
                placeholder="למשל: יורי אלטשולר"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="onboarding-field">
              <label className="onboarding-label">סוג משתמש</label>
              <div className="onboarding-role-grid">
                <button
                  className={`onboarding-role-card ${isAdmin === true ? 'selected' : ''}`}
                  onClick={() => setIsAdmin(true)}
                  type="button"
                >
                  <span className="material-symbols-outlined onboarding-role-icon">admin_panel_settings</span>
                  <div className="onboarding-role-name">מנהל</div>
                  <div className="onboarding-role-desc">יוצר ומנהל את סביבת העבודה, מזמין עובדים ומגדיר הרשאות</div>
                </button>
                <button
                  className={`onboarding-role-card ${isAdmin === false ? 'selected' : ''}`}
                  onClick={() => setIsAdmin(false)}
                  type="button"
                >
                  <span className="material-symbols-outlined onboarding-role-icon">person</span>
                  <div className="onboarding-role-name">עובד</div>
                  <div className="onboarding-role-desc">מצטרף לסביבת עבודה קיימת לאחר הזמנה מהמנהל</div>
                </button>
              </div>
            </div>

            <button
              className="onboarding-btn-primary"
              disabled={!canStep1}
              onClick={() => setStep(2)}
            >
              המשך
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            </button>
          </>
        )}

        {/* ── STEP 2: Contact Info ── */}
        {step === 2 && (
          <>
            <h2 className="onboarding-title">פרטי יצירת קשר</h2>
            <p className="onboarding-sub">איך אפשר ליצור איתך קשר?</p>

            <div className="onboarding-field">
              <label className="onboarding-label">תפקיד</label>
              <select
                className="onboarding-input onboarding-select"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                autoFocus
              >
                <option value="">בחר תפקיד...</option>
                {JOB_TITLES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="onboarding-two-col">
              <div className="onboarding-field">
                <label className="onboarding-label">טלפון</label>
                <div className="onboarding-input-icon-wrap">
                  <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--outline)' }}>phone</span>
                  <input
                    className="onboarding-input-bare"
                    placeholder="050-0000000"
                    value={phone}
                    dir="ltr"
                    onChange={e => setPhone(e.target.value)}
                    type="tel"
                  />
                </div>
              </div>
              <div className="onboarding-field">
                <label className="onboarding-label">אימייל</label>
                <div className="onboarding-input-icon-wrap">
                  <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--outline)' }}>mail</span>
                  <input
                    className="onboarding-input-bare"
                    placeholder="you@company.com"
                    value={email}
                    dir="ltr"
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexDirection: 'row-reverse', marginTop: 8 }}>
              <button
                className="onboarding-btn-primary"
                disabled={!canStep2}
                onClick={() => setStep(3)}
              >
                המשך
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              </button>
              <button className="onboarding-btn-back" onClick={() => setStep(1)}>חזור</button>
            </div>
          </>
        )}

        {/* ── STEP 3: Company ── */}
        {step === 3 && (
          <>
            <h2 className="onboarding-title">פרטי החברה</h2>
            <p className="onboarding-sub">נשלים עם פרטי הארגון שלך</p>

            <div className="onboarding-field">
              <label className="onboarding-label">שם החברה</label>
              <div className="onboarding-input-icon-wrap">
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--outline)' }}>business</span>
                <input
                  className="onboarding-input-bare"
                  placeholder="למשל: חברת אקמה בע״מ"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="onboarding-field">
              <label className="onboarding-label">כתובת החברה</label>
              <div className="onboarding-input-icon-wrap">
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--outline)' }}>location_on</span>
                <input
                  className="onboarding-input-bare"
                  placeholder="למשל: רחוב הרצל 1, תל אביב"
                  value={companyAddress}
                  onChange={e => setCompanyAddress(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canStep3 && handleSubmit()}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="onboarding-summary">
              <div className="onboarding-summary-row">
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--primary)' }}>
                  {isAdmin ? 'admin_panel_settings' : 'person'}
                </span>
                <span>{name} · {isAdmin ? 'מנהל' : 'עובד'}</span>
              </div>
              {phone && (
                <div className="onboarding-summary-row">
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--primary)' }}>phone</span>
                  <span dir="ltr">{phone}</span>
                </div>
              )}
              {email && (
                <div className="onboarding-summary-row">
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--primary)' }}>mail</span>
                  <span dir="ltr">{email}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, flexDirection: 'row-reverse', marginTop: 8 }}>
              <button
                className="onboarding-btn-primary"
                disabled={!canStep3}
                onClick={() => setStep(4)}
              >
                המשך
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              </button>
              <button className="onboarding-btn-back" onClick={() => setStep(2)}>חזור</button>
            </div>
          </>
        )}

        {/* ── STEP 4: Password ── */}
        {step === 4 && (
          <>
            <h2 className="onboarding-title">אבטחת הכניסה</h2>
            <p className="onboarding-sub">הגדר סיסמה לסביבת העבודה שלך — ניתן לדלג ולהגדיר מאוחר יותר</p>

            <div className="onboarding-field">
              <label className="onboarding-label">סיסמה</label>
              <div className="onboarding-input-icon-wrap">
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--outline)' }}>lock</span>
                <input
                  className="onboarding-input-bare"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="לפחות 6 תווים"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                  dir="ltr"
                  autoFocus
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {password.length > 0 && (
              <>
                <div className="onboarding-field">
                  <label className="onboarding-label">אימות סיסמה</label>
                  <div className="onboarding-input-icon-wrap">
                    <span className="material-symbols-outlined" style={{ fontSize: 17, color: 'var(--outline)' }}>key</span>
                    <input
                      className="onboarding-input-bare"
                      type="password"
                      placeholder="הכנס שוב"
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                      dir="ltr"
                      onKeyDown={e => e.key === 'Enter' && canStep4 && handleSubmit()}
                    />
                  </div>
                </div>

                {/* Strength bar */}
                <div className="password-strength" style={{ marginBottom: 12 }}>
                  <div className="password-strength-bar">
                    {[1,2,3,4].map(n => (
                      <div key={n} className="password-strength-seg" style={{
                        background: password.length >= n * 3
                          ? n <= 1 ? '#e2445c' : n <= 2 ? '#fdab3d' : n <= 3 ? '#f2d600' : '#00c875'
                          : 'var(--outline-variant)'
                      }} />
                    ))}
                  </div>
                  <span className="password-strength-label">
                    {password.length < 4 ? 'חלשה' : password.length < 8 ? 'בינונית' : password.length < 12 ? 'חזקה' : 'חזקה מאוד'}
                  </span>
                </div>
              </>
            )}

            {passwordError && (
              <p style={{ fontSize: 12, color: '#e2445c', textAlign: 'right', marginBottom: 8 }}>{passwordError}</p>
            )}

            <div style={{ display: 'flex', gap: 10, flexDirection: 'row-reverse', marginTop: 4 }}>
              <button
                className="onboarding-btn-primary"
                disabled={password.length > 0 && !canStep4}
                onClick={handleSubmit}
              >
                כניסה למערכת
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
              </button>
              <button className="onboarding-btn-back" onClick={() => setStep(3)}>חזור</button>
            </div>
            {!password && (
              <p style={{ fontSize: 11, color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: 8 }}>
                ניתן גם לדלג — תוכל להגדיר סיסמה מאוחר יותר בפרופיל
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
