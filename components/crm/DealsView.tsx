'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, DollarSign, TrendingUp, X, Calendar, User, ChevronRight } from 'lucide-react';
import { Deal, DealStage } from '@/lib/types';

const STAGES: { key: DealStage; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: '#c5c7d4' },
  { key: 'qualified', label: 'Qualified', color: '#fdab3d' },
  { key: 'proposal', label: 'Proposal', color: '#0073ea' },
  { key: 'negotiation', label: 'Negotiation', color: '#9c27b0' },
  { key: 'closed_won', label: 'Closed Won', color: '#00c875' },
  { key: 'closed_lost', label: 'Closed Lost', color: '#e2445c' },
];

function DealModal({ dealId, onClose }: { dealId: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const isNew = dealId === 'new';
  const existing = dealId && !isNew ? state.deals.find(d => d.id === dealId) : null;

  const [form, setForm] = useState<Partial<Deal>>({
    title: existing?.title || '',
    contactId: existing?.contactId || null,
    stage: existing?.stage || 'lead',
    value: existing?.value || 0,
    currency: existing?.currency || 'USD',
    probability: existing?.probability || 20,
    ownerId: existing?.ownerId || state.currentUser.id,
    expectedCloseDate: existing?.expectedCloseDate || null,
    notes: existing?.notes || '',
    tags: existing?.tags || [],
  });

  const [noteText, setNoteText] = useState('');

  function save() {
    if (!form.title?.trim()) return;
    if (isNew) {
      dispatch({ type: 'CREATE_DEAL', payload: form as Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'activities'> });
    } else if (existing) {
      dispatch({ type: 'UPDATE_DEAL', payload: { id: existing.id, ...form } });
    }
    onClose();
  }

  function addActivity() {
    if (!noteText.trim() || !existing) return;
    dispatch({ type: 'ADD_DEAL_ACTIVITY', payload: { dealId: existing.id, type: 'note', description: noteText } });
    setNoteText('');
  }

  if (!dealId) return null;

  const probabilityByStage: Record<DealStage, number> = {
    lead: 10, qualified: 25, proposal: 50, negotiation: 75, closed_won: 100, closed_lost: 0,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel deal-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isNew ? 'New Deal' : form.title}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="deal-modal-body">
          <div className="deal-modal-left">
            <div className="form-group">
              <label>Deal Title *</label>
              <input className="form-input" placeholder="Deal name" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stage</label>
                <select
                  className="form-input"
                  value={form.stage}
                  onChange={e => {
                    const s = e.target.value as DealStage;
                    setForm(f => ({ ...f, stage: s, probability: probabilityByStage[s] }));
                  }}
                >
                  {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Value (USD)</label>
                <input className="form-input" type="number" min="0" value={form.value || 0} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Probability %</label>
                <input className="form-input" type="number" min="0" max="100" value={form.probability || 0} onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label>Close Date</label>
                <input className="form-input" type="date" value={form.expectedCloseDate || ''} onChange={e => setForm(f => ({ ...f, expectedCloseDate: e.target.value || null }))} />
              </div>
            </div>

            <div className="form-group">
              <label>Contact</label>
              <select className="form-input" value={form.contactId || ''} onChange={e => setForm(f => ({ ...f, contactId: e.target.value || null }))}>
                <option value="">— None —</option>
                {state.contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Owner</label>
              <select className="form-input" value={form.ownerId} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}>
                {state.users.filter(u => u.status === 'active').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea className="form-input form-textarea" rows={3} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            {/* Probability bar */}
            <div className="probability-bar-wrap">
              <div className="probability-bar-label">Win probability: <strong>{form.probability}%</strong></div>
              <div className="probability-bar-track">
                <div
                  className="probability-bar-fill"
                  style={{
                    width: `${form.probability || 0}%`,
                    background: (form.probability || 0) > 60 ? '#00c875' : (form.probability || 0) > 30 ? '#fdab3d' : '#e2445c',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Activity log */}
          {existing && (
            <div className="deal-modal-right">
              <h4>Activity Log</h4>
              <div className="activity-input-row">
                <input
                  className="form-input"
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addActivity(); }}
                />
                <button className="btn-primary btn-sm" onClick={addActivity}>Add</button>
              </div>
              <div className="deal-activities">
                {existing.activities.slice().reverse().map(act => {
                  const user = state.users.find(u => u.id === act.userId);
                  return (
                    <div key={act.id} className="deal-activity-item">
                      <div className={`deal-activity-icon act-${act.type}`}>
                        {act.type === 'note' ? '📝' : act.type === 'call' ? '📞' : act.type === 'email' ? '📧' : act.type === 'meeting' ? '🤝' : '🔄'}
                      </div>
                      <div className="deal-activity-content">
                        <div className="deal-activity-desc">{act.description}</div>
                        <div className="deal-activity-meta">
                          {user?.name} · {new Date(act.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {existing.activities.length === 0 && <div className="empty-small">No activity yet</div>}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>{isNew ? 'Create Deal' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

export function DealsView() {
  const { state, dispatch } = useStore();
  const [localDealModalId, setLocalDealModalId] = useState<string | null>(null);

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.key] = state.deals.filter(d => d.stage === stage.key);
    return acc;
  }, {} as Record<DealStage, Deal[]>);

  const totalPipeline = state.deals
    .filter(d => !['closed_lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);

  const wonValue = state.deals
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="crm-view">
      <div className="crm-header">
        <div>
          <h2 className="crm-title">Deals Pipeline</h2>
          <p className="crm-subtitle">
            ${totalPipeline.toLocaleString()} in pipeline · ${wonValue.toLocaleString()} won
          </p>
        </div>
        <button className="btn-primary" onClick={() => setLocalDealModalId('new')}>
          <Plus size={14} /> Add Deal
        </button>
      </div>

      {/* Pipeline summary */}
      <div className="pipeline-summary">
        {STAGES.map(stage => {
          const deals = dealsByStage[stage.key];
          const value = deals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage.key} className="pipeline-summary-col">
              <div className="pipeline-summary-bar" style={{ background: stage.color }} />
              <div className="pipeline-summary-label" style={{ color: stage.color }}>{stage.label}</div>
              <div className="pipeline-summary-count">{deals.length}</div>
              <div className="pipeline-summary-value">${(value / 1000).toFixed(0)}K</div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="deals-kanban">
        {STAGES.map(stage => {
          const deals = dealsByStage[stage.key];
          const stageValue = deals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage.key} className="deals-column">
              <div className="deals-column-header" style={{ borderTopColor: stage.color }}>
                <div className="deals-column-title">
                  <span className="deals-column-dot" style={{ background: stage.color }} />
                  {stage.label}
                </div>
                <div className="deals-column-meta">
                  <span className="deals-count">{deals.length}</span>
                  <span className="deals-value">${(stageValue / 1000).toFixed(0)}K</span>
                </div>
              </div>

              <div className="deals-cards">
                {deals.map(deal => {
                  const contact = deal.contactId ? state.contacts.find(c => c.id === deal.contactId) : null;
                  const owner = state.users.find(u => u.id === deal.ownerId);
                  return (
                    <div key={deal.id} className="deal-card" onClick={() => setLocalDealModalId(deal.id)}>
                      <div className="deal-card-title">{deal.title}</div>

                      {contact && (
                        <div className="deal-card-contact">
                          <User size={11} />
                          {contact.name} · {contact.company}
                        </div>
                      )}

                      <div className="deal-card-value">
                        <DollarSign size={13} />
                        <strong>${deal.value.toLocaleString()}</strong>
                      </div>

                      {deal.expectedCloseDate && (
                        <div className={`deal-card-date ${new Date(deal.expectedCloseDate) < new Date() ? 'overdue' : ''}`}>
                          <Calendar size={11} />
                          {new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}

                      <div className="deal-card-footer">
                        <div className="probability-mini">
                          <div
                            className="probability-mini-fill"
                            style={{
                              width: `${deal.probability}%`,
                              background: deal.probability > 60 ? '#00c875' : deal.probability > 30 ? '#fdab3d' : '#e2445c',
                            }}
                          />
                        </div>
                        <span className="probability-mini-label">{deal.probability}%</span>
                        {owner && (
                          <div className="deal-owner-avatar" style={{ background: owner.color }} title={owner.name}>
                            {owner.avatar}
                          </div>
                        )}
                      </div>

                      {/* Quick move buttons */}
                      <div className="deal-card-actions">
                        {STAGES.find((s, i) => STAGES[i - 1]?.key === stage.key) && (
                          <button
                            className="deal-move-btn"
                            onClick={e => {
                              e.stopPropagation();
                              const nextStage = STAGES.find((s, i) => STAGES[i - 1]?.key === stage.key);
                              if (nextStage) dispatch({ type: 'MOVE_DEAL_STAGE', payload: { dealId: deal.id, stage: nextStage.key } });
                            }}
                          >
                            <ChevronRight size={12} /> Move to next stage
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button className="deals-add-btn" onClick={() => {
                  setLocalDealModalId('new');
                }}>
                  <Plus size={13} /> Add deal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {localDealModalId && (
        <DealModal dealId={localDealModalId} onClose={() => setLocalDealModalId(null)} />
      )}
    </div>
  );
}
