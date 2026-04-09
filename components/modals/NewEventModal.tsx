'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';

const EVENT_COLORS = [
  '#0073ea', '#e2445c', '#fdab3d', '#00c875', '#9c27b0',
  '#f44336', '#00bcd4', '#8bc34a', '#ff5722', '#607d8b',
];

const EVENT_ICONS = ['🏗️', '💻', '🎤', '🎯', '🌐', '📊', '🏆', '🎨', '🤝', '📣'];

export function NewEventModal() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState(EVENT_COLORS[0]);
  const [icon, setIcon] = useState(EVENT_ICONS[0]);

  if (!state.newEventModalOpen) return null;

  const handleCreate = () => {
    if (!name.trim() || !date) return;
    dispatch({
      type: 'CREATE_EVENT',
      payload: {
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        date,
        endDate: endDate || null,
        status: 'draft',
        color,
        icon,
        parentEventId: null,
      },
    });
    dispatch({ type: 'CLOSE_NEW_EVENT_MODAL' });
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_NEW_EVENT_MODAL' })}>
      <div className="small-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="small-modal-header">
          <button className="modal-close-btn" onClick={() => dispatch({ type: 'CLOSE_NEW_EVENT_MODAL' })}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2>אירוע חדש</h2>
        </div>

        <div className="small-modal-body">
          {/* Icon picker */}
          <div className="form-field">
            <label>אייקון</label>
            <div className="icon-grid">
              {EVENT_ICONS.map(i => (
                <button key={i} className={`icon-btn ${icon === i ? 'selected' : ''}`} onClick={() => setIcon(i)}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="form-field">
            <label>שם האירוע *</label>
            <input
              className="form-input"
              placeholder="למשל: ועידת הנדל״ן אילת 2026"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <label>תיאור</label>
            <textarea
              className="form-input form-textarea"
              placeholder="על מה האירוע?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Location */}
          <div className="form-field">
            <label>מיקום</label>
            <div className="input-with-icon-wrap">
              <span className="material-symbols-outlined input-icon">location_on</span>
              <input
                className="form-input form-input-icon"
                placeholder="אילת, תל אביב, אונליין..."
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="form-two-col">
            <div className="form-field">
              <label>תאריך פתיחה *</label>
              <input
                className="form-input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>תאריך סיום</label>
              <input
                className="form-input"
                type="date"
                value={endDate}
                min={date}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="form-field">
            <label>צבע</label>
            <div className="color-grid">
              {EVENT_COLORS.map(c => (
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
              <div className="preview-name">{name || 'שם האירוע'}</div>
              <div className="preview-desc">
                {location && `📍 ${location}`}{location && date && ' · '}
                {date && new Date(date).toLocaleDateString('he-IL')}
              </div>
            </div>
          </div>
        </div>

        <div className="small-modal-footer">
          <button className="btn-primary" onClick={handleCreate} disabled={!name.trim() || !date}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            צור אירוע
          </button>
          <button className="btn-secondary" onClick={() => dispatch({ type: 'CLOSE_NEW_EVENT_MODAL' })}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
