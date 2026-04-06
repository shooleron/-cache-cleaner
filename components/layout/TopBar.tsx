'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Search, Filter, UserPlus, LayoutGrid, List, GitBranch, Calendar, Contact2, TrendingUp } from 'lucide-react';
import { BoardView, CRMView } from '@/lib/types';

export function TopBar() {
  const { state, dispatch } = useStore();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);

  if (state.activeSection === 'dashboard') {
    return (
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-project-icon" style={{ background: '#0073ea' }}>📊</div>
          <div>
            <h1 className="topbar-project-name">Dashboard</h1>
            <p className="topbar-project-desc">Overview of your workspace</p>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="user-avatar-bar-inline">
            {state.users.filter(u => u.status === 'active').map(u => (
              <div key={u.id} className="member-avatar-small" style={{ background: u.color }} title={u.name}>{u.avatar}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state.activeSection === 'crm') {
    const crmViews: { value: CRMView; label: string; icon: React.ReactNode }[] = [
      { value: 'contacts', label: 'Contacts', icon: <Contact2 size={14} /> },
      { value: 'deals', label: 'Deals', icon: <TrendingUp size={14} /> },
    ];
    return (
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-project-icon" style={{ background: '#00c875' }}>🤝</div>
          <div>
            <h1 className="topbar-project-name">CRM</h1>
            <p className="topbar-project-desc">{state.contacts.length} contacts · {state.deals.length} deals</p>
          </div>
        </div>
        <div className="view-switcher">
          {crmViews.map(v => (
            <button
              key={v.value}
              className={`view-tab ${state.activeCRMView === v.value ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_CRM_VIEW', payload: v.value })}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          ))}
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn secondary"><Filter size={14} /><span>Filter</span></button>
        </div>
      </div>
    );
  }

  if (state.activeSection === 'automations') {
    return (
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-project-icon" style={{ background: '#fdab3d' }}>⚡</div>
          <div>
            <h1 className="topbar-project-name">Automations</h1>
            <p className="topbar-project-desc">{state.automations.filter(a => a.enabled).length} active rules</p>
          </div>
        </div>
      </div>
    );
  }

  // Projects section
  const views: { value: BoardView; label: string; icon: React.ReactNode }[] = [
    { value: 'table', label: 'Table', icon: <List size={14} /> },
    { value: 'kanban', label: 'Kanban', icon: <LayoutGrid size={14} /> },
    { value: 'roadmap', label: 'Roadmap', icon: <GitBranch size={14} /> },
    { value: 'calendar', label: 'Calendar', icon: <Calendar size={14} /> },
  ];

  if (!activeProject) return null;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-project-icon" style={{ background: activeProject.color }}>
          {activeProject.icon}
        </div>
        <div>
          <h1 className="topbar-project-name">{activeProject.name}</h1>
          {activeProject.description && (
            <p className="topbar-project-desc">{activeProject.description}</p>
          )}
        </div>
      </div>

      <div className="view-switcher">
        {views.map(v => (
          <button
            key={v.value}
            className={`view-tab ${state.activeView === v.value ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: v.value })}
          >
            {v.icon}
            <span>{v.label}</span>
          </button>
        ))}
      </div>

      <div className="topbar-actions">
        <button className="topbar-btn secondary"><Filter size={14} /><span>Filter</span></button>
        <button className="topbar-btn secondary"><Search size={14} /><span>Search</span></button>
        <button className="topbar-btn primary" onClick={() => dispatch({ type: 'OPEN_INVITE_MODAL' })}>
          <UserPlus size={14} />
          <span>Invite</span>
        </button>
        <div className="member-avatars">
          {activeProject.memberIds.slice(0, 4).map(memberId => {
            const member = state.users.find(u => u.id === memberId);
            if (!member) return null;
            return (
              <div key={memberId} className="member-avatar-small" style={{ background: member.color }} title={`${member.name}${member.status === 'pending' ? ' (Pending)' : ''}`}>
                {member.avatar}
                {member.status === 'pending' && <div className="pending-dot" />}
              </div>
            );
          })}
          {activeProject.memberIds.length > 4 && (
            <div className="member-avatar-small member-avatar-more">+{activeProject.memberIds.length - 4}</div>
          )}
        </div>
      </div>
    </div>
  );
}
