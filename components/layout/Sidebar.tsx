'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { AppSection } from '@/lib/types';
import { isAdmin } from '@/lib/permissions';

const EVENT_STATUS_COLOR: Record<string, string> = {
  draft: '#fdab3d',
  active: '#00c875',
  completed: '#c4c4c4',
  archived: '#c4c4c4',
};

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function SidebarEventRow({ event, isExpanded, onToggle, isActive, dispatch }: {
  event: import('@/lib/types').Event; isExpanded: boolean; onToggle: () => void; isActive: boolean; dispatch: (a: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(event.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const save = () => {
    setEditing(false);
    if (name.trim() && name !== event.name)
      dispatch({ type: 'UPDATE_EVENT', payload: { id: event.id, name: name.trim() } });
  };

  return (
    <div className={`sidebar-event-item ${isActive ? 'active' : ''}`} onClick={onToggle}>
      <span className="material-symbols-outlined sidebar-chevron"
        style={{ fontSize: 14, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
        chevron_left
      </span>
      <span className="sidebar-event-dot" style={{ background: EVENT_STATUS_COLOR[event.status] }} />
      {editing ? (
        <input
          ref={inputRef}
          className="sidebar-inline-input"
          value={name}
          onClick={e => e.stopPropagation()}
          onChange={e => setName(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          autoFocus
        />
      ) : (
        <span className="sidebar-event-name" onDoubleClick={e => { e.stopPropagation(); setName(event.name); setEditing(true); }}>
          {event.name}
        </span>
      )}
      <span className="sidebar-event-date">{formatEventDate(event.date)}</span>
    </div>
  );
}

function SidebarProjectRow({ project, isActive, onSelect, dispatch }: {
  project: import('@/lib/types').Project; isActive: boolean; onSelect: () => void; dispatch: (a: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);

  const save = () => {
    setEditing(false);
    if (name.trim() && name !== project.name)
      dispatch({ type: 'UPDATE_PROJECT', payload: { id: project.id, name: name.trim() } });
  };

  return (
    <div className={`sidebar-project-item ${isActive ? 'active' : ''}`} onClick={onSelect}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
      {editing ? (
        <input
          className="sidebar-inline-input"
          value={name}
          onClick={e => e.stopPropagation()}
          onChange={e => setName(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          autoFocus
        />
      ) : (
        <span style={{ flex: 1, textAlign: 'right' }}
          onDoubleClick={e => { e.stopPropagation(); setName(project.name); setEditing(true); }}>
          {project.name}
        </span>
      )}
    </div>
  );
}

export function Sidebar() {
  const { state, dispatch } = useStore();
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(
    new Set(state.events.filter(e => e.status !== 'archived').map(e => e.id).slice(0, 2))
  );
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [mgmtOpen, setMgmtOpen] = useState(
    state.activeSection === 'crm' || state.activeSection === 'speakers'
  );
  const admin = isAdmin(state.currentUser);

  function setSection(section: AppSection) {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
  }

  function toggleEvent(eventId: string) {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }

  function selectProject(projectId: string, eventId: string) {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: projectId });
    dispatch({ type: 'SET_ACTIVE_EVENT', payload: eventId });
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'events' });
  }

  const mainNavItems: { section: AppSection; icon: string; label: string }[] = [
    { section: 'dashboard', icon: 'dashboard', label: 'דשבורד' },
    { section: 'my-tasks', icon: 'task_alt', label: 'המשימות שלי' },
    { section: 'events', icon: 'event', label: 'אירועים' },
  ];

  const mgmtNavItems: { section: AppSection; icon: string; label: string }[] = [
    { section: 'crm', icon: 'payments', label: 'מכירות' },
    { section: 'speakers', icon: 'mic', label: 'דוברים' },
  ];

  const isMgmtActive = state.activeSection === 'crm' || state.activeSection === 'speakers';
  const activeEvents = state.events.filter(e => e.status !== 'archived');
  const archivedEvents = state.events.filter(e => e.status === 'archived');

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">A</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">{state.workspaceName || 'אטלייה'}</span>
          <span className="sidebar-logo-sub">סביבת עבודה</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {mainNavItems.map(item => (
          <div
            key={item.section}
            className={`sidebar-item ${state.activeSection === item.section ? 'active' : ''}`}
            onClick={() => setSection(item.section)}
          >
            <span className="material-symbols-outlined sidebar-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        {/* Events sub-list */}
        {state.activeSection === 'events' && (
          <div className="sidebar-events-list">
            {activeEvents.map(event => {
              const eventProjects = state.projects.filter(p => p.eventId === event.id);
              const isExpanded = expandedEvents.has(event.id);
              return (
                <div key={event.id} className="sidebar-event-group">
                  <SidebarEventRow event={event} isExpanded={isExpanded} onToggle={() => { toggleEvent(event.id); dispatch({ type: 'SET_ACTIVE_EVENT', payload: event.id }); }} isActive={state.activeEventId === event.id} dispatch={dispatch} />
                  {isExpanded && eventProjects.map(project => (
                    <SidebarProjectRow key={project.id} project={project} isActive={state.activeProjectId === project.id} onSelect={() => selectProject(project.id, event.id)} dispatch={dispatch} />
                  ))}
                </div>
              );
            })}
            {archivedEvents.length > 0 && (
              <div className="sidebar-archive-section">
                <div className="sidebar-archive-toggle" onClick={() => setArchiveOpen(o => !o)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {archiveOpen ? 'expand_less' : 'expand_more'}
                  </span>
                  <span>ארכיון ({archivedEvents.length})</span>
                </div>
                {archiveOpen && archivedEvents.map(event => (
                  <div key={event.id} className="sidebar-event-item archived">
                    <span className="sidebar-event-dot" style={{ background: '#c4c4c4' }} />
                    <span className="sidebar-event-name" style={{ color: 'var(--on-surface-variant)' }}>{event.name}</span>
                    <span className="sidebar-event-date">{new Date(event.date).getFullYear()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ניהול — collapsible group */}
        <div
          className={`sidebar-item sidebar-group-header ${isMgmtActive ? 'active' : ''}`}
          onClick={() => setMgmtOpen(o => !o)}
        >
          <span className="material-symbols-outlined sidebar-item-icon">manage_accounts</span>
          <span style={{ flex: 1 }}>ניהול</span>
          <span className="material-symbols-outlined" style={{ fontSize: 16, transition: 'transform 0.2s', transform: mgmtOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            chevron_left
          </span>
        </div>
        {mgmtOpen && (
          <div className="sidebar-group-items">
            {mgmtNavItems.map(item => (
              <div
                key={item.section}
                className={`sidebar-item sidebar-sub-item ${state.activeSection === item.section ? 'active' : ''}`}
                onClick={() => setSection(item.section)}
              >
                <span className="material-symbols-outlined sidebar-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Add event button — admin only */}
      {admin && state.activeSection === 'events' && (
        <button
          className="sidebar-add-btn"
          onClick={() => dispatch({ type: 'OPEN_NEW_EVENT_MODAL' })}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          הוסף אירוע
        </button>
      )}

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
        <div
          className="sidebar-user"
          onClick={() => dispatch({ type: 'OPEN_PROFILE_MODAL' })}
          style={{ cursor: 'pointer' }}
          title="פרופיל"
        >
          <div className="sidebar-user-avatar" style={{ background: state.currentUser.color }}>
            {state.currentUser.avatar}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{state.currentUser.name}</div>
            <div className="sidebar-user-role">{state.currentUser.jobTitle || 'מנהל תפעול'}</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {admin && (
              <button
                className="sidebar-lock-btn"
                onClick={e => { e.stopPropagation(); dispatch({ type: 'OPEN_INVITE_MODAL' }); }}
                title="הזמן משתתפים"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
              </button>
            )}
            {admin && (
              <button
                className="sidebar-lock-btn"
                onClick={e => { e.stopPropagation(); dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'users' }); }}
                title="משתמשים"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group</span>
              </button>
            )}
            <button
              className="sidebar-lock-btn"
              onClick={e => { e.stopPropagation(); dispatch({ type: 'LOCK_APP' }); }}
              title="נעל"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
