'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { hashPassword, verifyPassword, getStoredPasswordHash, savePasswordHash } from '@/lib/password';

const JOB_TITLES = [
  'מנכ״ל / בעלים', 'מנהל תפעול', 'מנהל מוצר', 'מנהל פרויקטים',
  'מנהל מכירות', 'מפתח תוכנה', 'מעצב UX/UI', 'מנהל שיווק',
  'אנליסט עסקי', 'אחר',
];

type Tab = 'profile' | 'security';

export function ProfileModal() {
  const { state, dispatch } = useStore();
  const user = state.currentUser;
  const [tab, setTab] = useState<Tab>('profile');

  // Profile fields
  const [name, setName] = useState(user.name);
  const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [company, setCompany] = useState(user.company || '');
  const [companyAddress, setCompanyAddress] = useState(user.companyAddress || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const hasPassword = !!getStoredPasswordHash();

  const handleSaveProfile = () => {
    if (!name.trim()) return;
    dispatch({ type: 'UPDATE_PROFILE', payload: { name: name.trim(), jobTitle, phone, email, company, companyAddress } });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('הסיסמאות אינן תואמות');
      return;
    }
    // If there's an existing password, verify it first
    if (hasPassword) {
      const ok = await verifyPassword(currentPassword, getStoredPasswordHash()!);
      if (!ok) {
        setPasswordError('הסיסמה הנוכחית שגויה');
        return;
      }
    }
    const hash = await hashPassword(newPassword);
    savePasswordHash(hash);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  const handleRemovePassword = async () => {
    if (!hasPassword) return;
    if (currentPassword) {
      const ok = await verifyPassword(currentPassword, getStoredPasswordHash()!);
      if (!ok) { setPasswordError('הסיסמה שגויה'); return; }
    }
    localStorage.removeItem('atelier_password_hash');
    setCurrentPassword('');
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_PROFILE_MODAL' })}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="profile-modal-header">
          <button className="modal-close-btn" onClick={() => dispatch({ type: 'CLOSE_PROFILE_MODAL' })}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'row-reverse' }}>
            <div className="profile-modal-avatar" style={{ background: user.color }}>{user.avatar}</div>
            <div style={{ textAlign: 'right' }}>
              <div className="profile-modal-name">{user.name}</div>
              <div className="profile-modal-role">{user.jobTitle || 'חבר צוות'}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab-btn ${tab === 'profile' ? 'active' : ''}`}
            onClick={() => setTab('profile')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
            פרטים אישיים
          </button>
          <button
            className={`profile-tab-btn ${tab === 'security' ? 'active' : ''}`}
            onClick={() => setTab('security')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
            אבטחה
          </button>
        </div>

        <div className="profile-modal-body">

          {/* ── Profile tab ── */}
          {tab === 'profile' && (
            <div className="profile-fields">
              <div className="profile-two-col">
                <div className="profile-field">
                  <label>שם מלא</label>
                  <input className="profile-input" value={name} onChange={e => setName(e.target.value)} placeholder="שם מלא" />
                </div>
                <div className="profile-field">
                  <label>תפקיד</label>
                  <select className="profile-input profile-select" value={jobTitle} onChange={e => setJobTitle(e.target.value)}>
                    <option value="">בחר תפקיד...</option>
                    {JOB_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="profile-two-col">
                <div className="profile-field">
                  <label>טלפון</label>
                  <div className="profile-input-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>phone</span>
                    <input className="profile-input-bare" value={phone} onChange={e => setPhone(e.target.value)} placeholder="050-0000000" dir="ltr" type="tel" />
                  </div>
                </div>
                <div className="profile-field">
                  <label>אימייל</label>
                  <div className="profile-input-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>mail</span>
                    <input className="profile-input-bare" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" dir="ltr" type="email" />
                  </div>
                </div>
              </div>

              <div className="profile-field">
                <label>שם החברה</label>
                <div className="profile-input-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>business</span>
                  <input className="profile-input-bare" value={company} onChange={e => setCompany(e.target.value)} placeholder="שם החברה" />
                </div>
              </div>

              <div className="profile-field">
                <label>כתובת החברה</label>
                <div className="profile-input-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>location_on</span>
                  <input className="profile-input-bare" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="רחוב הרצל 1, תל אביב" />
                </div>
              </div>

              <button
                className={`profile-save-btn ${profileSaved ? 'saved' : ''}`}
                onClick={handleSaveProfile}
                disabled={!name.trim()}
              >
                {profileSaved ? (
                  <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span> נשמר!</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span> שמור שינויים</>
                )}
              </button>
            </div>
          )}

          {/* ── Security tab ── */}
          {tab === 'security' && (
            <div className="profile-fields">
              <div className="profile-security-banner">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>
                  {hasPassword ? 'lock' : 'lock_open'}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {hasPassword ? 'סיסמה מוגדרת' : 'אין סיסמה'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                    {hasPassword
                      ? 'הסביבה מוגנת. כל כניסה לאפליקציה תדרוש סיסמה.'
                      : 'הגדר סיסמה כדי לאבטח את הכניסה לסביבת העבודה.'}
                  </div>
                </div>
              </div>

              {hasPassword && (
                <div className="profile-field">
                  <label>סיסמה נוכחית</label>
                  <div className="profile-input-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>lock</span>
                    <input
                      className="profile-input-bare"
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => { setCurrentPassword(e.target.value); setPasswordError(''); }}
                      placeholder="הסיסמה הנוכחית"
                      dir="ltr"
                    />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowCurrent(v => !v)} tabIndex={-1}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{showCurrent ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="profile-field">
                <label>{hasPassword ? 'סיסמה חדשה' : 'הגדר סיסמה'}</label>
                <div className="profile-input-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>key</span>
                  <input
                    className="profile-input-bare"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }}
                    placeholder="לפחות 6 תווים"
                    dir="ltr"
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{showNew ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="profile-field">
                <label>אימות סיסמה</label>
                <div className="profile-input-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>key</span>
                  <input
                    className="profile-input-bare"
                    type="password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                    placeholder="הכנס שוב"
                    dir="ltr"
                    onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                  />
                </div>
              </div>

              {/* Password strength */}
              {newPassword && (
                <div className="password-strength">
                  <div className="password-strength-bar">
                    {[1,2,3,4].map(n => (
                      <div
                        key={n}
                        className="password-strength-seg"
                        style={{
                          background: newPassword.length >= n * 3
                            ? n <= 1 ? '#e2445c' : n <= 2 ? '#fdab3d' : n <= 3 ? '#f2d600' : '#00c875'
                            : 'var(--outline-variant)'
                        }}
                      />
                    ))}
                  </div>
                  <span className="password-strength-label">
                    {newPassword.length < 4 ? 'חלשה' : newPassword.length < 8 ? 'בינונית' : newPassword.length < 12 ? 'חזקה' : 'חזקה מאוד'}
                  </span>
                </div>
              )}

              {passwordError && (
                <div className="profile-error">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                  {passwordError}
                </div>
              )}

              {passwordSaved && (
                <div className="profile-success">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                  {hasPassword ? 'הסיסמה הוסרה בהצלחה' : 'הסיסמה עודכנה בהצלחה!'}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexDirection: 'row-reverse' }}>
                <button
                  className="profile-save-btn"
                  onClick={handleChangePassword}
                  disabled={!newPassword || !confirmPassword}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                  {hasPassword ? 'עדכן סיסמה' : 'הגדר סיסמה'}
                </button>
                {hasPassword && (
                  <button className="profile-remove-btn" onClick={handleRemovePassword}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock_open</span>
                    הסר סיסמה
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
