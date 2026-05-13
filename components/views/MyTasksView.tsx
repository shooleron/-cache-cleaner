'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { TaskStatus, Department } from '@/lib/types';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'לביצוע',
  in_progress: 'בתהליך',
  stuck: 'תקוע',
  done: 'הושלם',
  backlog: 'בקצה',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#64748b',
  in_progress: '#3b82f6',
  stuck: '#ef4444',
  done: '#10b981',
  backlog: '#94a3b8',
};

const DEPT_LABELS: Record<Department, string> = {
  operations: 'תפעול',
  sales: 'מכירות',
  marketing: 'שיווק',
  design: 'עיצוב',
  content: 'תוכן',
  management: 'ניהול',
};

const DEPT_COLORS: Record<Department, string> = {
  operations: '#3b82f6',
  sales: '#10b981',
  marketing: '#f59e0b',
  design: '#8b5cf6',
  content: '#ef4444',
  management: '#6366f1',
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'קריטי',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#94a3b8',
};

type FilterStatus = TaskStatus | 'all';
type SortMode = 'due' | 'priority' | 'status';

export function MyTasksView() {
  const { state, dispatch } = useStore();
  const me = state.currentUser;
  const now = new Date();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortMode, setSortMode] = useState<SortMode>('due');
  const [showDone, setShowDone] = useState(false);

  const myTasks = state.tasks.filter(t => t.assigneeIds.includes(me.id));

  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  const filtered = myTasks
    .filter(t => showDone ? true : t.status !== 'done')
    .filter(t => filterStatus === 'all' ? true : t.status === filterStatus)
    .sort((a, b) => {
      if (sortMode === 'due') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortMode === 'priority') return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
      if (sortMode === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  const overdue = filtered.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
  const dueSoon = filtered.filter(t =>
    t.dueDate && new Date(t.dueDate) >= now &&
    (new Date(t.dueDate).getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000 &&
    t.status !== 'done'
  );
  const recurring = filtered.filter(t => t.recurring && t.status !== 'done');
  const rest = filtered.filter(t =>
    t.status !== 'done' &&
    !(t.dueDate && new Date(t.dueDate) < now) &&
    !((t.dueDate && new Date(t.dueDate) >= now && (new Date(t.dueDate).getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000))
  );
  const done = filtered.filter(t => t.status === 'done');

  const openCount = myTasks.filter(t => t.status !== 'done').length;
  const doneCount = myTasks.filter(t => t.status === 'done').length;
  const pct = myTasks.length > 0 ? Math.round((doneCount / myTasks.length) * 100) : 0;

  function statusUpdate(taskId: string, status: TaskStatus) {
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, status } });
  }

  function TaskRow({ taskId }: { taskId: string }) {
    const task = state.tasks.find(t => t.id === taskId)!;
    if (!task) return null;
    const project = state.projects.find(p => p.id === task.projectId);
    const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
    const isDueSoon = task.dueDate && !isOverdue && task.status !== 'done' &&
      (new Date(task.dueDate).getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000;

    return (
      <div
        className="mytasks-row"
        onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
      >
        {/* Status toggle */}
        <button
          className="mytasks-status-btn"
          style={{ borderColor: STATUS_COLORS[task.status], color: STATUS_COLORS[task.status] }}
          onClick={e => {
            e.stopPropagation();
            const cycle: TaskStatus[] = ['todo', 'in_progress', 'done'];
            const idx = cycle.indexOf(task.status);
            statusUpdate(task.id, cycle[(idx + 1) % cycle.length]);
          }}
          title={STATUS_LABELS[task.status]}
        >
          {task.status === 'done'
            ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
            : <span className="material-symbols-outlined" style={{ fontSize: 16 }}>radio_button_unchecked</span>
          }
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mytasks-title" style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.55 : 1 }}>
            {task.title}
          </div>
          <div className="mytasks-meta">
            {project && <span className="mytasks-tag" style={{ background: project.color + '22', color: project.color }}>{project.name}</span>}
            {task.department && (
              <span className="mytasks-tag" style={{ background: DEPT_COLORS[task.department] + '22', color: DEPT_COLORS[task.department] }}>
                {DEPT_LABELS[task.department]}
              </span>
            )}
            {task.recurring && (
              <span className="mytasks-tag mytasks-recurring">
                <span className="material-symbols-outlined" style={{ fontSize: 11 }}>repeat</span>
                {task.recurringInterval === 'weekly' ? 'שבועי' : task.recurringInterval === 'monthly' ? 'חודשי' : 'יומי'}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Priority */}
          <span className="mytasks-priority" style={{ color: PRIORITY_COLORS[task.priority] }}>
            {PRIORITY_LABELS[task.priority]}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span className="mytasks-due" style={{
              color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : 'var(--on-surface-variant)',
              fontWeight: isOverdue ? 700 : 400,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_today</span>
              {new Date(task.dueDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
            </span>
          )}

          {/* Status pill */}
          <span className="mytasks-status-pill" style={{
            background: STATUS_COLORS[task.status] + '22',
            color: STATUS_COLORS[task.status],
          }}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>
      </div>
    );
  }

  function Section({ title, ids, accent }: { title: string; ids: string[]; accent?: string }) {
    if (ids.length === 0) return null;
    return (
      <div className="mytasks-section">
        <div className="mytasks-section-header" style={{ color: accent }}>
          <span>{title}</span>
          <span className="mytasks-section-count">{ids.length}</span>
        </div>
        {ids.map(id => <TaskRow key={id} taskId={id} />)}
      </div>
    );
  }

  const useSections = filterStatus === 'all' && sortMode === 'due';

  return (
    <div className="mytasks-view">
      {/* Header */}
      <div className="mytasks-header">
        <div>
          <h2 className="mytasks-title-main">המשימות שלי</h2>
          <p className="mytasks-sub">{me.name} — {openCount} פתוחות, {doneCount} הושלמו</p>
        </div>
        {/* Overall progress */}
        <div className="mytasks-progress-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>התקדמות כוללת</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mytasks-toolbar">
        <div className="mytasks-filters">
          {(['all', 'todo', 'in_progress', 'stuck', 'done'] as FilterStatus[]).map(s => (
            <button
              key={s}
              className={`mytasks-filter-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'הכל' : STATUS_LABELS[s as TaskStatus]}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="mytasks-sort-select"
            value={sortMode}
            onChange={e => setSortMode(e.target.value as SortMode)}
          >
            <option value="due">לפי תאריך</option>
            <option value="priority">לפי עדיפות</option>
            <option value="status">לפי סטטוס</option>
          </select>
          <label className="mytasks-toggle-label">
            <input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)} />
            הצג הושלמו
          </label>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 && (
        <div className="mytasks-empty">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#c4c4c4' }}>task_alt</span>
          <p>אין משימות להצגה</p>
        </div>
      )}

      {useSections ? (
        <>
          <Section title="באיחור" ids={overdue.map(t => t.id)} accent="#ef4444" />
          <Section title="צפויות השבוע" ids={dueSoon.map(t => t.id)} accent="#f59e0b" />
          <Section title="משימות חוזרות" ids={recurring.filter(t => !overdue.find(o => o.id === t.id) && !dueSoon.find(d => d.id === t.id)).map(t => t.id)} accent="#8b5cf6" />
          <Section title="שאר המשימות" ids={rest.filter(t => !recurring.find(r => r.id === t.id)).map(t => t.id)} />
          {showDone && <Section title="הושלמו" ids={done.map(t => t.id)} accent="#10b981" />}
        </>
      ) : (
        <div className="mytasks-section">
          {filtered.map(t => <TaskRow key={t.id} taskId={t.id} />)}
        </div>
      )}
    </div>
  );
}
