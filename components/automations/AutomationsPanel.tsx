'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { AutomationRule, AutomationTrigger, AutomationActionType } from '@/lib/types';

const TRIGGERS: { value: AutomationTrigger; label: string }[] = [
  { value: 'task_created', label: 'משימה נוצרה' },
  { value: 'status_changed', label: 'סטטוס השתנה' },
  { value: 'due_date_passed', label: 'תאריך יעד עבר' },
  { value: 'deal_stage_changed', label: 'עסקה עברה שלב' },
  { value: 'task_assigned', label: 'משימה הוקצתה' },
];

const ACTIONS: { value: AutomationActionType; label: string }[] = [
  { value: 'send_notification', label: 'שלח התראה' },
  { value: 'change_status', label: 'שנה סטטוס משימה' },
  { value: 'assign_to', label: 'הקצה למשתמש' },
  { value: 'move_deal_stage', label: 'הזז עסקה לשלב' },
  { value: 'create_task', label: 'צור משימה חדשה' },
];

function RuleModal({ rule, onClose }: { rule: Partial<AutomationRule> | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [form, setForm] = useState<Partial<AutomationRule>>(rule || {
    name: '', trigger: 'status_changed', triggerValue: 'done',
    action: 'send_notification', actionValue: '', projectId: state.activeProjectId, enabled: true,
  });

  function save() {
    if (!form.name?.trim()) return;
    if (form.id) {
      dispatch({ type: 'UPDATE_AUTOMATION', payload: form as AutomationRule });
    } else {
      dispatch({ type: 'CREATE_AUTOMATION', payload: form as Omit<AutomationRule, 'id' | 'timesTriggered' | 'createdAt'> });
    }
    onClose();
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-full)',
    border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)',
    fontSize: 13, color: 'var(--on-surface)', outline: 'none', fontFamily: 'Inter, sans-serif',
    textAlign: 'right',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="modal-title" style={{ margin: 0 }}>{form.id ? 'עריכת אוטומציה' : 'אוטומציה חדשה'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Name */}
        <div className="modal-field">
          <label className="modal-label">שם האוטומציה</label>
          <input style={inp} placeholder="לדוגמה: התראה כשמשימה הושלמה" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        {/* WHEN → THEN visual flow */}
        <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 12, margin: '20px 0', alignItems: 'flex-start' }}>
          {/* WHEN block */}
          <div style={{ flex: 1, background: 'var(--primary-fixed)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, textAlign: 'right' }}>כאשר</div>
            <select style={inp} value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value as AutomationTrigger, triggerValue: '' }))}>
              {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {(form.trigger === 'status_changed' || form.trigger === 'deal_stage_changed') && (
              <select style={{ ...inp, marginTop: 8 }} value={form.triggerValue || ''} onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))}>
                {form.trigger === 'status_changed'
                  ? [['todo','ממתין'],['in_progress','בתהליך'],['stuck','תקוע'],['done','הושלם']].map(([v,l]) => <option key={v} value={v}>{l}</option>)
                  : [['lead','ליד'],['qualified','מוסמך'],['proposal','הצעה'],['negotiation','משא ומתן'],['closed_won','נסגר ✓'],['closed_lost','נסגר ✗']].map(([v,l]) => <option key={v} value={v}>{l}</option>)
                }
              </select>
            )}
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: 40, color: 'var(--outline)', flexShrink: 0 }}>
            <span className="material-symbols-outlined">arrow_back</span>
          </div>

          {/* THEN block */}
          <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 'var(--radius-lg)', padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, textAlign: 'right' }}>אז</div>
            <select style={inp} value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value as AutomationActionType, actionValue: '' }))}>
              {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            {form.action === 'assign_to' ? (
              <select style={{ ...inp, marginTop: 8 }} value={form.actionValue || ''} onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))}>
                <option value="">בחר משתמש...</option>
                {state.users.filter(u => u.status === 'active').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            ) : form.action === 'change_status' ? (
              <select style={{ ...inp, marginTop: 8 }} value={form.actionValue || ''} onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))}>
                <option value="todo">ממתין</option><option value="in_progress">בתהליך</option>
                <option value="stuck">תקוע</option><option value="done">הושלם</option>
              </select>
            ) : form.action === 'move_deal_stage' ? (
              <select style={{ ...inp, marginTop: 8 }} value={form.actionValue || ''} onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))}>
                {[['qualified','מוסמך'],['proposal','הצעה'],['negotiation','משא ומתן'],['closed_won','נסגר ✓'],['closed_lost','נסגר ✗']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ) : (
              <input style={{ ...inp, marginTop: 8 }} placeholder="ערך..." value={form.actionValue || ''} onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))} />
            )}
          </div>
        </div>

        {/* Project */}
        <div className="modal-field">
          <label className="modal-label">פרויקט (אופציונלי)</label>
          <select style={inp} value={form.projectId || ''} onChange={e => setForm(f => ({ ...f, projectId: e.target.value || null }))}>
            <option value="">כל הפרויקטים</option>
            {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save}>{form.id ? 'שמור' : 'צור אוטומציה'}</button>
          <button className="btn btn-ghost" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

