'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';

const ROLE_LABELS: Record<string, string> = {
  owner: 'בעלים',
  member: 'חבר',
  viewer: 'צופה',
};

export function InviteModal() {
  const { state, dispatch } = useStore();
  const [email, setEmail] = useState('');
  const [invited, setInvited] = useState(false);
  const [error, setError] = useState('');

  const project = state.projects.find(p => p.id === state.activeProjectId);
  const projectMembers = project
    ? state.users.filter(u => project.memberIds.includes(u.id))
    : state.users;

  if (!state.inviteModalOpen) return null;

  const handleInvite = () => {
    if (!email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('כתובת אימייל לא תקינה');
      return;
    }
    dispatch({
      type: 'INVITE_USER',
      payload: { email: email.trim(), projectId: state.activeProjectId || '' },
    });
    setInvited(true);
    setEmail('');
    setError('');
    setTimeout(() => setInvited(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_INVITE_MODAL' })}>
      <div className="invite-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="invite-modal-header">
          <button className="modal-close-btn" onClick={() => dispatch({ type: 'CLOSE_INVITE_MODAL' })}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <div>
            <h2 className="invite-modal-title">הזמן חברי צוות</h2>
            {project && (
              <p className="invite-modal-sub">הוספה לפרויקט: {project.name}</p>
            )}
          </div>
        </div>

        {/* Email input */}
        <div className="invite-modal-body">
          <label className="invite-label">כתובת אימייל</label>
          <div className="invite-input-row">
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)', flexShrink: 0 }}>
              mail
            </span>
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
            <button
              className={`invite-send-btn ${invited ? 'success' : ''}`}
              onClick={handleInvite}
            >
              {invited ? (
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
              ) : 'שלח'}
            </button>
          </div>
          {error && (
            <p className="invite-error">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
              {error}
            </p>
          )}

          {/* Members list */}
          <div className="invite-members-section">
            <div className="invite-members-title">
              חברי צוות ({projectMembers.length})
            </div>
            <div className="invite-members-list">
              {projectMembers.map(member => (
                <div key={member.id} className="invite-member-row">
                  <div className="invite-member-avatar" style={{ background: member.color }}>
                    {member.avatar}
                  </div>
                  <div className="invite-member-info">
                    <div className="invite-member-name">
                      {member.name}
                      {member.status === 'pending' && (
                        <span className="invite-pending-tag">ממתין</span>
                      )}
                    </div>
                    <div className="invite-member-email">{member.email}</div>
                  </div>
                  <div className="invite-member-role">
                    {ROLE_LABELS[member.role] || member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invite-modal-footer">
          <button
            className="btn-primary"
            onClick={() => dispatch({ type: 'CLOSE_INVITE_MODAL' })}
          >
            סיום
          </button>
        </div>
      </div>
    </div>
  );
}
