'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Contact, ContactStatus, ContactType } from '@/lib/types';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { exportContacts } from '@/lib/exportExcel';
import { ImportContactsModal } from '@/components/modals/ImportContactsModal';

// ── Config ──────────────────────────────────────────────

const STATUS_CONFIG: Record<ContactStatus, { label: string; bg: string; color: string }> = {
  prospect: { label: 'ליד',      bg: '#fef3c7', color: '#92400e' },
  active:   { label: 'פעיל',     bg: '#dbeafe', color: '#1e40af' },
  customer: { label: 'לקוח',     bg: '#d1fae5', color: '#065f46' },
  inactive: { label: 'לא פעיל',  bg: '#f3f4f6', color: '#6b7280' },
};

const TYPE_CONFIG: Record<ContactType, { label: string; icon: string; color: string; bg: string }> = {
  developer:      { label: 'יזמים',      icon: 'domain',        color: '#1e40af', bg: '#dbeafe' },
  lawyer:         { label: 'עורכי דין',  icon: 'balance',       color: '#7c3aed', bg: '#ede9fe' },
  infrastructure: { label: 'תשתיות',     icon: 'construction',  color: '#92400e', bg: '#fef3c7' },
  appraiser:      { label: 'שמאים',      icon: 'rate_review',   color: '#065f46', bg: '#d1fae5' },
  other:          { label: 'אחר',        icon: 'category',      color: '#374151', bg: '#f3f4f6' },
};

const AVATAR_COLORS = ['#5a45cb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0284c7', '#0891b2', '#be185d'];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'היום';
  if (days === 1) return 'אתמול';
  if (days < 7) return `לפני ${days} ימים`;
  if (days < 30) return `לפני ${Math.floor(days / 7)} שבועות`;
  return `לפני ${Math.floor(days / 30)} חודשים`;
}

