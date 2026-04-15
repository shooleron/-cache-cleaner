'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [mktOpen, setMktOpen] = useState(false);
  const [rdOpen, setRdOpen] = useState(state.activeSection === 'rd');
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set(['brand-1']));
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const admin = isAdmin(state.currentUser);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

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
    { section: 'dashboard', icon: 'dashboard', label: 'ראשי' },
    { section: 'events', icon: 'event', label: 'אירועים' },
  ];

  const mgmtNavItems: { section: AppSection; icon: string; label: string }[] = [
    { section: 'crm', icon: 'payments', label: 'מכירות' },
    { section: 'speakers', icon: 'mic', label: 'דוברים' },
  ];

  const isMgmtActive = state.activeSection === 'crm' || state.activeSection === 'speakers';
  const isMktActive = state.activeSection === 'marketing' || state.activeSection === 'promotion' || state.activeSection === 'social' || state.activeSection === 'design' || state.activeSection === 'bizdev';
  const activeEvents = state.events.filter(e => e.status !== 'archived');
  const archivedEvents = state.events.filter(e => e.status === 'archived');

  function toggleBrand(brandId: string) {
    setExpandedBrands(prev => {
      const next = new Set(prev);
      if (next.has(brandId)) next.delete(brandId);
      else next.add(brandId);
      return next;
    });
  }

  function handleAddBrand() {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    dispatch({ type: 'CREATE_BRAND', payload: { name: trimmed, color: '#0073ea', icon: '🏢' } });
    setNewBrandName('');
    setShowNewBrand(false);
  }

  return (
    <aside className="sidebar">
      {/* Logo — מרכז הנדל״ן */}
      <div style={{ padding: '16px 12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <svg viewBox="0 0 224 56" width="224" height="56" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', overflow: 'visible' }}>
          {/* ── Geometric icon (right side) ── */}
          <g transform="translate(162, 0)">
            <rect x="0" y="0" width="56" height="56" fill="#5400C8" rx="4"/>
            <rect x="7" y="19" width="24" height="24" fill="white" rx="1"/>
            <polygon points="28,0 56,0 56,27" fill="#3a0090"/>
          </g>
          {/* ── Text (left of icon) ── */}
          <text
            x="154" y="24"
            textAnchor="end"
            fontFamily="'Arial Black', Arial, sans-serif"
            fontSize="27" fontWeight="900" fill="#FF5800"
          >מרכז</text>
          <text
            x="154" y="52"
            textAnchor="end"
            fontFamily="'Arial Black', Arial, sans-serif"
            fontSize="22" fontWeight="900" fill="#5400C8"
          >הנדל״ן</text>
        </svg>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {mainNavItems.map(item => (
          <div key={item.section}>
            <div
              className={`sidebar-item ${state.activeSection === item.section || (item.section === 'dashboard' && state.activeSection === 'my-tasks') ? 'active' : ''}`}
              onClick={() => setSection(item.section)}
            >
              <span style={{ flex: 1, textAlign: 'right' }}>{item.label}</span>
              <span className="material-symbols-outlined sidebar-item-icon">{item.icon}</span>
            </div>
            {item.section === 'dashboard' && (state.activeSection === 'dashboard' || state.activeSection === 'my-tasks') && (
              <div className="sidebar-group-items">
                <div
                  className={`sidebar-item sidebar-sub-item ${state.activeSection === 'my-tasks' ? 'active' : ''}`}
                  onClick={() => setSection('my-tasks')}
                >
                  <span style={{ flex: 1, textAlign: 'right' }}>המשימות שלי</span>
                  <span className="material-symbols-outlined sidebar-item-icon">task_alt</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Events sub-list — flat list of events */}
        {state.activeSection === 'events' && (
          <div className="sidebar-events-list">
            {activeEvents.map(event => {
              const eventProjects = state.projects.filter(p => p.eventId === event.id);
              const isExpanded = expandedEvents.has(event.id);
              return (
                <div key={event.id} className="sidebar-event-group">
                  <SidebarEventRow
                    event={event}
                    isExpanded={isExpanded}
                    onToggle={() => { toggleEvent(event.id); dispatch({ type: 'SET_ACTIVE_EVENT', payload: event.id }); }}
                    isActive={state.activeEventId === event.id}
                    dispatch={dispatch}
                  />
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
          <span className="material-symbols-outlined" style={{ fontSize: 15, transition: 'transform 0.2s', transform: mgmtOpen ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            chevron_left
          </span>
          <span style={{ flex: 1, textAlign: 'right' }}>ניהול</span>
          <span className="material-symbols-outlined sidebar-item-icon">manage_accounts</span>
        </div>
        {mgmtOpen && (
          <div className="sidebar-group-items">
            {mgmtNavItems.map(item => (
              <div
                key={item.section}
                className={`sidebar-item sidebar-sub-item ${state.activeSection === item.section ? 'active' : ''}`}
                onClick={() => setSection(item.section)}
              >
                <span style={{ flex: 1, textAlign: 'right' }}>{item.label}</span>
                <span className="material-symbols-outlined sidebar-item-icon">{item.icon}</span>
              </div>
            ))}
          </div>
        )}

        {/* שיווק — פריט יחיד */}
        <div
          className={`sidebar-item ${isMktActive ? 'active' : ''}`}
          onClick={() => { setSection('marketing'); dispatch({ type: 'CLEAR_ACTIVE_PROJECT' }); }}
        >
          <span style={{ flex: 1, textAlign: 'right' }}>שיווק</span>
          <span className="material-symbols-outlined sidebar-item-icon">campaign</span>
        </div>

        {/* R&D — top-level section */}
        <div
          className={`sidebar-item sidebar-group-header ${state.activeSection === 'rd' ? 'active' : ''}`}
          onClick={() => { setRdOpen(o => !o); setSection('rd'); }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15, transition: 'transform 0.2s', transform: rdOpen ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            chevron_left
          </span>
          <span style={{ flex: 1, textAlign: 'right' }}>R&amp;D</span>
          <span className="material-symbols-outlined sidebar-item-icon">science</span>
        </div>
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

      {/* Footer — user row only, with dropdown */}
      <div className="sidebar-footer">
        <div className="sidebar-user-row" ref={userMenuRef}>
          {/* Clickable user row */}
          <div
            className="sidebar-user"
            onClick={() => setUserMenuOpen(o => !o)}
            style={{ cursor: 'pointer' }}
          >
            {/* Chevron — far left */}
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--outline)', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              expand_less
            </span>
            {/* Name + role — right side */}
            <div className="sidebar-user-info" style={{ flex: 1, textAlign: 'right' }}>
              <div className="sidebar-user-name">{state.currentUser.name}</div>
              <div className="sidebar-user-role">{state.currentUser.jobTitle || 'מנהל תפעול'}</div>
            </div>
            {/* Avatar — far right */}
            <div className="sidebar-user-avatar" style={{ background: state.currentUser.color }}>
              {state.currentUser.avatar}
            </div>
          </div>

          {/* Dropdown menu */}
          {userMenuOpen && (
            <div className="sidebar-user-dropdown">
              <button className="sidebar-dropdown-item" onClick={() => { setUserMenuOpen(false); dispatch({ type: 'OPEN_PROFILE_MODAL' }); }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>manage_accounts</span>
                <span>הפרופיל שלי</span>
              </button>
              {admin && (
                <button className="sidebar-dropdown-item" onClick={() => { setUserMenuOpen(false); dispatch({ type: 'OPEN_INVITE_MODAL' }); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>person_add</span>
                  <span>הזמן אנשי צוות</span>
                </button>
              )}
              {admin && (
                <button className="sidebar-dropdown-item" onClick={() => { setUserMenuOpen(false); dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'users' }); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17 }}>group</span>
                  <span>ניהול משתמשים</span>
                </button>
              )}
              <div className="sidebar-dropdown-divider" />
              <button className="sidebar-dropdown-item danger" onClick={() => { setUserMenuOpen(false); dispatch({ type: 'LOCK_APP' }); }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>lock</span>
                <span>נעל מסך</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating AI button — bottom-left of viewport */}
      <button
        className={`ai-float-btn ${state.aiPanelOpen ? 'active' : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_AI_PANEL' })}
        title="AI אסיסטנט"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 26 }}>smart_toy</span>
        {!state.aiPanelOpen && <span className="ai-float-label">AI</span>}
      </button>
    </aside>
  );
}
