'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Speaker, SpeakerApprovalStatus, SpeakerCVStatus, SpeakerPhotoStatus, SpeakerCategory, SpeakerContact, Panel } from '@/lib/types';
import { useConfirm } from '@/components/ui/ConfirmDialog';

const FORMAT_LABELS: Record<string, string> = {
  panel: 'פאנל', lecture: 'הרצאה', interview: 'ראיון', video: 'סרטון', discussion: 'דיון',
};

const CATEGORY_CONFIG: Record<SpeakerCategory, { label: string; color: string; bg: string }> = {
  commercial: { label: 'מסחרי',       color: '#0073ea', bg: '#e6f2ff' },
  systemic:   { label: 'מערכתי',      color: '#9c27b0', bg: '#f3e5f5' },
  paid:        { label: 'מרצה משלם',  color: '#e65100', bg: '#fff3e0' },
};

const PANEL_STATUS_COLOR: Record<string, string> = {
  confirmed: '#16a34a', draft: '#d97706', cancelled: '#dc2626',
};

export function SpeakerModal() {
  const { state, dispatch } = useStore();
  const speaker = state.speakers.find(s => s.id === state.speakerModalId);
  const [confirm, confirmDialog] = useConfirm();

  const [tab, setTab] = useState<'details' | 'panels'>('details');
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<SpeakerApprovalStatus>('pending');
  const [cvStatus, setCvStatus] = useState<SpeakerCVStatus>('pending');
  const [photoStatus, setPhotoStatus] = useState<SpeakerPhotoStatus>('missing');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [category, setCategory] = useState<SpeakerCategory>('commercial');
  const [contactPerson, setContactPerson] = useState<SpeakerContact | null>(null);
  const [dirty, setDirty] = useState(false);
  const [addPanelOpen, setAddPanelOpen] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!speaker) return;
    setName(speaker.name);
    setJobTitle(speaker.jobTitle);
    setOrganization(speaker.organization);
    setBio(speaker.bio);
    setEmail(speaker.email);
    setPhone(speaker.phone);
    setNotes(speaker.notes);
    setApprovalStatus(speaker.approvalStatus);
    setCvStatus(speaker.cvStatus);
    setPhotoStatus(speaker.photoStatus);
    setTags(speaker.tags);
    setEventIds(speaker.eventIds);
    setCategory(speaker.category);
    setContactPerson(speaker.contactPerson);
    setDirty(false);
    setTab('details');
  }, [state.speakerModalId]);

  if (!speaker) return null;

  const close = () => dispatch({ type: 'CLOSE_SPEAKER_MODAL' });

  const save = () => {
    const initials = name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'ד';
    dispatch({
      type: 'UPDATE_SPEAKER',
      payload: {
        id: speaker.id,
        name: name.trim(),
        jobTitle: jobTitle.trim(),
        organization: organization.trim(),
        bio: bio.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        approvalStatus,
        cvStatus,
        photoStatus,
        category,
        contactPerson,
        tags,
        eventIds,
        avatar: initials,
      },
    });
    setDirty(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      dispatch({ type: 'UPDATE_SPEAKER', payload: { id: speaker.id, photoUrl: ev.target?.result as string, photoStatus: 'uploaded' } });
      setPhotoStatus('uploaded');
    };
    reader.readAsDataURL(file);
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      dispatch({ type: 'UPDATE_SPEAKER', payload: { id: speaker.id, cvUrl: ev.target?.result as string, cvStatus: 'received' } });
      setCvStatus('received');
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setDirty(true); }
    setTagInput('');
  };

  const speakerPanels = state.panels.filter(p => p.speakerIds.includes(speaker.id));
  const availablePanels = state.panels.filter(p =>
    !p.speakerIds.includes(speaker.id) &&
    (speaker.eventIds.includes(p.eventId) || speaker.eventIds.length === 0)
  );

  const mark = () => setDirty(true);

  return (
    <>
      {confirmDialog}
    <div className="modal-overlay" onClick={close}>
      <div className="speaker-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="speaker-modal-header">
          <button className="modal-close-btn" onClick={close}>
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="speaker-modal-avatar-wrap">
            {speaker.photoUrl
              ? <img src={speaker.photoUrl} alt={speaker.name} className="speaker-modal-photo" />
              : <div className="speaker-modal-avatar">{speaker.avatar}</div>
            }
            <button className="speaker-photo-upload-btn" onClick={() => photoInputRef.current?.click()} title="העלה תמונה">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>photo_camera</span>
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>

          <div className="speaker-modal-header-info">
            <input
              className="speaker-name-input"
              value={name}
              onChange={e => { setName(e.target.value); mark(); }}
              placeholder="שם הדובר"
            />
            <input
              className="speaker-title-input"
              value={jobTitle}
              onChange={e => { setJobTitle(e.target.value); mark(); }}
              placeholder="תפקיד"
            />
          </div>

          {/* Status chips */}
          <div className="speaker-modal-status-row">
            <select
              className={`speaker-status-select approval-${approvalStatus}`}
              value={approvalStatus}
              onChange={e => { setApprovalStatus(e.target.value as SpeakerApprovalStatus); mark(); }}
            >
              <option value="approved">✅ מאושר</option>
              <option value="pending">⏳ ממתין</option>
              <option value="cancelled">❌ בוטל</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="speaker-modal-tabs">
          <button className={`speaker-tab ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
            פרטים
          </button>
          <button className={`speaker-tab ${tab === 'panels' ? 'active' : ''}`} onClick={() => setTab('panels')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>mic</span>
            פאנלים
            {speakerPanels.length > 0 && <span className="speaker-tab-badge">{speakerPanels.length}</span>}
          </button>
        </div>

        <div className="speaker-modal-body">

          {tab === 'details' && (
            <div className="speaker-details-tab">

              {/* Contact info */}
              <div className="speaker-section">
                <div className="speaker-section-title">פרטי קשר</div>
                <div className="speaker-field-row">
                  <div className="speaker-field">
                    <label className="speaker-label">ארגון / חברה</label>
                    <div className="speaker-input-wrap">
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>business</span>
                      <input className="speaker-input" value={organization} onChange={e => { setOrganization(e.target.value); mark(); }} placeholder="שם הארגון" />
                    </div>
                  </div>
                </div>
                <div className="speaker-field-row">
                  <div className="speaker-field">
                    <label className="speaker-label">אימייל</label>
                    <div className="speaker-input-wrap">
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>mail</span>
                      <input className="speaker-input" type="email" dir="ltr" value={email} onChange={e => { setEmail(e.target.value); mark(); }} placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="speaker-field">
                    <label className="speaker-label">טלפון</label>
                    <div className="speaker-input-wrap">
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>phone</span>
                      <input className="speaker-input" dir="ltr" value={phone} onChange={e => { setPhone(e.target.value); mark(); }} placeholder="050-0000000" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="speaker-section">
                <div className="speaker-section-title">קטגוריה</div>
                <div className="speaker-category-row">
                  {(Object.entries(CATEGORY_CONFIG) as [SpeakerCategory, typeof CATEGORY_CONFIG[SpeakerCategory]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      className={`speaker-category-btn ${category === key ? 'active' : ''}`}
                      style={category === key ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                      onClick={() => { setCategory(key); mark(); }}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact person */}
              <div className="speaker-section">
                <div className="speaker-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>איש קשר / נציג</span>
                  {!contactPerson && (
                    <button
                      className="speaker-add-contact-btn"
                      onClick={() => { setContactPerson({ name: '', role: '', phone: '', email: '' }); mark(); }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                      הוסף
                    </button>
                  )}
                </div>
                {contactPerson ? (
                  <div className="speaker-contact-person-card">
                    <div className="speaker-field-row">
                      <div className="speaker-field">
                        <label className="speaker-label">שם</label>
                        <input
                          className="speaker-input"
                          value={contactPerson.name}
                          onChange={e => { setContactPerson({ ...contactPerson, name: e.target.value }); mark(); }}
                          placeholder="שם מלא"
                        />
                      </div>
                      <div className="speaker-field">
                        <label className="speaker-label">תפקיד</label>
                        <input
                          className="speaker-input"
                          value={contactPerson.role}
                          onChange={e => { setContactPerson({ ...contactPerson, role: e.target.value }); mark(); }}
                          placeholder="עוזר אישי, מנהלת לשכה..."
                        />
                      </div>
                    </div>
                    <div className="speaker-field-row">
                      <div className="speaker-field">
                        <label className="speaker-label">טלפון</label>
                        <div className="speaker-input-wrap">
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>phone</span>
                          <input
                            className="speaker-input" dir="ltr"
                            value={contactPerson.phone}
                            onChange={e => { setContactPerson({ ...contactPerson, phone: e.target.value }); mark(); }}
                            placeholder="050-0000000"
                          />
                        </div>
                      </div>
                      <div className="speaker-field">
                        <label className="speaker-label">אימייל</label>
                        <div className="speaker-input-wrap">
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>mail</span>
                          <input
                            className="speaker-input" dir="ltr" type="email"
                            value={contactPerson.email}
                            onChange={e => { setContactPerson({ ...contactPerson, email: e.target.value }); mark(); }}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      className="speaker-remove-contact-btn"
                      onClick={() => { setContactPerson(null); mark(); }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                      הסר איש קשר
                    </button>
                  </div>
                ) : (
                  <div className="speaker-no-contact">
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--outline-variant)' }}>person_off</span>
                    <span>לא הוגדר איש קשר</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="speaker-section">
                <div className="speaker-section-title">ביוגרפיה</div>
                <textarea
                  className="speaker-bio-textarea"
                  value={bio}
                  onChange={e => { setBio(e.target.value); mark(); }}
                  placeholder="תיאור קצר על הדובר..."
                  rows={3}
                />
              </div>

              {/* Checklist */}
              <div className="speaker-section">
                <div className="speaker-section-title">צ'קליסט</div>
                <div className="speaker-checklist">

                  <div className="speaker-check-row">
                    <div className="speaker-check-label">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>description</span>
                      קורות חיים
                    </div>
                    <div className="speaker-check-actions">
                      <select
                        className={`speaker-mini-select ${cvStatus === 'received' ? 'ok' : 'warn'}`}
                        value={cvStatus}
                        onChange={e => { setCvStatus(e.target.value as SpeakerCVStatus); mark(); }}
                      >
                        <option value="received">התקבל ✓</option>
                        <option value="pending">ממתין...</option>
                      </select>
                      <button className="speaker-upload-mini-btn" onClick={() => cvInputRef.current?.click()}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>upload</span>
                        {speaker.cvUrl ? 'עדכן' : 'העלה'}
                      </button>
                      <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleCVUpload} />
                    </div>
                  </div>

                  <div className="speaker-check-row">
                    <div className="speaker-check-label">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>photo</span>
                      תמונה מקצועית
                    </div>
                    <div className="speaker-check-actions">
                      <select
                        className={`speaker-mini-select ${photoStatus === 'uploaded' ? 'ok' : 'warn'}`}
                        value={photoStatus}
                        onChange={e => { setPhotoStatus(e.target.value as SpeakerPhotoStatus); mark(); }}
                      >
                        <option value="uploaded">הועלתה ✓</option>
                        <option value="missing">חסרה</option>
                      </select>
                      <button className="speaker-upload-mini-btn" onClick={() => photoInputRef.current?.click()}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>upload</span>
                        {speaker.photoUrl ? 'עדכן' : 'העלה'}
                      </button>
                    </div>
                  </div>

                  <div className="speaker-check-row">
                    <div className="speaker-check-label">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>how_to_reg</span>
                      אישור הגעה
                    </div>
                    <div className="speaker-check-actions">
                      <select
                        className={`speaker-mini-select ${approvalStatus === 'approved' ? 'ok' : 'warn'}`}
                        value={approvalStatus}
                        onChange={e => { setApprovalStatus(e.target.value as SpeakerApprovalStatus); mark(); }}
                      >
                        <option value="approved">אושר ✓</option>
                        <option value="pending">ממתין...</option>
                        <option value="cancelled">בוטל</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="speaker-section">
                <div className="speaker-section-title">תגיות</div>
                <div className="speaker-tags-wrap">
                  {tags.map(t => (
                    <span key={t} className="speaker-tag">
                      {t}
                      <button onClick={() => { setTags(tags.filter(x => x !== t)); mark(); }}>×</button>
                    </span>
                  ))}
                  <input
                    className="speaker-tag-input"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                    placeholder="+ תגית"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="speaker-section">
                <div className="speaker-section-title">הערות פנימיות</div>
                <textarea
                  className="speaker-bio-textarea"
                  value={notes}
                  onChange={e => { setNotes(e.target.value); mark(); }}
                  placeholder="הערות לצוות התפעול..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {tab === 'panels' && (
            <div className="speaker-panels-tab">
              {speakerPanels.length === 0 && (
                <div className="speaker-panels-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--outline-variant)' }}>mic_none</span>
                  <p>הדובר לא שויך לאף פאנל</p>
                </div>
              )}
              {speakerPanels.map(panel => {
                const event = state.events.find(e => e.id === panel.eventId);
                const isModerator = panel.moderatorId === speaker.id;
                return (
                  <div key={panel.id} className="speaker-panel-row">
                    <div className="speaker-panel-left">
                      <div className="speaker-panel-dot" style={{ background: PANEL_STATUS_COLOR[panel.status] }} />
                      <div>
                        <div className="speaker-panel-name">{panel.name}</div>
                        <div className="speaker-panel-meta">
                          <span>{FORMAT_LABELS[panel.format]}</span>
                          <span>·</span>
                          <span>{panel.duration} דקות</span>
                          <span>·</span>
                          <span>{panel.day} {panel.startTime || ''}</span>
                          {event && <><span>·</span><span>{event.name.split(' ')[0]}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="speaker-panel-right">
                      {isModerator && (
                        <span className="speaker-moderator-badge">מנחה</span>
                      )}
                      <button
                        className="speaker-panel-remove"
                        onClick={() => dispatch({ type: 'REMOVE_SPEAKER_FROM_PANEL', payload: { panelId: panel.id, speakerId: speaker.id } })}
                        title="הסר מפאנל"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>link_off</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add to panel */}
              {availablePanels.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  {!addPanelOpen ? (
                    <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => setAddPanelOpen(true)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                      שייך לפאנל
                    </button>
                  ) : (
                    <div className="speaker-add-panel-list">
                      <div className="speaker-add-panel-title">בחר פאנל לשיוך:</div>
                      {availablePanels.map(p => (
                        <div
                          key={p.id}
                          className="speaker-add-panel-item"
                          onClick={() => {
                            dispatch({ type: 'ADD_SPEAKER_TO_PANEL', payload: { panelId: p.id, speakerId: speaker.id } });
                            setAddPanelOpen(false);
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>mic</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{FORMAT_LABELS[p.format]} · {p.day} · {p.hall}</div>
                          </div>
                        </div>
                      ))}
                      <button className="speaker-add-panel-cancel" onClick={() => setAddPanelOpen(false)}>ביטול</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="speaker-modal-footer">
          <button
            className="btn-danger"
            onClick={async () => { const ok = await confirm({ title: 'מחיקת דובר', message: `האם אתה בטוח שברצונך למחוק את "${speaker.name}"?`, confirmLabel: 'מחק', danger: true }); if (ok) { dispatch({ type: 'DELETE_SPEAKER', payload: speaker.id }); dispatch({ type: 'CLOSE_SPEAKER_MODAL' }); } }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
            מחק
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={close}>סגור</button>
            {dirty && (
              <button className="btn-primary" onClick={save} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                שמור
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
