'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

const ROLE_OPTIONS = [
  { value: 'member', label: 'עובד', desc: 'גישה לפרויקטים ומשימות', icon: 'badge' },
  { value: 'viewer', label: 'צופה', desc: 'גישת קריאה בלבד', icon: 'visibility' },
  { value: 'owner',  label: 'מנהל', desc: 'גישה מלאה כולל הגדרות', icon: 'manage_accounts' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#f0fdf4', color: '#16a34a', label: 'פעיל' },
  pending:  { bg: '#fffbeb', color: '#d97706', label: 'ממתין' },
  inactive: { bg: '#f3f4f6', color: '#6b7280', label: 'לא פעיל' },
};

function generateInviteToken() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function InviteModal() {
  const { state, dispatch } = useStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'viewer' | 'owner'>('member');
  const [step, setStep] = useState<'form' | 'link'>('form');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!state.inviteModalOpen) return null;

  const close = () => {
    dispatch({ type: 'CLOSE_INVITE_MODAL' });
    setTimeout(() => { setStep('form'); setEmail(''); setError(''); setCopied(false); }, 300);
  };

  const handleInvite = () => {
    if (!email.trim()) { setError('נא להזין כתובת אימייל'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('כתובת אימייל לא תקינה'); return; }

    const token = generateInviteToken();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/invite/${token}?email=${encodeURIComponent(email.trim())}&role=${role}&workspace=${encodeURIComponent(state.workspaceName)}`;

    dispatch({ type: 'INVITE_USER', payload: { email: email.trim(), projectId: state.activeProjectId || '' } });
    setInviteLink(link);
    setStep('link');
    setError('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const allMembers = state.users;

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="invite-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="invite-modal-header">
          <button className="modal-close-btn" onClick={close}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <div>
            <h2 className="invite-modal-title">הזמן משתתפים</h2>
            <p className="invite-modal-sub">{state.workspaceName} · {allMembers.length} חברי צוות</p>
          </div>
        </div>

        <div className="invite-modal-body">
          {step === 'form' ? (
            <>
              {/* Role selector */}
              <div className="invite-role-grid">
                {ROLE_OPTIONS.map(r => (
                  <button
                    key={r.value}
                    className={`invite-role-card ${role === r.value ? 'active' : ''}`}
                    onClick={() => setRole(r.value as typeof role)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{r.icon}</span>
                    <span className="invite-role-label">{r.label}</span>
                    <span className="invite-role-desc">{r.desc}</span>
                  </button>
                ))}
              </div>

              {/* Email input */}
              <label className="invite-label">כתובת אימייל</label>
              <div className="invite-input-row">
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)', flexShrink: 0 }}>mail</span>
                <input
                  className="invite-input"
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  dir="ltr"
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  autoFocus
                />
              </div>
              {error && (
                <p className="invite-error">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
                  {error}
                </p>
              )}

              <button className="btn-primary invite-send-full-btn" onClick={handleInvite} disabled={!email.trim()}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                צור לינק הזמנה
              </button>
            </>
          ) : (
            /* Link step */
            <div className="invite-link-step">
              <div className="invite-link-success-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#00c875' }}>check_circle</span>
              </div>
              <h3 className="invite-link-title">הלינק מוכן</h3>
              <p className="invite-link-sub">שתף את הלינק הזה עם <strong>{email}</strong><br/>הם יוכלו להצטרף לסביבת העבודה</p>

              <div className="invite-link-box">
                <span className="invite-link-text" dir="ltr">{inviteLink}</span>
                <button className={`invite-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'הועתק!' : 'העתק'}
                </button>
              </div>

              <div className="invite-link-hint">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
                הלינק בתוקף ל-48 שעות · תפקיד: {ROLE_OPTIONS.find(r => r.value === role)?.label}
              </div>

              <button className="btn-secondary" style={{ width: '100%', marginTop: 8 }}
                onClick={() => { setStep('form'); setEmail(''); }}>
                הזמן עוד
              </button>
            </div>
          )}

          {/* Members list */}
          <div className="invite-members-section">
            <div className="invite-members-title">חברי הצוות ({allMembers.length})</div>
            <div className="invite-members-list">
              {allMembers.map(member => {
                const st = STATUS_STYLE[member.status] || STATUS_STYLE.inactive;
                return (
                  <div key={member.id} className="invite-member-row">
                    <div className="invite-member-avatar" style={{ background: member.color }}>{member.avatar}</div>
                    <div className="invite-member-info">
                      <div className="invite-member-name">{member.name}</div>
                      <div className="invite-member-email">{member.email}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                        {ROLE_OPTIONS.find(r => r.value === member.role)?.label || member.role}
                      </span>
                      <span style={{ fontSize: 10, background: st.bg, color: st.color, padding: '1px 6px', borderRadius: 999, fontWeight: 600 }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
