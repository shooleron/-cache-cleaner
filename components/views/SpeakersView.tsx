'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Speaker, SpeakerApprovalStatus } from '@/lib/types';

const APPROVAL_STYLE: Record<SpeakerApprovalStatus, { label: string; color: string; bg: string; icon: string }> = {
  approved:  { label: 'מאושר',   color: '#16a34a', bg: '#f0fdf4', icon: 'check_circle' },
  pending:   { label: 'ממתין',   color: '#d97706', bg: '#fffbeb', icon: 'schedule' },
  cancelled: { label: 'בוטל',    color: '#dc2626', bg: '#fef2f2', icon: 'cancel' },
};

const CV_STYLE = {
  received: { label: 'התקבל',   color: '#16a34a', icon: 'description' },
  pending:  { label: 'ממתין',   color: '#d97706', icon: 'hourglass_empty' },
};

const PHOTO_STYLE = {
  uploaded: { label: 'הועלתה',  color: '#16a34a', icon: 'photo' },
  missing:  { label: 'חסרה',    color: '#d97706', icon: 'broken_image' },
};

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const { state, dispatch } = useStore();
  const approval = APPROVAL_STYLE[speaker.approvalStatus];
  const panelCount = speaker.panelIds.length;
  const eventNames = [...new Set(speaker.eventIds)].map(eid =>
    state.events.find(e => e.id === eid)?.name?.split(' ')[0]
  ).filter(Boolean);

  return (
    <div
      className="speaker-card"
      onClick={() => dispatch({ type: 'OPEN_SPEAKER_MODAL', payload: speaker.id })}
    >
      {/* Avatar */}
      <div className="speaker-card-avatar">
        {speaker.photoUrl
          ? <img src={speaker.photoUrl} alt={speaker.name} className="speaker-card-photo" />
          : <span>{speaker.avatar}</span>
        }
        <span
          className="speaker-card-status-dot"
          style={{ background: approval.color }}
          title={approval.label}
        />
      </div>

      {/* Info */}
      <div className="speaker-card-info">
        <div className="speaker-card-name">{speaker.name}</div>
        <div className="speaker-card-title">{speaker.jobTitle}</div>
        <div className="speaker-card-org">
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>business</span>
          {speaker.organization}
        </div>
      </div>

      {/* Checklist row */}
      <div className="speaker-card-checks">
        {/* Approval */}
        <span className="speaker-check-chip" style={{ color: approval.color, background: approval.bg }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{approval.icon}</span>
          {approval.label}
        </span>

        {/* CV */}
        <span className="speaker-check-chip" style={{ color: CV_STYLE[speaker.cvStatus].color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{CV_STYLE[speaker.cvStatus].icon}</span>
          קו"ח
        </span>

        {/* Photo */}
        <span className="speaker-check-chip" style={{ color: PHOTO_STYLE[speaker.photoStatus].color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{PHOTO_STYLE[speaker.photoStatus].icon}</span>
          תמונה
        </span>
      </div>

      {/* Footer */}
      <div className="speaker-card-footer">
        <span className="speaker-panel-count">
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>mic</span>
          {panelCount} פאנלים
        </span>
        {eventNames.length > 0 && (
          <span className="speaker-event-tag">{eventNames[0]}</span>
        )}
      </div>
    </div>
  );
}

export function SpeakersView() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [filterApproval, setFilterApproval] = useState<'all' | SpeakerApprovalStatus>('all');
  const [filterCV, setFilterCV] = useState<'all' | 'received' | 'pending'>('all');
  const [filterPhoto, setFilterPhoto] = useState<'all' | 'uploaded' | 'missing'>('all');
  const [filterEvent, setFilterEvent] = useState<'all' | string>('all');

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
        name: 'דובר חדש',
        jobTitle: '',
        organization: '',
        bio: '',
        email: '',
        phone: '',
        avatar: 'ד',
        photoUrl: null,
        cvUrl: null,
        approvalStatus: 'pending',
        cvStatus: 'pending',
        photoStatus: 'missing',
        panelIds: [],
        eventIds: state.activeEventId ? [state.activeEventId] : [],
        tags: [],
        notes: '',
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
          <span className="speakers-stat-label">חסרי קו"ח</span>
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
            <option value="all">קו"ח - הכל</option>
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

        <button className="btn-primary" style={{ gap: 6, display: 'flex', alignItems: 'center' }} onClick={openNewSpeaker}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          הוסף דובר
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="speakers-empty">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)' }}>mic_off</span>
          <p>לא נמצאו דוברים</p>
        </div>
      ) : (
        <div className="speakers-grid">
          {filtered.map(s => <SpeakerCard key={s.id} speaker={s} />)}
        </div>
      )}
    </div>
  );
}
