'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, Search, Mail, Phone, Building2, Tag, MoreHorizontal, X, User } from 'lucide-react';
import { Contact, ContactStatus } from '@/lib/types';

const STATUS_CONFIG: Record<ContactStatus, { label: string; color: string }> = {
  prospect: { label: 'Prospect', color: '#fdab3d' },
  active: { label: 'Active', color: '#0073ea' },
  customer: { label: 'Customer', color: '#00c875' },
  inactive: { label: 'Inactive', color: '#c5c7d4' },
};

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
    if (t && !form.tags?.includes(t)) {
      setForm(f => ({ ...f, tags: [...(f.tags || []), t] }));
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags?.filter(t => t !== tag) || [] }));
  }

  if (!contactId) return null;

  const linkedDeals = existing ? state.deals.filter(d => existing.linkedDealIds?.includes(d.id)) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel contact-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isNew ? 'New Contact' : 'Edit Contact'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="contact-modal-body">
          <div className="contact-modal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-input" placeholder="John Doe" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContactStatus }))}>
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" type="email" placeholder="john@company.com" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" placeholder="+1 555-0100" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company</label>
                <input className="form-input" placeholder="Acme Corp" value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input className="form-input" placeholder="CEO" value={form.position || ''} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tag-input-wrap">
                <div className="tag-list">
                  {form.tags?.map(tag => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <button onClick={() => removeTag(tag)}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <input
                  className="form-input tag-input"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea className="form-input form-textarea" placeholder="Internal notes..." value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
          </div>

          {existing && linkedDeals.length > 0 && (
            <div className="contact-modal-deals">
              <h4>Linked Deals</h4>
              {linkedDeals.map(deal => (
                <div key={deal.id} className="linked-deal-item">
                  <span className={`deal-stage-dot stage-${deal.stage}`} />
                  <span className="linked-deal-title">{deal.title}</span>
                  <span className="linked-deal-value">${deal.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>{isNew ? 'Create Contact' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

export function ContactsView() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContactStatus | 'all'>('all');
  const [localContactModalId, setLocalContactModalId] = useState<string | null>(null);

  const filtered = state.contacts.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = state.contacts.filter(c => c.status === key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="crm-view">
      {/* Header */}
      <div className="crm-header">
        <div>
          <h2 className="crm-title">Contacts</h2>
          <p className="crm-subtitle">{state.contacts.length} contacts total</p>
        </div>
        <button className="btn-primary" onClick={() => setLocalContactModalId('new')}>
          <Plus size={14} /> Add Contact
        </button>
      </div>

      {/* Status filters */}
      <div className="crm-filter-row">
        <button
          className={`crm-filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >All <span>{state.contacts.length}</span></button>
        {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
          <button
            key={key}
            className={`crm-filter-chip ${filterStatus === key ? 'active' : ''}`}
            onClick={() => setFilterStatus(key as ContactStatus)}
            style={filterStatus === key ? { borderColor: color, color } : {}}
          >
            {label} <span>{statusCounts[key] || 0}</span>
          </button>
        ))}

        <div className="crm-search">
          <Search size={14} />
          <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="contacts-table-wrap">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Tags</th>
              <th>Last Activity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(contact => {
              const owner = state.users.find(u => u.id === contact.ownerId);
              const cfg = STATUS_CONFIG[contact.status];
              return (
                <tr key={contact.id} className="contact-row" onClick={() => setLocalContactModalId(contact.id)}>
                  <td>
                    <div className="contact-name-cell">
                      <div className="contact-avatar-initials" style={{ background: '#0073ea22', color: '#0073ea' }}>
                        {contact.avatar || contact.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="contact-name">{contact.name}</div>
                        {contact.position && <div className="contact-position">{contact.position}</div>}
                      </div>
                    </div>
                  </td>
                  <td><div className="table-cell-muted"><Building2 size={12} /> {contact.company || '—'}</div></td>
                  <td><div className="table-cell-muted"><Mail size={12} /> {contact.email || '—'}</div></td>
                  <td><div className="table-cell-muted"><Phone size={12} /> {contact.phone || '—'}</div></td>
                  <td>
                    <span className="status-pill" style={{ background: cfg.color + '18', color: cfg.color, borderColor: cfg.color + '44' }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td>
                    {owner && (
                      <div className="owner-cell">
                        <div className="owner-avatar" style={{ background: owner.color }}>{owner.avatar}</div>
                        <span>{owner.name}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="tag-chips-row">
                      {contact.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="tag-chip-sm">{tag}</span>
                      ))}
                      {contact.tags.length > 2 && <span className="tag-chip-more">+{contact.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="muted-text">
                    {new Date(contact.lastActivityAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="icon-btn" onClick={() => dispatch({ type: 'DELETE_CONTACT', payload: contact.id })}>
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state-small">
            <User size={32} color="#c5c7d4" />
            <p>No contacts found</p>
            <button className="btn-primary" onClick={() => setLocalContactModalId('new')}>Add first contact</button>
          </div>
        )}
      </div>

      {localContactModalId && (
        <ContactModal contactId={localContactModalId} onClose={() => setLocalContactModalId(null)} />
      )}
    </div>
  );
}
