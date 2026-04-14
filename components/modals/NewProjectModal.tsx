'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ProjectCategory } from '@/lib/types';

const PROJECT_COLORS = [
  '#0073ea', '#e2445c', '#fdab3d', '#00c875', '#9c27b0',
  '#f44336', '#00bcd4', '#8bc34a', '#ff5722', '#607d8b',
];

const PROJECT_ICONS = ['🌐', '📱', '📣', '🎯', '🚀', '💡', '📊', '🔧', '🎨', '📦'];

const MKT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'marketing', label: 'שיווק' },
  { value: 'promotion', label: 'קידום' },
  { value: 'social',    label: 'סושיאל' },
  { value: 'design',    label: 'עיצוב' },
  { value: 'bizdev',    label: 'פיתוח עסקי' },
];

export function NewProjectModal() {
  const { state, dispatch } = useStore();
  const isMktSection = ['marketing','promotion','social','design','bizdev'].includes(state.activeSection);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(PROJECT_ICONS[0]);
  const [category, setCategory] = useState<ProjectCategory | null>(isMktSection ? 'marketing' : null);
  const [linkedEventId, setLinkedEventId] = useState<string | null>(
    isMktSection ? null : (state.activeEventId || null)
  );

  if (!state.newProjectModalOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;
    dispatch({
      type: 'CREATE_PROJECT',
      payload: {
        name: name.trim(),
        description: description.trim(),
        color,
        icon,
        defaultView: 'table',
        category,
        eventId: category ? linkedEventId : state.activeEventId,
      },
    });
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    setIcon(PROJECT_ICONS[0]);
    setCategory(isMktSection ? 'marketing' : null);
    setLinkedEventId(isMktSection ? null : (state.activeEventId || null));
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_NEW_PROJECT_MODAL' })}>
      <div className="small-modal" onClick={e => e.stopPropagation()}>
        <div className="small-modal-header">
          <button className="modal-close-btn" onClick={() => dispatch({ type: 'CLOSE_NEW_PROJECT_MODAL' })}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2>פרויקט חדש</h2>
        </div>

        <div className="small-modal-body">
          {/* Category selector */}
          <div className="form-field">
            <label>סוג פרויקט</label>
            <div className="new-proj-type-row">
              <button
                className={`new-proj-type-btn ${category === null ? 'active' : ''}`}
                onClick={() => { setCategory(null); setLinkedEventId(state.activeEventId || null); }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>event</span>
                תפעולי (מקושר לאירוע)
              </button>
              <button
                className={`new-proj-type-btn ${category !== null ? 'active' : ''}`}
                onClick={() => setCategory('marketing')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>campaign</span>
                שיווקי
              </button>
            </div>
          </div>

          {/* Marketing category picker */}
          {category !== null && (
            <div className="form-field">
              <label>קטגוריה שיווקית</label>
              <div className="new-proj-cat-row">
                {MKT_CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    className={`new-proj-cat-btn ${category === c.value ? 'active' : ''}`}
                    onClick={() => setCategory(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Event link (optional for marketing, required for ops) */}
          <div className="form-field">
            <label>{category !== null ? 'קישור לאירוע (אופציונלי)' : 'אירוע'}</label>
            <select
              className="form-input"
              value={linkedEventId || ''}
              onChange={e => setLinkedEventId(e.target.value || null)}
            >
              {category !== null && <option value="">ללא אירוע (עצמאי)</option>}
              {state.events.filter(ev => ev.status !== 'archived').map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>

          {/* Icon picker */}
          <div className="form-field">
            <label>אייקון</label>
            <div className="icon-grid">
              {PROJECT_ICONS.map(i => (
                <button
                  key={i}
                  className={`icon-btn ${icon === i ? 'selected' : ''}`}
                  onClick={() => setIcon(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="form-field">
            <label>שם הפרויקט *</label>
            <input
              className="form-input"
              placeholder="למשל: עיצוב מחדש של האתר"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <label>תיאור</label>
            <textarea
              className="form-input form-textarea"
              placeholder="על מה הפרויקט?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Color picker */}
          <div className="form-field">
            <label>צבע</label>
            <div className="color-grid">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="project-preview" style={{ borderRight: `4px solid ${color}`, borderLeft: 'none' }}>
            <span className="preview-icon">{icon}</span>
            <div style={{ textAlign: 'right' }}>
              <div className="preview-name">{name || 'שם הפרויקט'}</div>
              <div className="preview-desc">{description || 'אין תיאור'}</div>
            </div>
          </div>
        </div>

        <div className="small-modal-footer">
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            צור פרויקט
          </button>
          <button className="btn-secondary" onClick={() => dispatch({ type: 'CLOSE_NEW_PROJECT_MODAL' })}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
