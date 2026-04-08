'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { AppSection } from '@/lib/types';

export function Sidebar() {
  const { state, dispatch } = useStore();
  const [projectsOpen, setProjectsOpen] = useState(true);

  function setSection(section: AppSection) {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  }

  const navItems: { section: AppSection; icon: string; label: string }[] = [
    { section: 'crm', icon: 'payments', label: 'מכירות' },
    { section: 'dashboard', icon: 'dashboard', label: 'תפעול' },
    { section: 'automations', icon: 'bolt', label: 'אוטומציות' },
    { section: 'projects', icon: 'event', label: 'ניהול פרויקטים' },
    { section: 'users', icon: 'group', label: 'משתמשים' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">A</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">אטלייה</span>
          <span className="sidebar-logo-sub">ניהול פרודוקטיביות</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.section}
            className={`sidebar-item ${state.activeSection === item.section ? 'active' : ''}`}
            onClick={() => setSection(item.section)}
          >
            <span className="material-symbols-outlined sidebar-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        {/* Projects sub-list */}
        {state.activeSection === 'projects' && projectsOpen && state.projects.map(project => (
          <div
            key={project.id}
            className={`sidebar-item ${state.activeProjectId === project.id ? 'active' : ''}`}
            style={{ paddingRight: '32px', fontSize: '13px' }}
            onClick={() => dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id })}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
            <span>{project.name}</span>
          </div>
        ))}
      </nav>

      {/* Add project button */}
      <button
        className="sidebar-add-btn"
        onClick={() => dispatch({ type: 'OPEN_NEW_PROJECT_MODAL' })}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
        הוסף פרויקט
      </button>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          className="sidebar-item"
          style={{ color: state.aiPanelOpen ? 'var(--primary)' : undefined }}
          onClick={() => dispatch({ type: 'TOGGLE_AI_PANEL' })}
        >
          <span className="material-symbols-outlined sidebar-item-icon">smart_toy</span>
          <span>AI אסיסטנט</span>
        </div>
        <div className="sidebar-item" onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' })}>
          <span className="material-symbols-outlined sidebar-item-icon">settings</span>
          <span>הגדרות</span>
        </div>
        <div className="sidebar-item">
          <span className="material-symbols-outlined sidebar-item-icon">contact_support</span>
          <span>עזרה</span>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar" style={{ background: state.currentUser.color }}>
            {state.currentUser.avatar}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{state.currentUser.name}</div>
            <div className="sidebar-user-role">מנהל תפעול</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
