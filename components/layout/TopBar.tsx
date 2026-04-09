'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { BoardView, CRMView } from '@/lib/types';

export function TopBar() {
  const { state, dispatch } = useStore();
  const activeProject = state.projects.find(p => p.id === state.activeProjectId);
  const activeEvent = state.events?.find(e => e.id === state.activeEventId);

  const sectionTitles: Record<string, string> = {
    dashboard: 'תפעול פנימי',
    crm: 'מכירות ו-CRM',
    automations: 'אוטומציות',
    events: activeProject?.name || 'אירועים',
    users: 'משתמשים',
    ai: 'AI אסיסטנט',
  };

  const views: { value: BoardView; label: string }[] = [
    { value: 'table', label: 'טבלה' },
    { value: 'kanban', label: 'קנבן' },
    { value: 'roadmap', label: 'רודמאפ' },
    { value: 'calendar', label: 'יומן' },
  ];

  const crmViews: { value: CRMView; label: string }[] = [
    { value: 'contacts', label: 'אנשי קשר' },
    { value: 'deals', label: 'עסקאות' },
  ];

  return (
    <header className="topbar">
      {/* Right side: title + nav */}
      <div className="topbar-right">
        <h1 className="topbar-title">{sectionTitles[state.activeSection]}</h1>

        {state.activeSection === 'events' && activeEvent && activeProject && (
          <div className="topbar-breadcrumb">
            <span className="topbar-breadcrumb-event">{activeEvent.name}</span>
            <span className="topbar-breadcrumb-sep">›</span>
            <span className="topbar-breadcrumb-project">{activeProject.name}</span>
          </div>
        )}

        {state.activeSection === 'events' && (
          <nav className="topbar-nav">
            {views.map(v => (
              <span
                key={v.value}
                className={`topbar-nav-link ${state.activeView === v.value ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: v.value })}
              >
                {v.label}
              </span>
            ))}
          </nav>
        )}

        {state.activeSection === 'crm' && (
          <nav className="topbar-nav">
            {crmViews.map(v => (
              <span
                key={v.value}
                className={`topbar-nav-link ${state.activeCRMView === v.value ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_CRM_VIEW', payload: v.value })}
              >
                {v.label}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Left side: actions + user */}
      <div className="topbar-left">
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">help</span>
        </button>

        <div style={{ width: 1, height: 32, background: 'var(--outline-variant)', margin: '0 4px' }} />

        <div className="topbar-user-chip">
          <div style={{ textAlign: 'right' }}>
            <div className="topbar-user-name">{state.currentUser.name}</div>
            <div className="topbar-user-role">{state.currentUser.jobTitle || 'מנהל תפעול'}</div>
          </div>
          <div
            className="topbar-user-avatar"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: state.currentUser.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 13, border: '2px solid white'
            }}
          >
            {state.currentUser.avatar}
          </div>
        </div>
      </div>
    </header>
  );
}
