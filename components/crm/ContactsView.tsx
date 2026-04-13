'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Contact, ContactStatus } from '@/lib/types';
import { useConfirm } from '@/components/ui/ConfirmDialog';

const STATUS_CONFIG: Record<ContactStatus, { label: string; bg: string; color: string }> = {
  prospect: { label: 'ליד', bg: '#fef3c7', color: '#92400e' },
  active:   { label: 'פעיל', bg: '#dbeafe', color: '#1e40af' },
  customer: { label: 'לקוח', bg: '#d1fae5', color: '#065f46' },
  inactive: { label: 'לא פעיל', bg: '#f3f4f6', color: '#6b7280' },
};

const AVATAR_COLORS = ['#5a45cb','#059669','#d97706','#dc2626','#7c3aed','#0284c7'];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function ContactModal({ contactId, onClose }: { contactId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const isNew = contactId === 'new';
  const existing = contactId && !isNew ? state.contacts.find(c => c.id === contactId) : null;

  const [form, setForm] = useState<Partial<Contact>>({
    name: existing?.name || '',
    email: existing?.email || '',
    phone: existing?.phone || '',
    company: existing?.company || '',
    position: existing?.position || '',
    status: existing?.status || 'prospect',
    notes: existing?.notes || '',
    tags: existing?.tags || [],
    ownerId: existing?.ownerId || state.currentUser.id,
  });
  const [tagInput, setTagInput] = useState('');

  function save() {
    if (!form.name?.trim()) return;
    if (isNew) {
      dispatch({ type: 'CREATE_CONTACT', payload: form as Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'avatar' | 'linkedDealIds'> });
    } else if (existing) {
      dispatch({ type: 'UPDATE_CONTACT', payload: { id: existing.id, ...form } });
    }
    onClose();
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags?.includes(t)) setForm(f => ({ ...f, tags: [...(f.tags || []), t] }));
    setTagInput('');
  }

  if (!contactId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 className="modal-title" style={{ margin: 0 }}>{isNew ? 'איש קשר חדש' : 'עריכת איש קשר'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 4, borderRadius: 'var(--radius-full)' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="modal-field">
            <label className="modal-label">שם מלא *</label>
            <input className="modal-input" placeholder="ישראל ישראלי" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label className="modal-label">סטטוס</label>
            <select className="modal-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContactStatus }))}>
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="modal-field">
            <label className="modal-label">אימייל</label>
            <input className="modal-input" type="email" placeholder="israel@company.com" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label className="modal-label">טלפון</label>
            <input className="modal-input" placeholder="050-0000000" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label className="modal-label">חברה</label>
            <input className="modal-input" placeholder="שם החברה" value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div className="modal-field">
            <label className="modal-label">תפקיד</label>
            <input className="modal-input" placeholder="מנכ״ל" value={form.position || ''} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
          </div>
        </div>

        {/* Tags */}
        <div className="modal-field" style={{ marginTop: 8 }}>
          <label className="modal-label">תגיות</label>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, padding: '8px 12px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-full)', border: '1px solid var(--outline-variant)', alignItems: 'center' }}>
            {form.tags?.map(tag => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--primary-fixed)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600 }}>
                {tag}
                <button onClick={() => setForm(f => ({ ...f, tags: f.tags?.filter(t => t !== tag) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
            <input
              placeholder="הוסף תגית..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--on-surface)', textAlign: 'right', flex: 1, minWidth: 100, fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="modal-field">
          <label className="modal-label">הערות</label>
          <textarea className="modal-input" rows={3} placeholder="הערות פנימיות..." value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'none' }} />
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save}>{isNew ? 'צור איש קשר' : 'שמור שינויים'}</button>
          <button className="btn btn-ghost" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

export function ContactsView() {
  const { state, dispatch } = useStore();
  const [confirm, confirmDialog] = useConfirm();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContactStatus | 'all'>('all');
  const [modalId, setModalId] = useState<string | null>(null);

  const filtered = state.contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <>
      {confirmDialog}
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 900, color: 'var(--on-surface)', lineHeight: 1.2 }}>אנשי קשר</h1>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>{state.contacts.length} אנשי קשר סה״כ</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setModalId('new')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          הוסף איש קשר
        </button>
      </div>

      {/* Filter + Search bar */}
      <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Status pills */}
        {[{ key: 'all', label: 'הכל', count: state.contacts.length }, ...Object.entries(STATUS_CONFIG).map(([key, { label }]) => ({ key, label, count: state.contacts.filter(c => c.status === key).length }))].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key as ContactStatus | 'all')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 'var(--radius-full)', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: filterStatus === key ? 'var(--primary)' : 'var(--surface-container-lowest)',
              color: filterStatus === key ? 'white' : 'var(--on-surface-variant)',
              boxShadow: filterStatus === key ? '0 2px 8px rgba(90,69,203,0.25)' : 'var(--shadow-sm)',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            {label}
            <span style={{ background: filterStatus === key ? 'rgba(255,255,255,0.25)' : 'var(--surface-container)', borderRadius: 'var(--radius-full)', padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{count}</span>
          </button>
        ))}

        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, fontSize: 18, color: 'var(--outline)', pointerEvents: 'none' }}>search</span>
          <input
            placeholder="חיפוש לפי שם, אימייל או חברה..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingRight: 38, paddingLeft: 16, paddingTop: 9, paddingBottom: 9, borderRadius: 'var(--radius-full)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13, color: 'var(--on-surface)', outline: 'none', textAlign: 'right', fontFamily: 'Inter, sans-serif', boxShadow: 'var(--shadow-sm)' }}
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)', border: '1px solid rgba(201,196,214,0.2)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr 1fr 1fr 1fr 40px', padding: '12px 20px', background: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)', gap: 8 }}>
          {['שם', 'חברה', 'אימייל', 'טלפון', 'סטטוס', 'אחראי', ''].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((contact, idx) => {
          const cfg = STATUS_CONFIG[contact.status];
          const owner = state.users.find(u => u.id === contact.ownerId);
          const avatarColor = AVATAR_COLORS[contact.name.charCodeAt(0) % AVATAR_COLORS.length];

          return (
            <div
              key={contact.id}
              onClick={() => setModalId(contact.id)}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr 1fr 1fr 1fr 40px',
                padding: '14px 20px', gap: 8, alignItems: 'center',
                borderBottom: idx < filtered.length - 1 ? '1px solid rgba(201,196,214,0.12)' : 'none',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container-low)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Name + avatar */}
              <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {getInitials(contact.name)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}>{contact.name}</div>
                  {contact.position && <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 1 }}>{contact.position}</div>}
                </div>
              </div>

              {/* Company */}
              <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--outline)' }}>business</span>
                <span style={{ textAlign: 'right' }}>{contact.company || '—'}</span>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--on-surface-variant)', overflow: 'hidden' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--outline)', flexShrink: 0 }}>mail</span>
                <span style={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.email || '—'}</span>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--outline)' }}>call</span>
                <span>{contact.phone || '—'}</span>
              </div>

              {/* Status */}
              <div>
                <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, textAlign: 'right' }}>
                  {cfg.label}
                </span>
              </div>

              {/* Owner */}
              <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                {owner && (
                  <>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: owner.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>
                      {owner.avatar}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{owner.name.split(' ')[0]}</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div onClick={e => e.stopPropagation()}>
                <button
                  onClick={async () => { const ok = await confirm({ title: 'מחיקת איש קשר', message: `האם אתה בטוח שברצונך למחוק את "${contact.name}"?`, confirmLabel: 'מחק', danger: true }); if (ok) dispatch({ type: 'DELETE_CONTACT', payload: contact.id }); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', borderRadius: 'var(--radius-full)', padding: 4, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-container)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_vert</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)', display: 'block', marginBottom: 12 }}>person_search</span>
            <p style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Manrope, sans-serif', marginBottom: 6 }}>לא נמצאו אנשי קשר</p>
            <p style={{ fontSize: 13, marginBottom: 20 }}>נסה לשנות את הסינון או</p>
            <button className="btn btn-primary" onClick={() => setModalId('new')}>הוסף איש קשר ראשון</button>
          </div>
        )}
      </div>

      {modalId && <ContactModal contactId={modalId} onClose={() => setModalId(null)} />}
    </div>
    </>
  );
}
