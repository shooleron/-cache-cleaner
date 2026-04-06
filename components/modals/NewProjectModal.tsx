'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { X } from 'lucide-react';

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
          <h2>New Project</h2>
          <button className="modal-close-btn" onClick={() => dispatch({ type: 'CLOSE_NEW_PROJECT_MODAL' })}>
            <X size={18} />
          </button>
        </div>

        <div className="small-modal-body">
          {/* Icon picker */}
          <div className="form-field">
            <label>Icon</label>
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
            <label>Project Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <label>Description</label>
            <textarea
              className="form-input form-textarea"
              placeholder="What is this project about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Color picker */}
          <div className="form-field">
            <label>Color</label>
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
          <div className="project-preview" style={{ borderLeft: `4px solid ${color}` }}>
            <span className="preview-icon">{icon}</span>
            <div>
              <div className="preview-name">{name || 'Project Name'}</div>
              <div className="preview-desc">{description || 'No description'}</div>
            </div>
          </div>
        </div>

        <div className="small-modal-footer">
          <button className="btn-secondary" onClick={() => dispatch({ type: 'CLOSE_NEW_PROJECT_MODAL' })}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
