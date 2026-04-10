'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';

// ── Column definitions ──────────────────────────────────────────
type ColId =
  | 'title' | 'assignee' | 'status' | 'priority' | 'dueDate' | 'startDate'
  | 'tags' | 'timeTracked' | 'checkbox' | 'link' | 'phone' | 'location'
  | 'itemId' | 'worldClock' | 'files' | 'connectBoards' | 'mirror';

interface ColDef {
  id: ColId;
  label: string;
  width: number;
  fixed?: boolean;
}

const DEFAULT_COLS: ColDef[] = [
  { id: 'title',    label: 'שם משימה',  width: 280, fixed: true },
  { id: 'assignee', label: 'אחראי',     width: 140 },
  { id: 'status',   label: 'סטטוס',     width: 150 },
  { id: 'priority', label: 'עדיפות',    width: 130 },
  { id: 'dueDate',  label: 'תאריך יעד', width: 140 },
];

interface ColOption {
  id: ColId;
  label: string;
  description: string;
  icon: string;
  category: 'בסיסי' | 'מתקדם' | 'שיתוף';
  comingSoon?: boolean;
}

const COL_OPTIONS: ColOption[] = [
  { id: 'checkbox',      label: 'תיבת סימון',    description: 'סמן פריטים וראה מה הושלם במבט',   icon: 'check_box',          category: 'בסיסי' },
  { id: 'startDate',     label: 'תאריך התחלה',   description: 'תאריך תחילת עבודה על המשימה',      icon: 'calendar_today',     category: 'בסיסי' },
  { id: 'tags',          label: 'תגיות',          description: 'קטגוריזציה חופשית עם תגיות',       icon: 'label',              category: 'בסיסי' },
  { id: 'timeTracked',   label: 'מעקב זמן',      description: 'זמן עבודה שנרשם על המשימה',         icon: 'timer',              category: 'בסיסי' },
  { id: 'phone',         label: 'טלפון',          description: 'הוסף מספר טלפון לחיוג ישיר',       icon: 'phone',              category: 'בסיסי' },
  { id: 'link',          label: 'קישור',          description: 'קישור היפרטקסט לכל אתר',           icon: 'link',               category: 'בסיסי' },
  { id: 'location',      label: 'מיקום',          description: 'שמור כתובת או מיקום גיאוגרפי',     icon: 'location_on',        category: 'בסיסי' },
  { id: 'itemId',        label: 'מזהה פריט',      description: 'מספר מזהה ייחודי לכל פריט',        icon: 'tag',                category: 'בסיסי' },
  { id: 'worldClock',    label: 'שעון עולמי',     description: 'עקוב אחרי הזמן בכל מקום בעולם',   icon: 'language',           category: 'מתקדם' },
  { id: 'files',         label: 'קבצים',          description: 'הוסף קבצים ומסמכים לפריט',         icon: 'attach_file',        category: 'מתקדם' },
  { id: 'connectBoards', label: 'חיבור לוחות',    description: 'חבר נתונים מלוחות אחרים',          icon: 'device_hub',         category: 'שיתוף', comingSoon: true },
  { id: 'mirror',        label: 'שיקוף',          description: 'הצג וערוך נתונים מלוחות מחוברים', icon: 'content_copy',       category: 'שיתוף', comingSoon: true },
];

// ── Labels ──────────────────────────────────────────────────────
const STATUS_LABELS: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo:        { label: 'לביצוע',  color: '#323338', bg: '#e6e9ef' },
  in_progress: { label: 'בתהליך',  color: '#fff',    bg: '#fdab3d' },
  done:        { label: 'הושלם',   color: '#fff',    bg: '#00c875' },
  stuck:       { label: 'תקוע',    color: '#fff',    bg: '#e2445c' },
  backlog:     { label: 'Backlog', color: '#fff',    bg: '#9c27b0' },
};

const PRIORITY_LABELS: Record<TaskPriority, { label: string; bg: string; color: string }> = {
  critical: { label: 'קריטי',  bg: '#fde8ea', color: '#e2445c' },
  high:     { label: 'גבוה',   bg: '#fff0e0', color: '#d97706' },
  medium:   { label: 'בינוני', bg: '#fefce8', color: '#a16207' },
  low:      { label: 'נמוך',   bg: '#f0f0f0', color: '#737373' },
};