export function AutomationsPanel() {
  const { state, dispatch } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState<Partial<AutomationRule> | null>(null);

  const activeCount = state.automations.filter(a => a.enabled).length;
  const totalFired = state.automations.reduce((s, a) => s + a.timesTriggered, 0);

  const triggerLabel = (v: AutomationTrigger) => TRIGGERS.find(t => t.value === v)?.label || v;
  const actionLabel = (v: AutomationActionType) => ACTIONS.find(a => a.value === v)?.label || v;

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 900, color: 'var(--on-surface)' }}>אוטומציות</h1>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>{activeCount} פעילות · {totalFired} הפעלות סה״כ</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => { setEditRule(null); setShowModal(true); }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          אוטומציה חדשה
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'כלל הכללים', value: state.automations.length, color: 'var(--on-surface)' },
          { label: 'פעילות', value: activeCount, color: '#059669' },
          { label: 'הופעלו', value: totalFired, color: 'var(--primary)' },
          { label: 'מושהות', value: state.automations.filter(a => !a.enabled).length, color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface-container-lowest)', border: '1px solid rgba(201,196,214,0.2)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', textAlign: 'right' }}>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state.automations.length === 0 && (
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', padding: 48, textAlign: 'center', border: '1px solid rgba(201,196,214,0.2)', boxShadow: 'var(--shadow-sm)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)', display: 'block', marginBottom: 12 }}>bolt</span>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 6 }}>אין אוטומציות עדיין</p>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 20 }}>צור כללים שיחסכו לך עבודה חוזרת</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>צור אוטומציה ראשונה</button>
          </div>
        )}

        {state.automations.map(rule => {
          const project = rule.projectId ? state.projects.find(p => p.id === rule.projectId) : null;
          return (
            <div
              key={rule.id}
              style={{
                background: 'var(--surface-container-lowest)',
                border: '1px solid rgba(201,196,214,0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'row-reverse',
                alignItems: 'center',
                gap: 16,
                boxShadow: 'var(--shadow-sm)',
                opacity: rule.enabled ? 1 : 0.5,
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
            >
              {/* Toggle */}
              <label className="toggle-switch" style={{ flexShrink: 0 }}>
                <input type="checkbox" checked={rule.enabled} onChange={() => dispatch({ type: 'TOGGLE_AUTOMATION', payload: rule.id })} />
                <span className="toggle-slider" />
              </label>

              {/* WHEN → THEN flow */}
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setEditRule(rule); setShowModal(true); }}>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--on-surface)', textAlign: 'right', marginBottom: 8 }}>{rule.name}</div>
                <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, background: 'var(--primary-fixed)', color: 'var(--primary)' }}>
                    כאשר: {triggerLabel(rule.trigger)}
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>arrow_back</span>
                  <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, background: '#d1fae5', color: '#065f46' }}>
                    אז: {actionLabel(rule.action)}
                  </span>
                  {rule.triggerValue && (
                    <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', background: 'var(--surface-container)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>({rule.triggerValue})</span>
                  )}
                  {project && (
                    <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>· {project.name}</span>
                  )}
                </div>
              </div>

              {/* Runs count */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{rule.timesTriggered}</div>
                <div style={{ fontSize: 10, color: 'var(--on-surface-variant)' }}>הפעלות</div>
              </div>

              {/* Delete */}
              <button
                onClick={() => dispatch({ type: 'DELETE_AUTOMATION', payload: rule.id })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', borderRadius: 'var(--radius-full)', padding: 6, display: 'flex', alignItems: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--error)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--outline)'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
              </button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <RuleModal rule={editRule} onClose={() => { setShowModal(false); setEditRule(null); }} />
      )}
    </div>
  );
}
