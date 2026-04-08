'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';

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

export function OnboardingModal() {
  const { dispatch } = useStore();
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [step, setStep] = useState(1);

  const canProceed = name.trim().length > 1;
  const canFinish = canProceed && jobTitle && company.trim().length > 0;

  const handleSubmit = () => {
    if (!canFinish) return;
    dispatch({ type: 'COMPLETE_ONBOARDING', payload: { name: name.trim(), jobTitle, company: company.trim() } });
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Logo */}
        <div className="onboarding-logo">
          <div className="onboarding-logo-icon">A</div>
          <span className="onboarding-logo-name">אטלייה</span>
        </div>

        {/* Progress dots */}
        <div className="onboarding-steps">
          <div className={`onboarding-dot ${step >= 1 ? 'active' : ''}`} />
          <div className={`onboarding-dot ${step >= 2 ? 'active' : ''}`} />
        </div>

        {step === 1 && (
          <>
            <h2 className="onboarding-title">ברוכים הבאים!</h2>
            <p className="onboarding-sub">נתחיל בהיכרות קצרה — מה השם שלך?</p>

            <div className="onboarding-field">
              <label className="onboarding-label">שם מלא</label>
              <input
                className="onboarding-input"
                placeholder="למשל: יורי אלטשולר"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && canProceed && setStep(2)}
              />
            </div>

            <button
              className="onboarding-btn-primary"
              disabled={!canProceed}
              onClick={() => setStep(2)}
            >
              המשך
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="onboarding-title">עוד שניה, {name.split(' ')[0]}</h2>
            <p className="onboarding-sub">ספר לנו קצת על התפקיד שלך</p>

            <div className="onboarding-field">
              <label className="onboarding-label">תפקיד</label>
              <select
                className="onboarding-input onboarding-select"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
              >
                <option value="">בחר תפקיד...</option>
                {JOB_TITLES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="onboarding-field">
              <label className="onboarding-label">שם החברה</label>
              <input
                className="onboarding-input"
                placeholder="למשל: חברת אקמה בע״מ"
                value={company}
                onChange={e => setCompany(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canFinish && handleSubmit()}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexDirection: 'row-reverse' }}>
              <button
                className="onboarding-btn-primary"
                disabled={!canFinish}
                onClick={handleSubmit}
              >
                כניסה למערכת
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
              </button>
              <button className="onboarding-btn-back" onClick={() => setStep(1)}>
                חזור
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
