'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Speaker, SpeakerApprovalStatus } from '@/lib/types';
import { exportSpeakers } from '@/lib/exportExcel';

const APPROVAL_STYLE: Record<SpeakerApprovalStatus, { label: string; color: string; bg: string; icon: string }> = {
  approved:  { label: 'מאושר',   color: '#16a34a', bg: '#f0fdf4', icon: 'check_circle' },
  pending:   { label: 'ממתין',   color: '#d97706', bg: '#fffbeb', icon: 'schedule' },
  cancelled: { label: 'בוטל',    color: '#dc2626', bg: '#fef2f2', icon: 'cancel' },
};

const CV_STYLE = {
  received: { label: 'התקבל',  color: '#16a34a', icon: 'description' },
  pending:  { label: 'ממתין',  color: '#d97706', icon: 'hourglass_empty' },
};

const PHOTO_STYLE = {
  uploaded: { label: 'הועלתה', color: '#16a34a', icon: 'photo' },
  missing:  { label: 'חסרה',   color: '#d97706', icon: 'broken_image' },
};

const AVATAR_PALETTE = ['#5a45cb','#059669','#d97706','#dc2626','#7c3aed','#0284c7','#0891b2','#be185d','#0073ea','#e2445c'];
function avatarBg(name: string) { return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]; }

// ── Photo / Avatar ───────────────────────────────────────

