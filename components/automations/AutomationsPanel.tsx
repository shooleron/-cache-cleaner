'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, Zap, ToggleLeft, ToggleRight, Trash2, X, ChevronRight } from 'lucide-react';
import { AutomationRule, AutomationTrigger, AutomationActionType } from '@/lib/types';

const TRIGGERS: { value: AutomationTrigger; label: string; description: string }[] = [
  { value: 'task_created', label: 'Task Created', description: 'When a new task is created' },
  { value: 'status_changed', label: 'Status Changed', description: 'When a task status changes' },
  { value: 'due_date_passed', label: 'Due Date Passed', description: 'When a task passes its due date' },
  { value: 'deal_stage_changed', label: 'Deal Stage Changed', description: 'When a deal moves to a new stage' },
  { value: 'task_assigned', label: 'Task Assigned', description: 'When a task is assigned to someone' },
];

const ACTIONS: { value: AutomationActionType; label: string }[] = [
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'change_status', label: 'Change Task Status' },
  { value: 'assign_to', label: 'Assign to User' },
  { value: 'move_deal_stage', label: 'Move Deal to Stage' },
  { value: 'create_task', label: 'Create New Task' },
];

const TRIGGER_VALUE_LABELS: Partial<Record<AutomationTrigger, { label: string; options?: { value: string; label: string }[] }>> = {
  status_changed: {
    label: 'When status changes to',
    options: [
      { value: 'todo', label: 'Todo' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'stuck', label: 'Stuck' },
      { value: 'done', label: 'Done' },
    ],
  },
  deal_stage_changed: {
    label: 'When deal moves to',
    options: [
      { value: 'lead', label: 'Lead' },
      { value: 'qualified', label: 'Qualified' },
      { value: 'proposal', label: 'Proposal' },
      { value: 'negotiation', label: 'Negotiation' },
      { value: 'closed_won', label: 'Closed Won' },
      { value: 'closed_lost', label: 'Closed Lost' },
    ],
  },
};

