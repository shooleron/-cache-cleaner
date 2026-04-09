'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Deal, DealStage, DealLineItem } from '@/lib/types';

const STAGES: { key: DealStage; label: string; color: string }[] = [
  { key: 'lead',        label: 'ליד',          color: '#c5c7d4' },
  { key: 'qualified',   label: 'מוסמך',         color: '#fdab3d' },
  { key: 'proposal',    label: 'הצעה',          color: '#0073ea' },
  { key: 'negotiation', label: 'משא ומתן',      color: '#9c27b0' },
  { key: 'closed_won',  label: 'נסגר ✓',        color: '#00c875' },
  { key: 'closed_lost', label: 'נסגר ✗',        color: '#e2445c' },
];

const PROB: Record<DealStage, number> = {
  lead: 10, qualified: 25, proposal: 50, negotiation: 75, closed_won: 100, closed_lost: 0,
};

const CATEGORY_LABEL: Record<string, string> = {
  stage: 'במה', sponsorship: 'חסות', digital: 'דיגיטל', special: 'מיוחד',
};

function DealModal({ dealId, onClose }: { dealId: string; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const isNew = dealId === 'new';
  const existing = !isNew ? state.deals.find(d => d.id === dealId) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [contactId, setContactId] = useState(existing?.contactId || '');
  const [stage, setStage] = useState<DealStage>(existing?.stage || 'lead');
  const [probability, setProbability] = useState(existing?.probability ?? PROB['lead']);
  const [expectedCloseDate, setExpectedCloseDate] = useState(existing?.expectedCloseDate || '');
  const [ownerId, setOwnerId] = useState(existing?.ownerId || state.currentUser.id);
  const [notes, setNotes] = useState(existing?.notes || '');
  const [eventId, setEventId] = useState(existing?.eventId || state.activeEventId || '');
  const [lineItems, setLineItems] = useState<DealLineItem[]>(existing?.lineItems || []);
  const [noteText, setNoteText] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    if (!isNew && existing) {
      setTitle(existing.title);
      setContactId(existing.contactId || '');
      setStage(existing.stage);
      setProbability(existing.probability);
      setExpectedCloseDate(existing.expectedCloseDate || '');
      setOwnerId(existing.ownerId);
      setNotes(existing.notes);
      setEventId(existing.eventId || '');
      setLineItems(existing.lineItems || []);
    }
  }, [dealId]);

  const totalValue = lineItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  function save() {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      contactId: contactId || null,
      stage,
      value: totalValue || (existing?.value || 0),
      currency: 'ILS',
      probability,
      ownerId,
      expectedCloseDate: expectedCloseDate || null,
      notes,
      tags: existing?.tags || [],
      lineItems,
      eventId: eventId || null,
      operationsProjectId: existing?.operationsProjectId || null,
    };
    if (isNew) {
      dispatch({ type: 'CREATE_DEAL', payload });
    } else if (existing) {
      dispatch({ type: 'UPDATE_DEAL', payload: { id: existing.id, ...payload } });
    }
    onClose();
  }

  function addProduct(productId: string) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;
    setLineItems(prev => [...prev, {
      productId: prod.id,
      productName: prod.name,
      quantity: 1,
      unitPrice: prod.price,
      speakerIds: [],
      notes: '',
    }]);
    setAddingProduct(false);
  }

  function removeLineItem(idx: number) {
    setLineItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateLineItem(idx: number, patch: Partial<DealLineItem>) {
    setLineItems(prev => prev.map((item, i) => i === idx ? { ...item, ...patch } : item));
  }

  function addActivity() {
    if (!noteText.trim() || !existing) return;
    dispatch({ type: 'ADD_DEAL_ACTIVITY', payload: { dealId: existing.id, type: 'note', description: noteText } });
    setNoteText('');
  }

  const alreadyAddedIds = lineItems.map(l => l.productId);
  const availableProducts = state.products.filter(p => !alreadyAddedIds.includes(p.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel deal-modal deal-modal-v2" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <div style={{ flex: 1 }}>
            <input
              className="deal-modal-title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="שם העסקה"
            />
            {totalValue > 0 && (
              <div className="deal-modal-total">
                ₪{totalValue.toLocaleString()} סה"כ
              </div>
            )}
          </div>
        </div>

        <div className="deal-modal-body">
          {/* Left: form */}
          <div className="deal-modal-left">

            {/* Stage + Date row */}
            <div className="form-row">
              <div className="form-group">
                <label>שלב</label>
                <select className="form-input" value={stage} onChange={e => {
                  const s = e.target.value as DealStage;
                  setStage(s);
                  setProbability(PROB[s]);
                }}>
                  {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>תאריך סגירה</label>
                <input className="form-input" type="date" value={expectedCloseDate} onChange={e => setExpectedCloseDate(e.target.value)} />
              </div>
            </div>

            {/* Contact + Event */}
            <div className="form-row">
              <div className="form-group">
                <label>איש קשר</label>
                <select className="form-input" value={contactId} onChange={e => setContactId(e.target.value)}>
                  <option value="">— ללא —</option>
                  {state.contacts.map(c => <option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>אירוע</label>
                <select className="form-input" value={eventId} onChange={e => setEventId(e.target.value)}>
                  <option value="">— ללא —</option>
                  {state.events.filter(e => e.status !== 'archived').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>

            {/* Owner + Probability */}
            <div className="form-row">
              <div className="form-group">
                <label>אחראי</label>
                <select className="form-input" value={ownerId} onChange={e => setOwnerId(e.target.value)}>
                  {state.users.filter(u => u.status === 'active').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>הסתברות %</label>
                <input className="form-input" type="number" min="0" max="100" value={probability} onChange={e => setProbability(Number(e.target.value))} />
              </div>
            </div>

            {/* Line Items */}
            <div className="form-group">
              <label>מוצרים / שירותים</label>
              <div className="deal-line-items">
                {lineItems.length === 0 && (
                  <div className="deal-line-empty">לא נוספו מוצרים עדיין</div>
                )}
                {lineItems.map((item, idx) => {
                  const prod = state.products.find(p => p.id === item.productId);
                  return (
                    <div key={idx} className="deal-line-row">
                      <div className="deal-line-main">
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>
                          {prod?.icon || 'sell'}
                        </span>
                        <div className="deal-line-info">
                          <div className="deal-line-name">{item.productName}</div>
                          <div className="deal-line-price">₪{item.unitPrice.toLocaleString()}</div>
                        </div>
                        {prod?.requiresSpeaker && (
                          <select
                            className="deal-line-speaker-select"
                            value={item.speakerIds[0] || ''}
                            onChange={e => updateLineItem(idx, { speakerIds: e.target.value ? [e.target.value] : [] })}
                          >
                            <option value="">— בחר דובר —</option>
                            {state.speakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        )}
                      </div>
                      <input
                        className="deal-line-notes-input"
                        value={item.notes}
                        onChange={e => updateLineItem(idx, { notes: e.target.value })}
                        placeholder="הערה..."
                      />
                      <button className="deal-line-remove" onClick={() => removeLineItem(idx)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                      </button>
                    </div>
                  );
                })}

                {/* Add product */}
                {!addingProduct ? (
                  <button className="deal-add-product-btn" onClick={() => setAddingProduct(true)}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
                    הוסף מוצר
                  </button>
                ) : (
                  <div className="deal-product-picker">
                    {['stage', 'sponsorship', 'digital', 'special'].map(cat => {
                      const prods = availableProducts.filter(p => p.category === cat);
                      if (!prods.length) return null;
                      return (
                        <div key={cat}>
                          <div className="deal-product-cat-label">{CATEGORY_LABEL[cat]}</div>
                          {prods.map(p => (
                            <div key={p.id} className="deal-product-option" onClick={() => addProduct(p.id)}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{p.icon}</span>
                              <span className="deal-product-option-name">{p.name}</span>
                              <span className="deal-product-option-price">₪{p.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    <button className="deal-product-cancel" onClick={() => setAddingProduct(false)}>ביטול</button>
                  </div>
                )}

                {lineItems.length > 0 && (
                  <div className="deal-line-total">
                    <span>סה"כ</span>
                    <span>₪{totalValue.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>הערות</label>
              <textarea className="form-input form-textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {/* Close deal button */}
            {existing && existing.stage !== 'closed_won' && existing.stage !== 'closed_lost' && (
              <button
                className="deal-close-won-btn"
                onClick={() => {
                  dispatch({ type: 'CLOSE_DEAL_WON', payload: { dealId: existing.id } });
                  onClose();
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>emoji_events</span>
                סגור עסקה — העבר לתפעול
              </button>
            )}

            {existing?.operationsProjectId && (
              <div className="deal-ops-link">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#00c875' }}>task_alt</span>
                פרויקט תפעול נוצר ·
                <button
                  className="deal-ops-link-btn"
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: existing.operationsProjectId! });
                    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'events' });
                    onClose();
                  }}
                >
                  עבור לפרויקט ←
                </button>
              </div>
            )}
          </div>

          {/* Right: activity log */}
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
    .filter(d => d.stage !== 'closed_lost')
    .reduce((sum, d) => sum + d.value, 0);

  const wonValue = state.deals
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="crm-view">
      <div className="crm-header">
        <div>
          <h2 className="crm-title">פייפליין מכירות</h2>
          <p className="crm-subtitle">
            ₪{totalPipeline.toLocaleString()} בפייפליין · ₪{wonValue.toLocaleString()} נסגרו
          </p>
        </div>
        <button className="btn-primary" onClick={() => setLocalDealModalId('new')}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span> עסקה חדשה
        </button>
      </div>

      {/* Pipeline summary bar */}
      <div className="pipeline-summary">
        {STAGES.map(stage => {
          const deals = dealsByStage[stage.key];
          const value = deals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage.key} className="pipeline-summary-col">
              <div className="pipeline-summary-bar" style={{ background: stage.color }} />
              <div className="pipeline-summary-label" style={{ color: stage.color }}>{stage.label}</div>
              <div className="pipeline-summary-count">{deals.length}</div>
              <div className="pipeline-summary-value">₪{(value / 1000).toFixed(0)}K</div>
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
                  <span className="deals-value">₪{(stageValue / 1000).toFixed(0)}K</span>
                </div>
              </div>

              <div className="deals-cards">
                {deals.map(deal => {
                  const contact = deal.contactId ? state.contacts.find(c => c.id === deal.contactId) : null;
                  const owner = state.users.find(u => u.id === deal.ownerId);
                  const event = deal.eventId ? state.events.find(e => e.id === deal.eventId) : null;
                  const nextStageObj = STAGES[STAGES.findIndex(s => s.key === stage.key) + 1];
                  return (
                    <div key={deal.id} className="deal-card" onClick={() => setLocalDealModalId(deal.id)}>
                      <div className="deal-card-title">{deal.title}</div>

                      {contact && (
                        <div className="deal-card-contact">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>person</span>
                          {contact.name} · {contact.company}
                        </div>
                      )}

                      {/* Line items summary */}
                      {deal.lineItems?.length > 0 && (
                        <div className="deal-card-products">
                          {deal.lineItems.slice(0, 3).map((li, i) => {
                            const prod = state.products.find(p => p.id === li.productId);
                            return (
                              <span key={i} className="deal-product-chip">
                                <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{prod?.icon || 'sell'}</span>
                                {li.productName}
                              </span>
                            );
                          })}
                          {deal.lineItems.length > 3 && <span className="deal-product-chip">+{deal.lineItems.length - 3}</span>}
                        </div>
                      )}

                      <div className="deal-card-value">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>paid</span>
                        <strong>₪{deal.value.toLocaleString()}</strong>
                      </div>

                      {event && (
                        <div className="deal-card-event">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>event</span>
                          {event.name.split(' ')[0]}
                        </div>
                      )}

                      {deal.expectedCloseDate && (
                        <div className={`deal-card-date ${new Date(deal.expectedCloseDate) < new Date() && stage.key !== 'closed_won' && stage.key !== 'closed_lost' ? 'overdue' : ''}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>calendar_today</span>
                          {new Date(deal.expectedCloseDate).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
                        </div>
                      )}

                      <div className="deal-card-footer">
                        <div className="probability-mini">
                          <div className="probability-mini-fill" style={{ width: `${deal.probability}%`, background: deal.probability > 60 ? '#00c875' : deal.probability > 30 ? '#fdab3d' : '#e2445c' }} />
                        </div>
                        <span className="probability-mini-label">{deal.probability}%</span>
                        {owner && <div className="deal-owner-avatar" style={{ background: owner.color }} title={owner.name}>{owner.avatar}</div>}
                      </div>

                      {/* Ops project indicator */}
                      {deal.operationsProjectId && (
                        <div className="deal-card-ops-badge">
                          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>task_alt</span>
                          תפעול פעיל
                        </div>
                      )}

                      {/* Quick actions */}
                      <div className="deal-card-actions">
                        {nextStageObj && stage.key !== 'closed_won' && stage.key !== 'closed_lost' && (
                          <button className="deal-move-btn" onClick={e => {
                            e.stopPropagation();
                            if (nextStageObj.key === 'closed_won') {
                              dispatch({ type: 'CLOSE_DEAL_WON', payload: { dealId: deal.id } });
                            } else {
                              dispatch({ type: 'MOVE_DEAL_STAGE', payload: { dealId: deal.id, stage: nextStageObj.key } });
                            }
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_back</span>
                            {nextStageObj.key === 'closed_won' ? 'סגור עסקה' : 'שלב הבא'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stage.key !== 'closed_won' && stage.key !== 'closed_lost' && (
                  <button className="deals-add-btn" onClick={() => setLocalDealModalId('new')}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span> הוסף עסקה
                  </button>
                )}
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