// ── Contact Modal ────────────────────────────────────────

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
    contactType: existing?.contactType || 'developer',
    city: existing?.city || '',
    website: existing?.website || '',
    linkedin: existing?.linkedin || '',
    budget: existing?.budget || '',
    notes: existing?.notes || '',
    tags: existing?.tags || [],
    ownerId: existing?.ownerId || state.currentUser.id,
  });
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'business' | 'notes'>('details');

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

  const typeConf = TYPE_CONFIG[form.contactType as ContactType] || TYPE_CONFIG.other;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box contact-modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="contact-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'row-reverse' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: avatarColor(form.name || 'א'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
              {getInitials(form.name || 'א')}
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 className="modal-title" style={{ margin: 0, fontSize: 18 }}>{isNew ? 'איש קשר חדש' : (form.name || 'עריכה')}</h2>
              {!isNew && existing && (
                <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{existing.company}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 6, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="contact-modal-tabs">
          {[{ id: 'details', label: 'פרטים' }, { id: 'business', label: 'עסקי' }, { id: 'notes', label: 'הערות' }].map(t => (
            <button key={t.id} className={`contact-modal-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id as typeof activeTab)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Details */}
        {activeTab === 'details' && (
          <div className="contact-modal-body">
            <div className="contact-modal-grid">
              <div className="modal-field">
                <label className="modal-label">שם מלא *</label>
                <input className="modal-input" placeholder="ישראל ישראלי" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">סוג לקוח</label>
                <select className="modal-input" value={form.contactType} onChange={e => setForm(f => ({ ...f, contactType: e.target.value as ContactType }))}>
                  {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
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
                <label className="modal-label">חברה / משרד</label>
                <input className="modal-input" placeholder="שם החברה" value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">תפקיד</label>
                <input className="modal-input" placeholder="מנכ״ל" value={form.position || ''} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">עיר</label>
                <input className="modal-input" placeholder="תל אביב" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">סטטוס</label>
                <select className="modal-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContactStatus }))}>
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="modal-field">
              <label className="modal-label">תגיות</label>
              <div className="tag-input-wrap">
                {form.tags?.map(tag => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button onClick={() => setForm(f => ({ ...f, tags: f.tags?.filter(t => t !== tag) }))} className="tag-chip-remove">×</button>
                  </span>
                ))}
                <input
                  placeholder="הוסף תגית..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  className="tag-input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Business */}
        {activeTab === 'business' && (
          <div className="contact-modal-body">
            <div className="contact-modal-grid">
              <div className="modal-field">
                <label className="modal-label">אתר אינטרנט</label>
                <input className="modal-input" placeholder="www.company.co.il" value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">לינקדאין</label>
                <input className="modal-input" placeholder="linkedin.com/in/..." value={form.linkedin || ''} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} />
              </div>
              <div className="modal-field" style={{ gridColumn: '1 / -1' }}>
                <label className="modal-label">טווח תקציב</label>
                <select className="modal-input" value={form.budget || ''} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}>
                  <option value="">לא ידוע</option>
                  <option value="עד 30K ₪">עד 30K ₪</option>
                  <option value="30K–80K ₪">30K–80K ₪</option>
                  <option value="80K–200K ₪">80K–200K ₪</option>
                  <option value="200K–500K ₪">200K–500K ₪</option>
                  <option value="500K+ ₪">500K+ ₪</option>
                </select>
              </div>
              <div className="modal-field" style={{ gridColumn: '1 / -1' }}>
                <label className="modal-label">אחראי</label>
                <select className="modal-input" value={form.ownerId || ''} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}>
                  {state.users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.jobTitle}</option>)}
                </select>
              </div>
            </div>

            {/* Linked deals */}
            {!isNew && existing && existing.linkedDealIds.length > 0 && (
              <div className="modal-field">
                <label className="modal-label">עסקאות מקושרות</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {existing.linkedDealIds.map(did => {
                    const deal = state.deals.find(d => d.id === did);
                    if (!deal) return null;
                    return (
                      <div key={did} style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>payments</span>
                        <span style={{ fontWeight: 600, fontSize: 13, flex: 1, textAlign: 'right' }}>{deal.title}</span>
                        <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>₪{deal.value.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Notes */}
        {activeTab === 'notes' && (
          <div className="contact-modal-body">
            <div className="modal-field" style={{ height: '100%' }}>
              <label className="modal-label">הערות פנימיות</label>
              <textarea
                className="modal-input"
                rows={8}
                placeholder="כל מידע רלוונטי על הלקוח — היסטוריה, העדפות, נקודות כאב..."
                value={form.notes || ''}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ resize: 'none', lineHeight: 1.6 }}
              />
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save}>{isNew ? 'צור איש קשר' : 'שמור שינויים'}</button>
          <button className="btn btn-ghost" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

// ── Contact Card ─────────────────────────────────────────

function ContactCard({ contact, onEdit, onDelete }: { contact: Contact; onEdit: () => void; onDelete: () => void }) {
  const { state } = useStore();
  const statusConf = STATUS_CONFIG[contact.status];
  const typeConf = TYPE_CONFIG[contact.contactType] || TYPE_CONFIG.other;
  const owner = state.users.find(u => u.id === contact.ownerId);
  const color = avatarColor(contact.name);

  return (
    <div className="contact-card" onClick={onEdit}>
      {/* Top: avatar + name + type badge */}
      <div className="contact-card-top">
        <div className="contact-card-avatar" style={{ background: color }}>
          {getInitials(contact.name)}
        </div>
        <div className="contact-card-identity">
          <span className="contact-card-name">{contact.name}</span>
          <span className="contact-card-position">{contact.position}</span>
        </div>
        <span className="contact-type-badge" style={{ background: typeConf.bg, color: typeConf.color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{typeConf.icon}</span>
          {typeConf.label}
        </span>
      </div>

      {/* Company + city */}
      <div className="contact-card-company">
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--outline)' }}>business</span>
        <span>{contact.company}</span>
        {contact.city && (
          <>
            <span style={{ color: 'var(--outline)' }}>·</span>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--outline)' }}>location_on</span>
            <span>{contact.city}</span>
          </>
        )}
      </div>

      {/* Contact info */}
      <div className="contact-card-info">
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="contact-info-item" onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>call</span>
            {contact.phone}
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="contact-info-item" onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mail</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.email}</span>
          </a>
        )}
      </div>

      {/* Budget + deals */}
      <div className="contact-card-meta-row">
        {contact.budget && (
          <span className="contact-meta-chip">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>payments</span>
            {contact.budget}
          </span>
        )}
        {contact.linkedDealIds.length > 0 && (
          <span className="contact-meta-chip">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>handshake</span>
            {contact.linkedDealIds.length} עסקאות
          </span>
        )}
      </div>

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="contact-card-tags">
          {contact.tags.slice(0, 3).map(tag => (
            <span key={tag} className="contact-tag">{tag}</span>
          ))}
          {contact.tags.length > 3 && <span className="contact-tag-more">+{contact.tags.length - 3}</span>}
        </div>
      )}

      {/* Footer: status + owner + last activity */}
      <div className="contact-card-footer">
        <span className="contact-status-badge" style={{ background: statusConf.bg, color: statusConf.color }}>
          {statusConf.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: 'row-reverse' }}>
          {owner && (
            <div title={owner.name} style={{ width: 22, height: 22, borderRadius: '50%', background: owner.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
              {owner.avatar}
            </div>
          )}
          <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{formatDate(contact.lastActivityAt)}</span>
        </div>
        <button
          className="contact-card-delete-btn"
          title="מחק"
          onClick={e => { e.stopPropagation(); onDelete(); }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
        </button>
      </div>
    </div>
  );
}

// ── Contact Table Row ────────────────────────────────────

function ContactTableRow({ contact, onEdit, onDelete }: { contact: Contact; onEdit: () => void; onDelete: () => void }) {
  const { state } = useStore();
  const statusConf = STATUS_CONFIG[contact.status];
  const typeConf = TYPE_CONFIG[contact.contactType] || TYPE_CONFIG.other;
  const owner = state.users.find(u => u.id === contact.ownerId);
  const color = avatarColor(contact.name);

  return (
    <tr className="contacts-table-row" onClick={onEdit}>
      {/* Avatar + name */}
      <td className="contacts-table-cell">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'row-reverse' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 15, flexShrink: 0, border: '2px solid white', boxShadow: '0 1px 6px rgba(0,0,0,0.10)', fontFamily: 'Manrope, sans-serif' }}>
            {getInitials(contact.name)}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)' }}>{contact.name}</div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{contact.position}</div>
          </div>
        </div>
      </td>

      {/* Company */}
      <td className="contacts-table-cell">
        <div style={{ fontSize: 13, color: 'var(--on-surface)', fontWeight: 600 }}>{contact.company}</div>
        {contact.city && <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{contact.city}</div>}
      </td>

      {/* Type */}
      <td className="contacts-table-cell">
        <span className="contact-type-badge" style={{ background: typeConf.bg, color: typeConf.color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{typeConf.icon}</span>
          {typeConf.label}
        </span>
      </td>

      {/* Status */}
      <td className="contacts-table-cell">
        <span className="contact-status-badge" style={{ background: statusConf.bg, color: statusConf.color }}>
          {statusConf.label}
        </span>
      </td>

      {/* Phone */}
      <td className="contacts-table-cell">
        {contact.phone ? (
          <a href={`tel:${contact.phone}`} onClick={e => e.stopPropagation()} style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>
            {contact.phone}
          </a>
        ) : <span style={{ color: 'var(--outline-variant)', fontSize: 12 }}>—</span>}
      </td>

      {/* Email */}
      <td className="contacts-table-cell">
        {contact.email ? (
          <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: 'var(--on-surface-variant)', textDecoration: 'none' }}>
            {contact.email}
          </a>
        ) : <span style={{ color: 'var(--outline-variant)', fontSize: 12 }}>—</span>}
      </td>

      {/* Budget */}
      <td className="contacts-table-cell">
        {contact.budget
          ? <span className="contact-meta-chip"><span className="material-symbols-outlined" style={{ fontSize: 12 }}>payments</span>{contact.budget}</span>
          : <span style={{ color: 'var(--outline-variant)', fontSize: 12 }}>—</span>
        }
      </td>

      {/* Deals */}
      <td className="contacts-table-cell" style={{ textAlign: 'center' }}>
        {contact.linkedDealIds.length > 0
          ? <span style={{ fontWeight: 700, fontSize: 13 }}>{contact.linkedDealIds.length}</span>
          : <span style={{ color: 'var(--outline-variant)', fontSize: 12 }}>—</span>
        }
      </td>

      {/* Owner */}
      <td className="contacts-table-cell">
        {owner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{owner.name}</span>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: owner.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
              {owner.avatar}
            </div>
          </div>
        )}
      </td>

      {/* Delete */}
      <td className="contacts-table-cell" style={{ textAlign: 'center' }}>
        <button
          className="contact-card-delete-btn"
          title="מחק"
          onClick={e => { e.stopPropagation(); onDelete(); }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
        </button>
      </td>
    </tr>
  );
}

// ── Main View ────────────────────────────────────────────

export function ContactsView() {
  const { state, dispatch } = useStore();
  const [confirm, confirmDialog] = useConfirm();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContactStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<ContactType | 'all'>('all');
  const [modalId, setModalId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [importOpen, setImportOpen] = useState(false);

  const filtered = state.contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchType = filterType === 'all' || c.contactType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <>
      {confirmDialog}
      <div style={{ maxWidth: 1300 }}>

        {/* Page header */}
        <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 900, color: 'var(--on-surface)', lineHeight: 1.2 }}>אנשי קשר</h1>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>{filtered.length} מתוך {state.contacts.length} אנשי קשר</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* View toggle */}
            <div className="view-toggle-group">
              <button className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')} title="כרטסיות">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>
              </button>
              <button className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title="טבלה">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>table_rows</span>
              </button>
            </div>
            <button className="btn-export" onClick={() => setImportOpen(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upload</span>
              ייבוא מאקסל
            </button>
            <button className="btn-export" onClick={() => exportContacts(filtered, state.users)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
              ייצוא Excel
            </button>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setModalId('new')}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
              הוסף איש קשר
            </button>
          </div>
        </div>

        {/* Type tabs */}
        <div className="contact-type-tabs">
          <button className={`contact-type-tab ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>people</span>
            הכל
            <span className="contact-type-tab-count">{state.contacts.length}</span>
          </button>
          {(Object.entries(TYPE_CONFIG) as [ContactType, typeof TYPE_CONFIG[ContactType]][]).map(([key, conf]) => {
            const count = state.contacts.filter(c => c.contactType === key).length;
            return (
              <button
                key={key}
                className={`contact-type-tab ${filterType === key ? 'active' : ''}`}
                style={filterType === key ? { borderColor: conf.color, color: conf.color, background: conf.bg } : {}}
                onClick={() => setFilterType(key)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{conf.icon}</span>
                {conf.label}
                <span className="contact-type-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Status + search row */}
        <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'כל הסטטוסים', count: filtered.length },
            ...Object.entries(STATUS_CONFIG).map(([key, { label }]) => ({
              key, label, count: filtered.filter(c => c.status === key).length,
            })),
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key as ContactStatus | 'all')}
              className="contact-status-filter-btn"
              style={{
                background: filterStatus === key ? 'var(--primary)' : 'var(--surface-container-lowest)',
                color: filterStatus === key ? 'white' : 'var(--on-surface-variant)',
                boxShadow: filterStatus === key ? '0 2px 8px rgba(90,69,203,0.25)' : 'var(--shadow-sm)',
              }}
            >
              {label}
              <span className="contact-status-count"
                style={{ background: filterStatus === key ? 'rgba(255,255,255,0.25)' : 'var(--surface-container)' }}>
                {count}
              </span>
            </button>
          ))}

          <div style={{ flex: 1, minWidth: 220, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, fontSize: 18, color: 'var(--outline)', pointerEvents: 'none' }}>search</span>
            <input
              placeholder="חיפוש לפי שם, חברה, עיר..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingRight: 38, paddingLeft: 16, paddingTop: 9, paddingBottom: 9, borderRadius: 'var(--radius-full)', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', fontSize: 13, color: 'var(--on-surface)', outline: 'none', textAlign: 'right', fontFamily: 'Inter, sans-serif', boxShadow: 'var(--shadow-sm)' }}
            />
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 52, color: 'var(--outline-variant)', display: 'block', marginBottom: 16 }}>person_search</span>
            <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Manrope, sans-serif', marginBottom: 8 }}>לא נמצאו אנשי קשר</p>
            <p style={{ fontSize: 13, marginBottom: 24 }}>נסה לשנות את הסינון או הוסף איש קשר חדש</p>
            <button className="btn btn-primary" onClick={() => setModalId('new')}>הוסף איש קשר</button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="contact-cards-grid">
            {filtered.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={() => setModalId(contact.id)}
                onDelete={async () => {
                  const ok = await confirm({ title: 'מחיקת איש קשר', message: `האם אתה בטוח שברצונך למחוק את "${contact.name}"?`, confirmLabel: 'מחק', danger: true });
                  if (ok) dispatch({ type: 'DELETE_CONTACT', payload: contact.id });
                }}
              />
            ))}
          </div>
        ) : (
          <div className="contacts-table-wrap">
            <table className="contacts-table">
              <thead>
                <tr className="contacts-table-head-row">
                  <th className="contacts-table-th">איש קשר</th>
                  <th className="contacts-table-th">חברה</th>
                  <th className="contacts-table-th">סוג</th>
                  <th className="contacts-table-th">סטטוס</th>
                  <th className="contacts-table-th">טלפון</th>
                  <th className="contacts-table-th">אימייל</th>
                  <th className="contacts-table-th">תקציב</th>
                  <th className="contacts-table-th" style={{ textAlign: 'center' }}>עסקאות</th>
                  <th className="contacts-table-th">אחראי</th>
                  <th className="contacts-table-th" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(contact => (
                  <ContactTableRow
                    key={contact.id}
                    contact={contact}
                    onEdit={() => setModalId(contact.id)}
                    onDelete={async () => {
                      const ok = await confirm({ title: 'מחיקת איש קשר', message: `האם אתה בטוח שברצונך למחוק את "${contact.name}"?`, confirmLabel: 'מחק', danger: true });
                      if (ok) dispatch({ type: 'DELETE_CONTACT', payload: contact.id });
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalId && <ContactModal contactId={modalId} onClose={() => setModalId(null)} />}
        {importOpen && <ImportContactsModal onClose={() => setImportOpen(false)} />}
      </div>
    </>
  );
}
