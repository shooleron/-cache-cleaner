'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

// ── Column definitions ──────────────────────────────────────────
type ColId = 'title' | 'assignee' | 'status' | 'priority' | 'dueDate' | 'startDate' | 'tags' | 'timeTracked';

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

const EXTRA_COLS: { id: ColId; label: string }[] = [
  { id: 'startDate',   label: 'תאריך התחלה' },
  { id: 'tags',        label: 'תגיות' },
  { id: 'timeTracked', label: 'זמן מעקב' },
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

// ── Cell components ─────────────────────────────────────────────
function UserAvatarGroup({ userIds }: { userIds: string[] }) {
  const { state } = useStore();
  const users = userIds.map(id => state.users.find(u => u.id === id)).filter(Boolean);
  if (!users.length) return <span className="table-unassigned">—</span>;
  return (
    <div className="avatar-group">
      {users.slice(0, 3).map(u => u && (
        <div key={u.id} className="table-avatar" style={{ background: u.color }} title={u.name}>{u.avatar}</div>
      ))}
    </div>
  );
}

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

function renderCell(colId: ColId, task: Task, dispatch: (a: any) => void) {
  switch (colId) {
    case 'assignee':    return <UserAvatarGroup userIds={task.assigneeIds} />;
    case 'status':      return <StatusCell status={task.status} taskId={task.id} />;
    case 'priority':    return <PriorityCell priority={task.priority} taskId={task.id} />;
    case 'dueDate':     return task.dueDate
      ? <input type="date" className="date-input" value={task.dueDate}
          onChange={e => dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, dueDate: e.target.value } })} />
      : <span className="table-unassigned">—</span>;
    case 'startDate':   return task.startDate
      ? <input type="date" className="date-input" value={task.startDate}
          onChange={e => dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, startDate: e.target.value } })} />
      : <span className="table-unassigned">—</span>;
    case 'tags':        return task.tags.length
      ? <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {task.tags.map(t => (
            <span key={t} style={{ background: 'var(--primary-fixed)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      : <span className="table-unassigned">—</span>;
    case 'timeTracked': return (
      <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
        {task.timeTracked ? `${Math.round(task.timeTracked / 60)}h` : '—'}
      </span>
    );
    default: return null;
  }
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
                  onBlur={() => {
                    setEditing(false);
                    if (title !== task.title) dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, title } });
                  }}
                  autoFocus />
              ) : (
                <span className="task-title"
                  onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
                  onDoubleClick={() => setEditing(true)}>
                  {task.title}
                </span>
              )}
            </div>
          ) : renderCell(col.id, task, dispatch)}
        </td>
      ))}
      <td className="table-cell actions-cell" style={{ width: 40, minWidth: 40 }}>
        <button className="row-action-btn" title="מחק"
          onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}>
          <Trash2 size={13} />
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
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
        <span className="group-color-swatch" style={{ background: group.color }} />
        <span className="group-name" style={{ color: group.color }}>{group.name}</span>
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
            <Plus size={13} /> הוסף פריט
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

  const dragColIdx = useRef<number | null>(null);
  const resizingIdx = useRef<number | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  const projectGroups = state.groups
    .filter(g => g.projectId === state.activeProjectId)
    .sort((a, b) => a.order - b.order);

  // ── Resize ──
  const onResizeMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    resizingIdx.current = idx;
    resizeStartX.current = e.clientX;
    resizeStartW.current = cols[idx].width;

    const onMove = (ev: MouseEvent) => {
      if (resizingIdx.current === null) return;
      // RTL: dragging handle leftward = increasing width
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

  // ── Reorder ──
  const onDragStart = (e: React.DragEvent, idx: number) => {
    if (cols[idx].fixed) { e.preventDefault(); return; }
    dragColIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  };
  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragColIdx.current;
    if (from === null || from === idx || cols[from]?.fixed) { setDragOver(null); return; }
    setCols(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragOver(null);
    dragColIdx.current = null;
  };

  // ── Add / remove columns ──
  const visibleIds = new Set(cols.map(c => c.id));
  const addCol = (id: ColId, label: string) => {
    setCols(prev => [...prev, { id, label, width: 140 }]);
    setShowColPicker(false);
  };
  const removeCol = (id: ColId) => setCols(prev => prev.filter(c => c.id !== id || c.fixed));

  const handleAddGroup = () => {
    if (newGroupName.trim() && state.activeProjectId) {
      dispatch({ type: 'CREATE_GROUP', payload: { projectId: state.activeProjectId, name: newGroupName.trim() } });
      setNewGroupName('');
      setAddingGroup(false);
    }
  };

  const availableCols = EXTRA_COLS.filter(c => !visibleIds.has(c.id));

  return (
    <div className="table-view-container">

      {/* ── Column header bar ── */}
      <div className="table-col-header-row">
        {cols.map((col, idx) => (
          <div
            key={col.id}
            className={`table-col-header${dragOver === idx ? ' col-drag-over' : ''}`}
            style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
            draggable={!col.fixed}
            onDragStart={e => onDragStart(e, idx)}
            onDragOver={e => onDragOver(e, idx)}
            onDrop={e => onDrop(e, idx)}
            onDragEnd={() => { setDragOver(null); dragColIdx.current = null; }}
          >
            {!col.fixed && (
              <span className="col-drag-handle" title="גרור להזזה">
                <GripVertical size={12} />
              </span>
            )}
            <span className="col-header-label">{col.label}</span>
            {!col.fixed && (
              <button className="col-remove-btn" onClick={() => removeCol(col.id)} title="הסר עמודה">×</button>
            )}
            <div className="col-resize-handle" onMouseDown={e => onResizeMouseDown(e, idx)} title="גרור לשינוי רוחב" />
          </div>
        ))}

        {/* delete-action col spacer */}
        <div className="table-col-header" style={{ width: 40, minWidth: 40, flex: 'none' }} />

        {/* Add column button */}
        <div className="table-col-header add-col-header" style={{ width: 44, minWidth: 44, flex: 'none', position: 'relative' }}>
          <button className="add-col-btn" onClick={() => setShowColPicker(o => !o)} title="הוסף עמודה">
            <Plus size={14} />
          </button>
          {showColPicker && (
            <div className="col-picker-dropdown">
              <div className="col-picker-title">הוסף עמודה</div>
              {availableCols.map(c => (
                <div key={c.id} className="col-picker-option" onClick={() => addCol(c.id, c.label)}>
                  <Plus size={12} />
                  {c.label}
                </div>
              ))}
              {availableCols.length === 0 && (
                <div className="col-picker-empty">כל העמודות מוצגות</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Groups ── */}
      {projectGroups.map(group => (
        <GroupSection key={group.id} groupId={group.id} projectId={state.activeProjectId!} cols={cols} />
      ))}

      {/* ── Add group ── */}
      {addingGroup ? (
        <div className="add-group-row">
          <input className="new-task-input" placeholder="שם קבוצה..." value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddGroup(); if (e.key === 'Escape') setAddingGroup(false); }}
            onBlur={handleAddGroup} autoFocus />
        </div>
      ) : (
        <button className="add-group-btn" onClick={() => setAddingGroup(true)}>
          <Plus size={14} /> הוסף קבוצה
        </button>
      )}
    </div>
  );
}
