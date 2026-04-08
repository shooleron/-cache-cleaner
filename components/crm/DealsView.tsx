'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Deal, DealStage } from '@/lib/types';

const STAGES: { key: DealStage; label: string; color: string }[] = [
  { key: 'lead',        label: 'ליד',         color: '#c5c7d4' },
  { key: 'qualified',   label: 'מוסמך',        color: '#fdab3d' },
  { key: 'proposal',    label: 'הצעה',         color: '#0073ea' },
  { key: 'negotiation', label: 'משא ומתן',     color: '#9c27b0' },
  { key: 'closed_won',  label: 'נסגר - זכייה', color: '#00c875' },
  { key: 'closed_lost', label: 'נסגר - אובדן', color: '#e2445c' },
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
          <h2>{isNew ? 'עסקה חדשה' : form.title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="deal-modal-body">
          <div className="deal-modal-left">
            <div className="form-group">
              <label>שם העסקה *</label>
              <input className="form-input" placeholder="שם העסקה" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>שלב</label>
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
                <label>שווי (₪)</label>
                <input className="form-input" type="number" min="0" value={form.value || 0} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>הסתברות %</label>
                <input className="form-input" type="number" min="0" max="100" value={form.probability || 0} onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label>תאריך סגירה</label>
                <input className="form-input" type="date" value={form.expectedCloseDate || ''} onChange={e => setForm(f => ({ ...f, expectedCloseDate: e.target.value || null }))} />
              </div>
            </div>

            <div className="form-group">
              <label>איש קשר</label>
              <select className="form-input" value={form.contactId || ''} onChange={e => setForm(f => ({ ...f, contactId: e.target.value || null }))}>
                <option value="">— ללא —</option>
                {state.contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>אחראי</label>
              <select className="form-input" value={form.ownerId} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}>
                {state.users.filter(u => u.status === 'active').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>הערות</label>
              <textarea className="form-input form-textarea" rows={3} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <div className="probability-bar-wrap">
              <div className="probability-bar-label">הסתברות לסגירה: <strong>{form.probability}%</strong></div>
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

          {existing && (
            <div className="deal-modal-right">
              <h4>יומן פעילות</h4>
              <div className="activity-input-row">
                <input
                  className="form-input"
                  placeholder="הוסף הערה..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addActivity(); }}
                />
                <button className="btn-primary btn-sm" onClick={addActivity}>הוסף</button>
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
                          {user?.name} · {new Date(act.createdAt).toLocaleDateString('he-IL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {existing.activities.length === 0 && <div className="empty-small">אין פעילות עדיין</div>}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>ביטול</button>
          <button className="btn-primary" onClick={save}>{isNew ? 'צור עסקה' : 'שמור שינויים'}</button>
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
          <h2 className="crm-title">פייפליין עסקאות</h2>
          <p className="crm-subtitle">
            ₪{totalPipeline.toLocaleString()} בפייפליין · ₪{wonValue.toLocaleString()} נסגרו
          </p>
        </div>
        <button className="btn-primary" onClick={() => setLocalDealModalId('new')}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span> עסקה חדשה
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
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>person</span>
                          {contact.name} · {contact.company}
                        </div>
                      )}

                      <div className="deal-card-value">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>paid</span>
                        <strong>${deal.value.toLocaleString()}</strong>
                      </div>

                      {deal.expectedCloseDate && (
                        <div className={`deal-card-date ${new Date(deal.expectedCloseDate) < new Date() ? 'overdue' : ''}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>calendar_today</span>
                          {new Date(deal.expectedCloseDate).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
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
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_back</span> העבר לשלב הבא
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button className="deals-add-btn" onClick={() => {
                  setLocalDealModalId('new');
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span> הוסף עסקה
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