function RuleModal({ rule, onClose }: { rule: Partial<AutomationRule> | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [form, setForm] = useState<Partial<AutomationRule>>(rule || {
    name: '',
    trigger: 'status_changed',
    triggerValue: 'done',
    action: 'send_notification',
    actionValue: '',
    projectId: state.activeProjectId,
    enabled: true,
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

  const triggerConfig = TRIGGER_VALUE_LABELS[form.trigger as AutomationTrigger];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel automation-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{form.id ? 'Edit Automation' : 'New Automation'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="automation-modal-body">
          <div className="form-group">
            <label>Automation Name</label>
            <input
              className="form-input"
              placeholder="e.g. Notify on completion"
              value={form.name || ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="automation-flow">
            {/* Trigger block */}
            <div className="automation-block trigger-block">
              <div className="automation-block-label">
                <span className="automation-badge trigger-badge">WHEN</span>
              </div>
              <select
                className="form-input"
                value={form.trigger}
                onChange={e => setForm(f => ({ ...f, trigger: e.target.value as AutomationTrigger, triggerValue: '' }))}
              >
                {TRIGGERS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {triggerConfig && (
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>{triggerConfig.label}</label>
                  {triggerConfig.options ? (
                    <select
                      className="form-input"
                      value={form.triggerValue || ''}
                      onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))}
                    >
                      {triggerConfig.options.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      placeholder="Value..."
                      value={form.triggerValue || ''}
                      onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="automation-arrow">
              <ChevronRight size={20} />
              <span>THEN</span>
              <ChevronRight size={20} />
            </div>

            {/* Action block */}
            <div className="automation-block action-block">
              <div className="automation-block-label">
                <span className="automation-badge action-badge">DO</span>
              </div>
              <select
                className="form-input"
                value={form.action}
                onChange={e => setForm(f => ({ ...f, action: e.target.value as AutomationActionType, actionValue: '' }))}
              >
                {ACTIONS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>
                  {form.action === 'send_notification' ? 'Notification message' :
                   form.action === 'change_status' ? 'New status' :
                   form.action === 'assign_to' ? 'Assign to user' :
                   form.action === 'move_deal_stage' ? 'Target stage' : 'Value'}
                </label>
                {form.action === 'assign_to' ? (
                  <select className="form-input" value={form.actionValue || ''} onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))}>
                    <option value="">Select user...</option>
                    {state.users.filter(u => u.status === 'active').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                ) : form.action === 'change_status' ? (
                  <select className="form-input" value={form.actionValue || ''} onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))}>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="stuck">Stuck</option>
                    <option value="done">Done</option>
                  </select>
                ) : form.action === 'move_deal_stage' ? (
                  <select className="form-input" value={form.actionValue || ''} onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))}>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                ) : (
                  <input
                    className="form-input"
                    placeholder="Enter value..."
                    value={form.actionValue || ''}
                    onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Apply to Project</label>
            <select className="form-input" value={form.projectId || ''} onChange={e => setForm(f => ({ ...f, projectId: e.target.value || null }))}>
              <option value="">All Projects</option>
              {state.projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>{form.id ? 'Save' : 'Create Automation'}</button>
        </div>
      </div>
    </div>
  );
}

export function AutomationsPanel() {
  const { state, dispatch } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState<Partial<AutomationRule> | null>(null);

  const totalFired = state.automations.reduce((s, a) => s + a.timesTriggered, 0);
  const activeCount = state.automations.filter(a => a.enabled).length;

  return (
    <div className="automations-view">
      <div className="crm-header">
        <div>
          <h2 className="crm-title">Automations</h2>
          <p className="crm-subtitle">{activeCount} active · {totalFired} total runs</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditRule(null); setShowModal(true); }}>
          <Plus size={14} /> New Automation
        </button>
      </div>

      {/* Stats */}
      <div className="automation-stats">
        <div className="automation-stat-card">
          <div className="automation-stat-val">{state.automations.length}</div>
          <div className="automation-stat-label">Total Rules</div>
        </div>
        <div className="automation-stat-card">
          <div className="automation-stat-val" style={{ color: '#00c875' }}>{activeCount}</div>
          <div className="automation-stat-label">Active</div>
        </div>
        <div className="automation-stat-card">
          <div className="automation-stat-val" style={{ color: '#0073ea' }}>{totalFired}</div>
          <div className="automation-stat-label">Times Triggered</div>
        </div>
        <div className="automation-stat-card">
          <div className="automation-stat-val" style={{ color: '#fdab3d' }}>{state.automations.filter(a => !a.enabled).length}</div>
          <div className="automation-stat-label">Paused</div>
        </div>
      </div>

      {/* Rules List */}
      <div className="automations-list">
        {state.automations.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Zap size={40} color="#c5c7d4" /></div>
            <h2>No automations yet</h2>
            <p>Create rules to automate repetitive tasks — like sending notifications when a task is done.</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Create first automation
            </button>
          </div>
        )}
        {state.automations.map(rule => {
          const trigger = TRIGGERS.find(t => t.value === rule.trigger);
          const action = ACTIONS.find(a => a.value === rule.action);
          const project = rule.projectId ? state.projects.find(p => p.id === rule.projectId) : null;
          return (
            <div key={rule.id} className={`automation-rule-card ${rule.enabled ? '' : 'disabled'}`}>
              <div className="automation-rule-toggle">
                <button
                  className="toggle-btn"
                  onClick={() => dispatch({ type: 'TOGGLE_AUTOMATION', payload: rule.id })}
                >
                  {rule.enabled
                    ? <ToggleRight size={28} color="#00c875" />
                    : <ToggleLeft size={28} color="#c5c7d4" />
                  }
                </button>
              </div>
              <div className="automation-rule-body" onClick={() => { setEditRule(rule); setShowModal(true); }}>
                <div className="automation-rule-name">{rule.name}</div>
                <div className="automation-rule-desc">
                  <span className="automation-badge trigger-badge">{trigger?.label || rule.trigger}</span>
                  <ChevronRight size={14} color="#adb1bc" />
                  <span className="automation-badge action-badge">{action?.label || rule.action}</span>
                  {rule.triggerValue && (
                    <span className="automation-rule-value">({rule.triggerValue})</span>
                  )}
                </div>
                {project && (
                  <div className="automation-rule-project">
                    <span style={{ color: project.color }}>{project.icon} {project.name}</span>
                  </div>
                )}
              </div>
              <div className="automation-rule-stats">
                <div className="automation-runs">{rule.timesTriggered} runs</div>
              </div>
              <button
                className="icon-btn danger"
                onClick={() => dispatch({ type: 'DELETE_AUTOMATION', payload: rule.id })}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <RuleModal
          rule={editRule}
          onClose={() => { setShowModal(false); setEditRule(null); }}
        />
      )}
    </div>
  );
}
