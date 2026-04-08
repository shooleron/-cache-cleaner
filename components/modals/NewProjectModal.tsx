'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';

const PROJECT_COLORS = [
  '#0073ea', '#e2445c', '#fdab3d', '#00c875', '#9c27b0',
  '#f44336', '#00bcd4', '#8bc34a', '#ff5722', '#607d8b',
];

const PROJECT_ICONS = ['🌐', '📱', '📣', '🎯', '🚀', '💡', '📊', '🔧', '🎨', '📦'];

export function NewProjectModal() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(PROJECT_ICONS[0]);

  if (!state.newProjectModalOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return;
    dispatch({
      type: 'CREATE_PROJECT',
      payload: { name: name.trim(), description: description.trim(), color, icon, defaultView: 'table' },
    });
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    setIcon(PROJECT_ICONS[0]);
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
