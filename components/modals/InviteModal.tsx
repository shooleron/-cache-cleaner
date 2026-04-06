'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { X, Mail, Check } from 'lucide-react';

export function InviteModal() {
  const { state, dispatch } = useStore();
  const [email, setEmail] = useState('');
  const [invited, setInvited] = useState(false);
  const [error, setError] = useState('');

  const project = state.projects.find(p => p.id === state.activeProjectId);
  const projectMembers = project
    ? state.users.filter(u => project.memberIds.includes(u.id))
    : [];

  if (!state.inviteModalOpen) return null;

  const handleInvite = () => {
    if (!email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (state.activeProjectId) {
      dispatch({ type: 'INVITE_USER', payload: { email: email.trim(), projectId: state.activeProjectId } });
      setInvited(true);
      setEmail('');
      setError('');
      setTimeout(() => setInvited(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_INVITE_MODAL' })}>
      <div className="small-modal" onClick={e => e.stopPropagation()}>
        <div className="small-modal-header">
          <h2>Invite Members</h2>
          <button className="modal-close-btn" onClick={() => dispatch({ type: 'CLOSE_INVITE_MODAL' })}>
            <X size={18} />
          </button>
        </div>

        <div className="small-modal-body">
          <p className="invite-subtitle">
            Invite people to <strong>{project?.name}</strong>
          </p>

          {/* Email input */}
          <div className="form-field">
            <label>Email Address</label>
            <div className="invite-input-row">
              <Mail size={16} className="invite-input-icon" />
              <input
                className="form-input invite-input"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                autoFocus
              />
              <button
                className={`invite-send-btn ${invited ? 'success' : ''}`}
                onClick={handleInvite}
              >
                {invited ? <Check size={14} /> : 'Invite'}
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>

          {/* Current members */}
          <div className="form-field">
            <label>Team Members ({projectMembers.length})</label>
            <div className="members-list">
              {projectMembers.map(member => (
                <div key={member.id} className="member-row">
                  <div className="member-avatar-md" style={{ background: member.color }}>
                    {member.avatar}
                  </div>
                  <div className="member-info">
                    <div className="member-name">
                      {member.name}
                      {member.status === 'pending' && (
                        <span className="pending-badge">Pending</span>
                      )}
                    </div>
                    <div className="member-email">{member.email}</div>
                  </div>
                  <div className="member-role">{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="small-modal-footer">
          <button className="btn-primary" onClick={() => dispatch({ type: 'CLOSE_INVITE_MODAL' })}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
