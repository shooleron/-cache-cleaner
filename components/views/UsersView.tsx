'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { User, UserRole, UserStatus } from '@/lib/types';

const ROLE_LABELS: Record<UserRole, { label: string; bg: string; color: string }> = {
  owner:  { label: 'בעלים',  bg: '#ede9fe', color: '#7c3aed' },
  member: { label: 'חבר',    bg: '#e0f2fe', color: '#0369a1' },
  viewer: { label: 'צופה',   bg: '#f0fdf4', color: '#16a34a' },
};

const STATUS_LABELS: Record<UserStatus, { label: string; bg: string; color: string }> = {
  active:   { label: 'פעיל',    bg: '#f0fdf4', color: '#16a34a' },
  inactive: { label: 'לא פעיל', bg: '#f3f4f6', color: '#6b7280' },
  pending:  { label: 'ממתין',   bg: '#fffbeb', color: '#d97706' },
};

const AVATAR_COLORS = [
  '#5a45cb','#e2445c','#00c875','#fdab3d','#0073ea',
  '#9c27b0','#00bcd4','#ff5722','#607d8b','#8bc34a',
];

function UserModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { state } = useStore();
  if (!user) return null;

  const userTasks = state.tasks.filter(t => t.assigneeIds.includes(user.id));
  const doneTasks = userTasks.filter(t => t.status === 'done').length;
  const activeTasks = userTasks.filter(t => t.status === 'in_progress').length;
  const userProjects = state.projects.filter(p => p.memberIds.includes(user.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-modal" onClick={e => e.stopPropagation()}>
        <div className="user-modal-header">
          <div className="user-modal-avatar" style={{ background: user.color }}>
            {user.avatar}
          </div>
          <div className="user-modal-identity">
            <h2 className="user-modal-name">{user.name}</h2>
            <p className="user-modal-email">{user.email}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexDirection: 'row-reverse' }}>
              <span className="user-badge" style={{ background: ROLE_LABELS[user.role].bg, color: ROLE_LABELS[user.role].color }}>
                {ROLE_LABELS[user.role].label}
              </span>
              <span className="user-badge" style={{ background: STATUS_LABELS[user.status].bg, color: STATUS_LABELS[user.status].color }}>
                {STATUS_LABELS[user.status].label}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="user-modal-body">
          {/* Stats */}
          <div className="user-stats-grid">
            <div className="user-stat-card">
              <div className="user-stat-val" style={{ color: 'var(--primary)' }}>{userTasks.length}</div>
              <div className="user-stat-label">סה״כ משימות</div>
            </div>
            <div className="user-stat-card">
              <div className="user-stat-val" style={{ color: '#fdab3d' }}>{activeTasks}</div>
              <div className="user-stat-label">בתהליך</div>
            </div>
            <div className="user-stat-card">
              <div className="user-stat-val" style={{ color: '#00c875' }}>{doneTasks}</div>
              <div className="user-stat-label">הושלמו</div>
            </div>
            <div className="user-stat-card">
              <div className="user-stat-val" style={{ color: '#9c27b0' }}>{userProjects.length}</div>
              <div className="user-stat-label">פרויקטים</div>
            </div>
          </div>

          {/* Projects */}
          {userProjects.length > 0 && (
            <div className="user-modal-section">
              <h4>פרויקטים</h4>
              <div className="user-project-list">
                {userProjects.map(p => (
                  <div key={p.id} className="user-project-chip">
                    <span style={{ fontSize: 14 }}>{p.icon}</span>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active tasks */}
          {userTasks.filter(t => t.status !== 'done').length > 0 && (
            <div className="user-modal-section">
              <h4>משימות פעילות</h4>
              <div className="user-task-list">
                {userTasks.filter(t => t.status !== 'done').slice(0, 5).map(t => (
                  <div key={t.id} className="user-task-row">
                    <span className="user-task-dot" style={{
                      background: t.status === 'in_progress' ? '#fdab3d' : t.status === 'stuck' ? '#e2445c' : '#c4c4c4'
                    }} />
                    <span className="user-task-title">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UsersView() {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = state.users.filter(u => {
    const matchSearch = u.name.includes(search) || u.email.includes(search);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const activeCount = state.users.filter(u => u.status === 'active').length;
  const pendingCount = state.users.filter(u => u.status === 'pending').length;

  return (
    <div className="users-view">
      {/* Header */}
      <div className="users-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>משתמשים</h1>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
            {state.users.length} משתמשים · {activeCount} פעילים · {pendingCount} ממתינים
          </p>
        </div>
        <button className="btn-invite" onClick={() => state.inviteModalOpen || window.location.reload()}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
          הזמן משתמש
        </button>
      </div>

      {/* Filters */}
      <div className="users-toolbar">
        <div className="search-box">
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>search</span>
          <input
            className="search-inner"
            placeholder="חיפוש לפי שם או אימייל..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="role-filters">
          {(['all', 'owner', 'member', 'viewer'] as const).map(r => (
            <button
              key={r}
              className={`role-filter-btn ${filterRole === r ? 'active' : ''}`}
              onClick={() => setFilterRole(r)}
            >
              {r === 'all' ? 'הכל' : ROLE_LABELS[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* Users grid */}
      <div className="users-grid">
        {filtered.map(user => {
          const userTasks = state.tasks.filter(t => t.assigneeIds.includes(user.id));
          const done = userTasks.filter(t => t.status === 'done').length;
          const pct = userTasks.length > 0 ? Math.round((done / userTasks.length) * 100) : 0;

          return (
            <div key={user.id} className="user-card" onClick={() => setSelectedUser(user)}>
              <div className="user-card-top">
                <div className="user-card-avatar" style={{ background: user.color }}>
                  {user.avatar}
                </div>
                <div style={{ display: 'flex', gap: 6, flexDirection: 'row-reverse' }}>
                  <span className="user-badge" style={{ background: STATUS_LABELS[user.status].bg, color: STATUS_LABELS[user.status].color }}>
                    {STATUS_LABELS[user.status].label}
                  </span>
                </div>
              </div>

              <div className="user-card-name">{user.name}</div>
              <div className="user-card-email">{user.email}</div>

              <span className="user-badge user-role-badge" style={{ background: ROLE_LABELS[user.role].bg, color: ROLE_LABELS[user.role].color }}>
                {ROLE_LABELS[user.role].label}
              </span>

              <div className="user-card-progress">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--on-surface-variant)', marginBottom: 5, flexDirection: 'row-reverse' }}>
                  <span>{pct}% הושלם</span>
                  <span>{userTasks.length} משימות</span>
                </div>
                <div className="user-progress-track">
                  <div className="user-progress-fill" style={{ width: `${pct}%`, background: user.color }} />
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="users-empty">
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline)' }}>group_off</span>
            <p>לא נמצאו משתמשים</p>
          </div>
        )}
      </div>

      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