function SpeakerAvatar({ speaker, size = 72 }: { speaker: Speaker; size?: number }) {
  if (speaker.photoUrl) {
    return (
      <img
        src={speaker.photoUrl}
        alt={speaker.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: avatarBg(speaker.name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 800,
      fontSize: size * 0.34,
      border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      fontFamily: 'Manrope, sans-serif',
      letterSpacing: 1,
    }}>
      {speaker.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
    </div>
  );
}

// ── Card view ────────────────────────────────────────────

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const { state, dispatch } = useStore();
  const approval = APPROVAL_STYLE[speaker.approvalStatus];
  const panelCount = speaker.panelIds.length;
  const eventName = speaker.eventIds[0]
    ? state.events.find(e => e.id === speaker.eventIds[0])?.name?.split(' ').slice(0, 2).join(' ')
    : null;

  return (
    <div
      className="speaker-card-v2"
      onClick={() => dispatch({ type: 'OPEN_SPEAKER_MODAL', payload: speaker.id })}
    >
      {/* Status bar at top */}
      <div className="speaker-card-v2-statusbar" style={{ background: approval.color }} />

      {/* Photo + identity */}
      <div className="speaker-card-v2-top">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <SpeakerAvatar speaker={speaker} size={80} />
          <span
            className="speaker-card-v2-dot"
            style={{ background: approval.color }}
            title={approval.label}
          />
        </div>
        <div className="speaker-card-v2-identity">
          <div className="speaker-card-v2-name">{speaker.name}</div>
          <div className="speaker-card-v2-title">{speaker.jobTitle}</div>
          <div className="speaker-card-v2-org">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>business</span>
            {speaker.organization}
          </div>
        </div>
      </div>

      {/* Status chips */}
      <div className="speaker-card-v2-chips">
        <span className="spkr-chip" style={{ color: approval.color, background: approval.bg }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{approval.icon}</span>
          {approval.label}
        </span>
        <span className="spkr-chip" style={{ color: CV_STYLE[speaker.cvStatus].color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{CV_STYLE[speaker.cvStatus].icon}</span>
          קו״ח
        </span>
        <span className="spkr-chip" style={{ color: PHOTO_STYLE[speaker.photoStatus].color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{PHOTO_STYLE[speaker.photoStatus].icon}</span>
          תמונה
        </span>
      </div>

      {/* Tags */}
      {speaker.tags.length > 0 && (
        <div className="speaker-card-v2-tags">
          {speaker.tags.slice(0, 3).map(t => <span key={t} className="speaker-tag">{t}</span>)}
        </div>
      )}

      {/* Footer */}
      <div className="speaker-card-v2-footer">
        <span className="spkr-footer-item">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mic</span>
          {panelCount} פאנלים
        </span>
        {eventName && <span className="speaker-event-tag">{eventName}</span>}
      </div>
    </div>
  );
}

// ── Table view ───────────────────────────────────────────

function SpeakerTableRow({ speaker }: { speaker: Speaker }) {
  const { state, dispatch } = useStore();
  const approval = APPROVAL_STYLE[speaker.approvalStatus];
  const eventName = speaker.eventIds[0]
    ? state.events.find(e => e.id === speaker.eventIds[0])?.name?.split(' ').slice(0, 2).join(' ')
    : '—';

  return (
    <tr
      className="speakers-table-row"
      onClick={() => dispatch({ type: 'OPEN_SPEAKER_MODAL', payload: speaker.id })}
    >
      {/* Photo + name */}
      <td className="speakers-table-cell">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'row-reverse' }}>
          <SpeakerAvatar speaker={speaker} size={40} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)' }}>{speaker.name}</div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{speaker.jobTitle}</div>
          </div>
        </div>
      </td>

      {/* Organization */}
      <td className="speakers-table-cell">
        <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{speaker.organization}</span>
      </td>

      {/* Approval */}
      <td className="speakers-table-cell">
        <span className="spkr-chip" style={{ color: approval.color, background: approval.bg }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{approval.icon}</span>
          {approval.label}
        </span>
      </td>

      {/* CV */}
      <td className="speakers-table-cell">
        <span className="spkr-chip" style={{ color: CV_STYLE[speaker.cvStatus].color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{CV_STYLE[speaker.cvStatus].icon}</span>
          {CV_STYLE[speaker.cvStatus].label}
        </span>
      </td>

      {/* Photo status */}
      <td className="speakers-table-cell">
        <span className="spkr-chip" style={{ color: PHOTO_STYLE[speaker.photoStatus].color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{PHOTO_STYLE[speaker.photoStatus].icon}</span>
          {PHOTO_STYLE[speaker.photoStatus].label}
        </span>
      </td>

      {/* Panels */}
      <td className="speakers-table-cell" style={{ textAlign: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{speaker.panelIds.length}</span>
      </td>

      {/* Event */}
      <td className="speakers-table-cell">
        {eventName !== '—'
          ? <span className="speaker-event-tag">{eventName}</span>
          : <span style={{ color: 'var(--outline-variant)', fontSize: 12 }}>—</span>
        }
      </td>

      {/* Contact */}
      <td className="speakers-table-cell">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
          {speaker.phone && (
            <a href={`tel:${speaker.phone}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none' }}>
              {speaker.phone}
            </a>
          )}
          {speaker.email && (
            <a href={`mailto:${speaker.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: 'var(--on-surface-variant)', textDecoration: 'none' }}>
              {speaker.email}
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main view ────────────────────────────────────────────

export function SpeakersView() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [filterApproval, setFilterApproval] = useState<'all' | SpeakerApprovalStatus>('all');
  const [filterCV, setFilterCV] = useState<'all' | 'received' | 'pending'>('all');
  const [filterPhoto, setFilterPhoto] = useState<'all' | 'uploaded' | 'missing'>('all');
  const [filterEvent, setFilterEvent] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filtered = state.speakers.filter(s => {
    if (search && !s.name.includes(search) && !s.organization.includes(search) && !s.jobTitle.includes(search)) return false;
    if (filterApproval !== 'all' && s.approvalStatus !== filterApproval) return false;
    if (filterCV !== 'all' && s.cvStatus !== filterCV) return false;
    if (filterPhoto !== 'all' && s.photoStatus !== filterPhoto) return false;
    if (filterEvent !== 'all' && !s.eventIds.includes(filterEvent)) return false;
    return true;
  });

  const stats = {
    total: state.speakers.length,
    approved: state.speakers.filter(s => s.approvalStatus === 'approved').length,
    cvMissing: state.speakers.filter(s => s.cvStatus === 'pending').length,
    photoMissing: state.speakers.filter(s => s.photoStatus === 'missing').length,
  };

  const openNewSpeaker = () => {
    dispatch({
      type: 'CREATE_SPEAKER',
      payload: {
        name: 'דובר חדש', jobTitle: '', organization: '', bio: '',
        email: '', phone: '', avatar: 'ד', photoUrl: null, cvUrl: null,
        approvalStatus: 'pending', cvStatus: 'pending', photoStatus: 'missing',
        panelIds: [], eventIds: state.activeEventId ? [state.activeEventId] : [],
        tags: [], notes: '',
      },
    });
  };

  return (
    <div className="speakers-view">
      {/* Stats bar */}
      <div className="speakers-stats-bar">
        <div className="speakers-stat">
          <span className="speakers-stat-num">{stats.total}</span>
          <span className="speakers-stat-label">דוברים</span>
        </div>
        <div className="speakers-stat approved">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
          <span className="speakers-stat-num">{stats.approved}</span>
          <span className="speakers-stat-label">מאושרים</span>
        </div>
        <div className="speakers-stat warning">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>hourglass_empty</span>
          <span className="speakers-stat-num">{stats.cvMissing}</span>
          <span className="speakers-stat-label">חסרי קו״ח</span>
        </div>
        <div className="speakers-stat warning">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>broken_image</span>
          <span className="speakers-stat-num">{stats.photoMissing}</span>
          <span className="speakers-stat-label">חסרי תמונה</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="speakers-toolbar">
        <div className="speakers-search-wrap">
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>search</span>
          <input
            className="speakers-search"
            placeholder="חפש דובר, ארגון..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="speakers-filters">
          <select className="speakers-filter-select" value={filterApproval} onChange={e => setFilterApproval(e.target.value as any)}>
            <option value="all">כל הסטטוסים</option>
            <option value="approved">מאושר</option>
            <option value="pending">ממתין</option>
            <option value="cancelled">בוטל</option>
          </select>
          <select className="speakers-filter-select" value={filterCV} onChange={e => setFilterCV(e.target.value as any)}>
            <option value="all">קו״ח - הכל</option>
            <option value="received">התקבל</option>
            <option value="pending">ממתין</option>
          </select>
          <select className="speakers-filter-select" value={filterPhoto} onChange={e => setFilterPhoto(e.target.value as any)}>
            <option value="all">תמונה - הכל</option>
            <option value="uploaded">הועלתה</option>
            <option value="missing">חסרה</option>
          </select>
          <select className="speakers-filter-select" value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
            <option value="all">כל האירועים</option>
            {state.events.filter(e => e.status !== 'archived').map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="view-toggle-group">
          <button
            className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="כרטסיות"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="טבלה"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>table_rows</span>
          </button>
        </div>

        <button className="btn-export" onClick={() => exportSpeakers(filtered, state.events)}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
          ייצוא Excel
        </button>
        <button className="btn-primary" style={{ gap: 6, display: 'flex', alignItems: 'center' }} onClick={openNewSpeaker}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          הוסף דובר
        </button>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="speakers-empty">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)' }}>mic_off</span>
          <p>לא נמצאו דוברים</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="speakers-grid-v2">
          {filtered.map(s => <SpeakerCard key={s.id} speaker={s} />)}
        </div>
      ) : (
        <div className="speakers-table-wrap">
          <table className="speakers-table">
            <thead>
              <tr className="speakers-table-head-row">
                <th className="speakers-table-th">דובר</th>
                <th className="speakers-table-th">ארגון</th>
                <th className="speakers-table-th">אישור</th>
                <th className="speakers-table-th">קו״ח</th>
                <th className="speakers-table-th">תמונה</th>
                <th className="speakers-table-th" style={{ textAlign: 'center' }}>פאנלים</th>
                <th className="speakers-table-th">אירוע</th>
                <th className="speakers-table-th">יצירת קשר</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => <SpeakerTableRow key={s.id} speaker={s} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
