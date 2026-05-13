'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Project, ProjectCategory } from '@/lib/types';

const CATEGORIES: {
  key: ProjectCategory;
  label: string;
  icon: string;
  color: string;
  bg: string;
}[] = [
  { key: 'marketing', label: 'שיווק',         icon: 'trending_up', color: '#00c875', bg: '#f0fdf4' },
  { key: 'promotion', label: 'קידום',          icon: 'ads_click',   color: '#fdab3d', bg: '#fffbeb' },
  { key: 'social',    label: 'סושיאל',         icon: 'groups',      color: '#9c27b0', bg: '#f3e5f5' },
  { key: 'design',    label: 'עיצוב',          icon: 'brush',       color: '#e91e63', bg: '#fce4ec' },
  { key: 'bizdev',    label: 'פיתוח עסקי',     icon: 'handshake',   color: '#0073ea', bg: '#e6f2ff' },
];

function ProjectCard({ project }: { project: Project }) {
  const { state, dispatch } = useStore();
  const taskCount = state.tasks.filter(t => {
    const group = state.groups.find(g => g.id === t.groupId);
    return group?.projectId === project.id;
  }).length;
  const doneCount = state.tasks.filter(t => {
    const group = state.groups.find(g => g.id === t.groupId);
    return group?.projectId === project.id && t.status === 'done';
  }).length;
  const linkedEvent = project.eventId ? state.events.find(e => e.id === project.eventId) : null;
  const members = project.memberIds.map(id => state.users.find(u => u.id === id)).filter(Boolean);

  const openProject = () => {
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });
    if (project.eventId) dispatch({ type: 'SET_ACTIVE_EVENT', payload: project.eventId });
  };

  return (
    <div className="mkt-project-card" onClick={openProject} style={{ borderTop: `3px solid ${project.color}` }}>
      <div className="mkt-project-card-header">
        <span className="mkt-project-icon">{project.icon}</span>
        <div className="mkt-project-name">{project.name}</div>
      </div>
      {project.description && (
        <div className="mkt-project-desc">{project.description}</div>
      )}
      <div className="mkt-project-meta">
        {linkedEvent && (
          <span className="mkt-event-tag">
            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>event</span>
            {linkedEvent.name.split(' ')[0]}
          </span>
        )}
        {!linkedEvent && (
          <span className="mkt-standalone-tag">עצמאי</span>
        )}
      </div>
      <div className="mkt-project-footer">
        <div className="mkt-project-tasks">
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>task_alt</span>
          {doneCount}/{taskCount} משימות
        </div>
        <div className="mkt-project-members">
          {members.slice(0, 3).map(u => (
            <div
              key={u!.id}
              className="mkt-member-avatar"
              style={{ background: u!.color }}
              title={u!.name}
            >
              {u!.avatar}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MarketingHubView() {
  const { state, dispatch } = useStore();

  // If an active marketing project is selected — handled by page.tsx (shows board)
  // This view shows the hub with all categories

  return (
    <div className="mkt-hub">
      <div className="mkt-hub-header">
        <h2 className="mkt-hub-title">
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--primary)' }}>campaign</span>
          מרכז שיווק
        </h2>
        <p className="mkt-hub-sub">כל הפרויקטים השיווקיים, מחולקים לפי קטגוריה</p>
      </div>

      <div className="mkt-hub-sections">
        {CATEGORIES.map(cat => {
          const projects = state.projects.filter(p => p.category === cat.key);
          return (
            <div key={cat.key} className="mkt-section">
              {/* Section header */}
              <div className="mkt-section-header" style={{ borderRight: `4px solid ${cat.color}` }}>
                <div className="mkt-section-title-row">
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: cat.color }}>
                    {cat.icon}
                  </span>
                  <span className="mkt-section-title">{cat.label}</span>
                  <span className="mkt-section-count" style={{ color: cat.color, background: cat.bg }}>
                    {projects.length}
                  </span>
                </div>
                <button
                  className="mkt-add-project-btn"
                  style={{ color: cat.color }}
                  onClick={() => dispatch({ type: 'OPEN_NEW_PROJECT_MODAL', payload: { category: cat.key } })}
                  title={`הוסף פרויקט ${cat.label}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  הוסף פרויקט
                </button>
              </div>

              {/* Project cards */}
              <div className="mkt-projects-row">
                {projects.length === 0 ? (
                  <div className="mkt-empty-cat">
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--outline-variant)' }}>
                      {cat.icon}
                    </span>
                    <span>אין פרויקטים בקטגוריה זו</span>
                  </div>
                ) : (
                  projects.map(p => <ProjectCard key={p.id} project={p} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