// ── Rich column picker ──────────────────────────────────────────
function ColPicker({ visibleIds, onAdd, onClose }: {
  visibleIds: Set<ColId>;
  onAdd: (id: ColId, label: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('הכל');
  const categories = ['הכל', 'בסיסי', 'מתקדם', 'שיתוף'];

  const available = COL_OPTIONS.filter(c =>
    !visibleIds.has(c.id) &&
    (activeCategory === 'הכל' || c.category === activeCategory) &&
    (!search || c.label.includes(search) || c.description.includes(search))
  );

  return (
    <div className="col-picker-panel" onClick={e => e.stopPropagation()}>
      <div className="col-picker-header">
        <span className="col-picker-title">הוסף עמודה</span>
        <button className="col-picker-close" onClick={onClose}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
        </button>
      </div>
      <input
        className="col-picker-search"
        placeholder="חיפוש עמודה..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        autoFocus
      />
      <div className="col-picker-cats">
        {categories.map(cat => (
          <button
            key={cat}
            className={`col-picker-cat ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >{cat}</button>
        ))}
      </div>
      <div className="col-picker-list">
        {available.length === 0 && (
          <div className="col-picker-empty">לא נמצאו עמודות</div>
        )}
        {available.map(opt => (
          <div
            key={opt.id}
            className={`col-picker-item ${opt.comingSoon ? 'coming-soon' : ''}`}
            onClick={() => { if (!opt.comingSoon) onAdd(opt.id, opt.label); }}
          >
            <div className="col-picker-item-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{opt.icon}</span>
            </div>
            <div className="col-picker-item-body">
              <div className="col-picker-item-label">
                {opt.label}
                {opt.comingSoon && <span className="col-picker-soon-badge">בקרוב</span>}
              </div>
              <div className="col-picker-item-desc">{opt.description}</div>
            </div>
          </div>
        ))}
        {visibleIds.size - 1 < COL_OPTIONS.length && available.length > 0 && (
          <div className="col-picker-all-added" style={{ display: available.length ? 'none' : 'block' }} />
        )}
      </div>
    </div>
  );
}

// ── Cell components ─────────────────────────────────────────────
function StatusCell({ status, taskId }: { status: TaskStatus; taskId: string }) {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const s = STATUS_LABELS[status];
  return (
    <div className="status-cell-wrapper">
      <button className="status-pill" style={{ background: s.bg, color: s.color }} onClick={() => setOpen(o => !o)}>
        {s.label}
      </button>
      {open && (
        <div className="status-dropdown">
          {(Object.entries(STATUS_LABELS) as [TaskStatus, typeof STATUS_LABELS[TaskStatus]][]).map(([k, v]) => (
            <div key={k} className="status-option" style={{ background: v.bg, color: v.color }}
              onClick={() => { dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, status: k } }); setOpen(false); }}>
              {v.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PriorityCell({ priority, taskId }: { priority: TaskPriority; taskId: string }) {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const p = PRIORITY_LABELS[priority];
  return (
    <div className="status-cell-wrapper">
      <button className="status-pill" style={{ background: p.bg, color: p.color }} onClick={() => setOpen(o => !o)}>
        {p.label}
      </button>
      {open && (
        <div className="status-dropdown">
          {(Object.entries(PRIORITY_LABELS) as [TaskPriority, typeof PRIORITY_LABELS[TaskPriority]][]).map(([k, v]) => (
            <div key={k} className="status-option" style={{ background: v.bg, color: v.color }}
              onClick={() => { dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, priority: k } }); setOpen(false); }}>
              {v.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssigneeCell({ task }: { task: Task }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggleUser = (userId: string) => {
    const ids = task.assigneeIds.includes(userId)
      ? task.assigneeIds.filter(id => id !== userId)
      : [...task.assigneeIds, userId];
    dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, assigneeIds: ids } });
  };

  const users = task.assigneeIds.map(id => state.users.find(u => u.id === id)).filter(Boolean);

  return (
    <div className="status-cell-wrapper" ref={ref}>
      <div className="assignee-cell-trigger" onClick={() => setOpen(o => !o)}>
        {users.length > 0
          ? <div className="avatar-group">
              {users.slice(0, 3).map(u => u && (
                <div key={u.id} className="table-avatar" style={{ background: u.color }} title={u.name}>{u.avatar}</div>
              ))}
            </div>
          : <span className="table-unassigned">+ הוסף</span>
        }
      </div>
      {open && (
        <div className="status-dropdown assignee-dropdown">
          {state.users.map(u => (
            <div key={u.id} className={`assignee-option ${task.assigneeIds.includes(u.id) ? 'selected' : ''}`}
              onClick={() => toggleUser(u.id)}>
              <div className="assignee-option-avatar" style={{ background: u.color }}>{u.avatar}</div>
              <span className="assignee-option-name">{u.name}</span>
              {task.assigneeIds.includes(u.id) && (
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)', marginRight: 'auto' }}>check</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DateCell({ value, taskId, field }: { value: string | null; taskId: string; field: 'dueDate' | 'startDate' }) {
  const { dispatch } = useStore();
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => { setShow(true); setTimeout(() => inputRef.current?.showPicker?.(), 50); };

  if (show || value) {
    return (
      <input ref={inputRef} type="date" className="date-input" value={value || ''}
        onChange={e => dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, [field]: e.target.value || null } })}
        onBlur={() => { if (!value) setShow(false); }}
        autoFocus={show && !value} />
    );
  }
  return <span className="table-unassigned date-add-btn" onClick={handleClick}>+ תאריך</span>;
}

function InlineTextCell({ value, taskId, field, placeholder, icon }: {
  value: string | null; taskId: string; field: string; placeholder: string; icon: string;
}) {
  const { dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');

  const save = () => {
    setEditing(false);
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, [field]: val.trim() || null } });
  };

  if (editing) {
    return (
      <input className="date-input" value={val} onChange={e => setVal(e.target.value)}
        onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setVal(value || ''); setEditing(false); } }}
        autoFocus placeholder={placeholder} dir={field === 'linkUrl' ? 'ltr' : 'rtl'} />
    );
  }

  if (value) {
    return (
      <div className="inline-text-cell" onClick={() => { setVal(value); setEditing(true); }}>
        <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'var(--primary)', flexShrink: 0 }}>{icon}</span>
        {field === 'linkUrl'
          ? <a href={value} target="_blank" rel="noreferrer" className="table-link-val" onClick={e => e.stopPropagation()}>{value.replace(/^https?:\/\//, '')}</a>
          : <span className="table-text-val">{value}</span>
        }
      </div>
    );
  }
  return <span className="table-unassigned" onClick={() => { setVal(''); setEditing(true); }}>+ הוסף</span>;
}

function WorldClockCell() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="world-clock-cell">
      <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>schedule</span>
      <span>{time}</span>
      <span style={{ fontSize: 9, color: 'var(--on-surface-variant)' }}>IL</span>
    </div>
  );
}

function renderCell(colId: ColId, task: Task) {
  switch (colId) {
    case 'assignee':    return <AssigneeCell task={task} />;
    case 'status':      return <StatusCell status={task.status} taskId={task.id} />;
    case 'priority':    return <PriorityCell priority={task.priority} taskId={task.id} />;
    case 'dueDate':     return <DateCell value={task.dueDate} taskId={task.id} field="dueDate" />;
    case 'startDate':   return <DateCell value={task.startDate} taskId={task.id} field="startDate" />;
    case 'tags':        return task.tags.length
      ? <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {task.tags.map(t => <span key={t} style={{ background: 'var(--primary-fixed)', color: 'var(--primary)', padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 600 }}>{t}</span>)}
        </div>
      : <span className="table-unassigned">—</span>;
    case 'timeTracked': return (
      <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontVariantNumeric: 'tabular-nums' }}>
        {task.timeTracked ? `${Math.floor(task.timeTracked / 60)}h ${task.timeTracked % 60}m` : '—'}
      </span>
    );
    case 'checkbox': {
      const { dispatch } = (() => { /* handled below */ })() as never; // eslint-disable-line
      return <CheckboxCell task={task} />;
    }
    case 'link':     return <InlineTextCell value={task.linkUrl}      taskId={task.id} field="linkUrl"       placeholder="https://..." icon="link" />;
    case 'phone':    return <InlineTextCell value={task.phoneValue}   taskId={task.id} field="phoneValue"    placeholder="050-000-0000" icon="phone" />;
    case 'location': return <InlineTextCell value={task.locationValue} taskId={task.id} field="locationValue" placeholder="כתובת..." icon="location_on" />;
    case 'itemId':   return <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', fontFamily: 'monospace' }}>{task.id.slice(0, 8).toUpperCase()}</span>;
    case 'worldClock': return <WorldClockCell />;
    case 'files':    return (
      <span style={{ fontSize: 11, color: 'var(--primary)', cursor: 'pointer' }}>
        {(task.attachments || []).length > 0 ? `${task.attachments.length} קבצים` : '+ קובץ'}
      </span>
    );
    case 'connectBoards':
    case 'mirror':   return <span style={{ fontSize: 11, color: '#94a3b8' }}>בקרוב</span>;
    default:         return null;
  }
}

function CheckboxCell({ task }: { task: Task }) {
  const { dispatch } = useStore();
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <input
        type="checkbox"
        checked={task.checkboxValue || false}
        onChange={e => dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, checkboxValue: e.target.checked } })}
        style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
      />
    </div>
  );
}

// ── TaskRow ─────────────────────────────────────────────────────
function TaskRow({ task, cols }: { task: Task; cols: ColDef[] }) {
  const { dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  return (
    <tr className="table-row">
      {cols.map(col => (
        <td key={col.id} className="table-cell" style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}>
          {col.id === 'title' ? (
            <div className="task-name-wrapper">
              <input type="checkbox" className="task-checkbox" checked={task.status === 'done'}
                onChange={e => dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, status: e.target.checked ? 'done' : 'todo' } })} />
              {editing ? (
                <input className="task-title-input" value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={() => { setEditing(false); if (title !== task.title) dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, title } }); }}
                  autoFocus />
              ) : (
                <span className="task-title"
                  onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
                  onDoubleClick={() => setEditing(true)}>
                  {task.title}
                </span>
              )}
            </div>
          ) : renderCell(col.id, task)}
        </td>
      ))}
      <td className="table-cell actions-cell" style={{ width: 40, minWidth: 40 }}>
        <button className="row-action-btn" title="מחק"
          onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
        </button>
      </td>
    </tr>
  );
}

// ── GroupSection ─────────────────────────────────────────────────
function GroupSection({ groupId, projectId, cols }: { groupId: string; projectId: string; cols: ColDef[] }) {
  const { state, dispatch } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [groupName, setGroupName] = useState('');

  const group = state.groups.find(g => g.id === groupId);
  const tasks = state.tasks.filter(t => t.groupId === groupId).sort((a, b) => a.order - b.order);
  if (!group) return null;

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      dispatch({ type: 'CREATE_TASK', payload: { projectId, groupId, title: newTaskTitle.trim() } });
      setNewTaskTitle('');
      setAddingTask(false);
    }
  };

  return (
    <div className="table-group">
      <div className="table-group-header">
        <button className="group-collapse-btn" onClick={() => setCollapsed(c => !c)}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{collapsed ? 'chevron_left' : 'expand_more'}</span>
        </button>
        <span className="group-color-swatch" style={{ background: group.color }} />
        {editingName ? (
          <input className="group-name-input" value={groupName}
            onChange={e => setGroupName(e.target.value)}
            onBlur={() => {
              setEditingName(false);
              if (groupName.trim() && groupName !== group.name)
                dispatch({ type: 'UPDATE_GROUP', payload: { id: groupId, name: groupName.trim() } });
            }}
            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingName(false); }}
            style={{ color: group.color }} autoFocus />
        ) : (
          <span className="group-name" style={{ color: group.color }}
            onDoubleClick={() => { setGroupName(group.name); setEditingName(true); }}>
            {group.name}
          </span>
        )}
        <span className="group-task-count">{tasks.length} פריטים</span>
      </div>

      {!collapsed && (
        <>
          <table className="table-view">
            <colgroup>
              {cols.map(col => <col key={col.id} style={{ width: col.width }} />)}
              <col style={{ width: 40 }} />
            </colgroup>
            <tbody>
              {tasks.map(task => <TaskRow key={task.id} task={task} cols={cols} />)}
              {addingTask && (
                <tr className="table-row">
                  <td className="table-cell task-name-cell" colSpan={cols.length + 1}>
                    <input className="new-task-input" placeholder="שם משימה..." value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') setAddingTask(false); }}
                      onBlur={handleAddTask} autoFocus />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button className="add-task-btn" onClick={() => setAddingTask(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span> הוסף פריט
          </button>
        </>
      )}
    </div>
  );
}

// ── TableView (main) ─────────────────────────────────────────────
export function TableView() {
  const { state, dispatch } = useStore();
  const [cols, setCols] = useState<ColDef[]>(DEFAULT_COLS);
  const [newGroupName, setNewGroupName] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);
  const [showColPicker, setShowColPicker] = useState(false);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const dragColIdx = useRef<number | null>(null);
  const resizingIdx = useRef<number | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  // Close picker on outside click
  useEffect(() => {
    if (!showColPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowColPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColPicker]);

  const projectGroups = state.groups
    .filter(g => g.projectId === state.activeProjectId)
    .sort((a, b) => a.order - b.order);

  const onResizeMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    e.preventDefault(); e.stopPropagation();
    resizingIdx.current = idx;
    resizeStartX.current = e.clientX;
    resizeStartW.current = cols[idx].width;
    const onMove = (ev: MouseEvent) => {
      if (resizingIdx.current === null) return;
      const delta = resizeStartX.current - ev.clientX;
      const newW = Math.max(80, resizeStartW.current + delta);
      setCols(prev => prev.map((c, i) => i === resizingIdx.current ? { ...c, width: newW } : c));
    };
    const onUp = () => {
      resizingIdx.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [cols]);

  const onDragStart = (e: React.DragEvent, idx: number) => {
    if (cols[idx].fixed) { e.preventDefault(); return; }
    dragColIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOver(idx); };
  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragColIdx.current;
    if (from === null || from === idx || cols[from]?.fixed) { setDragOver(null); return; }
    setCols(prev => { const next = [...prev]; const [moved] = next.splice(from, 1); next.splice(idx, 0, moved); return next; });
    setDragOver(null); dragColIdx.current = null;
  };

  const visibleIds = new Set(cols.map(c => c.id));
  const addCol = (id: ColId, label: string) => {
    const opt = COL_OPTIONS.find(o => o.id === id);
    setCols(prev => [...prev, { id, label, width: id === 'checkbox' || id === 'worldClock' || id === 'itemId' ? 110 : 150 }]);
    setShowColPicker(false);
    void opt;
  };
  const removeCol = (id: ColId) => setCols(prev => prev.filter(c => c.id !== id || c.fixed));

  const handleAddGroup = () => {
    if (newGroupName.trim() && state.activeProjectId) {
      dispatch({ type: 'CREATE_GROUP', payload: { projectId: state.activeProjectId, name: newGroupName.trim() } });
      setNewGroupName(''); setAddingGroup(false);
    }
  };

  return (
    <div className="table-view-container">
      {/* Column header bar */}
      <div className="table-col-header-row">
        {cols.map((col, idx) => (
          <div key={col.id}
            className={`table-col-header${dragOver === idx ? ' col-drag-over' : ''}`}
            style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
            draggable={!col.fixed}
            onDragStart={e => onDragStart(e, idx)}
            onDragOver={e => onDragOver(e, idx)}
            onDrop={e => onDrop(e, idx)}
            onDragEnd={() => { setDragOver(null); dragColIdx.current = null; }}
          >
            {!col.fixed && <span className="col-drag-handle" title="גרור להזזה"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>drag_indicator</span></span>}
            <span className="col-header-label">{col.label}</span>
            {!col.fixed && <button className="col-remove-btn" onClick={() => removeCol(col.id)} title="הסר עמודה">×</button>}
            <div className="col-resize-handle" onMouseDown={e => onResizeMouseDown(e, idx)} title="גרור לשינוי רוחב" />
          </div>
        ))}
        <div className="table-col-header" style={{ width: 40, minWidth: 40, flex: 'none' }} />
        {/* Add column */}
        <div className="table-col-header add-col-header" style={{ width: 44, minWidth: 44, flex: 'none', position: 'relative' }} ref={pickerRef}>
          <button className="add-col-btn" onClick={() => setShowColPicker(o => !o)} title="הוסף עמודה">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          </button>
          {showColPicker && (
            <ColPicker visibleIds={visibleIds} onAdd={addCol} onClose={() => setShowColPicker(false)} />
          )}
        </div>
      </div>

      {/* Groups */}
      {projectGroups.map(group => (
        <GroupSection key={group.id} groupId={group.id} projectId={state.activeProjectId!} cols={cols} />
      ))}

      {addingGroup ? (
        <div className="add-group-row">
          <input className="new-task-input" placeholder="שם קבוצה..." value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddGroup(); if (e.key === 'Escape') setAddingGroup(false); }}
            onBlur={handleAddGroup} autoFocus />
        </div>
      ) : (
        <button className="add-group-btn" onClick={() => setAddingGroup(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span> הוסף קבוצה
        </button>
      )}
    </div>
  );
}
