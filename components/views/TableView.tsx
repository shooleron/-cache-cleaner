'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { Plus, Trash2, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';

const STATUS_LABELS: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: 'To Do', color: '#323338', bg: '#e6e9ef' },
  in_progress: { label: 'Working on it', color: '#fff', bg: '#fdab3d' },
  done: { label: 'Done', color: '#fff', bg: '#00c875' },
  stuck: { label: 'Stuck', color: '#fff', bg: '#e2445c' },
  backlog: { label: 'Backlog', color: '#fff', bg: '#9c27b0' },
};

const PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string }> = {
  critical: { label: '🔴 Critical', color: '#e2445c' },
  high: { label: '🟠 High', color: '#fdab3d' },
  medium: { label: '🟡 Medium', color: '#f2d600' },
  low: { label: '⚪ Low', color: '#c4c4c4' },
};

function UserAvatarGroup({ userIds }: { userIds: string[] }) {
  const { state } = useStore();
  const users = userIds.map(id => state.users.find(u => u.id === id)).filter(Boolean);
  if (users.length === 0) {
    return <span className="table-unassigned">—</span>;
  }
  return (
    <div className="avatar-group">
      {users.slice(0, 3).map(u => u && (
        <div
          key={u.id}
          className="table-avatar"
          style={{ background: u.color }}
          title={u.name}
        >
          {u.avatar}
        </div>
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
      <button
        className="status-pill"
        style={{ background: s.bg, color: s.color }}
        onClick={() => setOpen(!open)}
      >
        {s.label}
      </button>
      {open && (
        <div className="status-dropdown">
          {(Object.entries(STATUS_LABELS) as [TaskStatus, typeof STATUS_LABELS[TaskStatus]][]).map(([k, v]) => (
            <div
              key={k}
              className="status-option"
              style={{ background: v.bg, color: v.color }}
              onClick={() => {
                dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, status: k } });
                setOpen(false);
              }}
            >
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
      <button className="priority-pill" onClick={() => setOpen(!open)}>
        {p.label}
      </button>
      {open && (
        <div className="status-dropdown">
          {(Object.entries(PRIORITY_LABELS) as [TaskPriority, typeof PRIORITY_LABELS[TaskPriority]][]).map(([k, v]) => (
            <div
              key={k}
              className="status-option priority-option"
              onClick={() => {
                dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, priority: k } });
                setOpen(false);
              }}
            >
              {v.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const { dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleTitleBlur = () => {
    setEditing(false);
    if (title !== task.title) {
      dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, title } });
    }
  };

  return (
    <tr className="table-row">
      <td className="table-cell task-name-cell">
        <div className="task-name-wrapper">
          <input
            type="checkbox"
            className="task-checkbox"
            checked={task.status === 'done'}
            onChange={e => dispatch({
              type: 'UPDATE_TASK',
              payload: { id: task.id, status: e.target.checked ? 'done' : 'todo' }
            })}
          />
          {editing ? (
            <input
              className="task-title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              autoFocus
            />
          ) : (
            <span
              className="task-title"
              onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
              onDoubleClick={() => setEditing(true)}
            >
              {task.title}
            </span>
          )}
        </div>
      </td>
      <td className="table-cell">
        <UserAvatarGroup userIds={task.assigneeIds} />
      </td>
      <td className="table-cell">
        <StatusCell status={task.status} taskId={task.id} />
      </td>
      <td className="table-cell">
        <PriorityCell priority={task.priority} taskId={task.id} />
      </td>
      <td className="table-cell date-cell">
        {task.dueDate ? (
          <input
            type="date"
            className="date-input"
            value={task.dueDate}
            onChange={e => dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, dueDate: e.target.value } })}
          />
        ) : (
          <span className="table-unassigned">—</span>
        )}
      </td>
      <td className="table-cell actions-cell">
        <button
          className="row-action-btn"
          onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

function GroupSection({ groupId, projectId }: { groupId: string; projectId: string }) {
  const { state, dispatch } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const group = state.groups.find(g => g.id === groupId);
  const tasks = state.tasks
    .filter(t => t.groupId === groupId)
    .sort((a, b) => a.order - b.order);

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
      <div className="table-group-header" style={{ '--group-color': group.color } as React.CSSProperties}>
        <button className="group-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
        <span className="group-name" style={{ color: group.color }}>{group.name}</span>
        <span className="group-task-count">{tasks.length} items</span>
      </div>

      {!collapsed && (
        <table className="table-view">
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '3%' }} />
          </colgroup>
          <tbody>
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} />
            ))}
            {addingTask && (
              <tr className="table-row add-task-row">
                <td className="table-cell task-name-cell" colSpan={6}>
                  <input
                    className="new-task-input"
                    placeholder="Task name..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddTask();
                      if (e.key === 'Escape') setAddingTask(false);
                    }}
                    onBlur={handleAddTask}
                    autoFocus
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {!collapsed && (
        <button className="add-task-btn" onClick={() => setAddingTask(true)}>
          <Plus size={13} />
          Add Item
        </button>
      )}
    </div>
  );
}

export function TableView() {
  const { state, dispatch } = useStore();
  const [newGroupName, setNewGroupName] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);

  const projectGroups = state.groups
    .filter(g => g.projectId === state.activeProjectId)
    .sort((a, b) => a.order - b.order);

  const handleAddGroup = () => {
    if (newGroupName.trim() && state.activeProjectId) {
      dispatch({ type: 'CREATE_GROUP', payload: { projectId: state.activeProjectId, name: newGroupName.trim() } });
      setNewGroupName('');
      setAddingGroup(false);
    }
  };

  return (
    <div className="table-view-container">
      {/* Column headers */}
      <div className="table-column-headers">
        <div className="col-header task-col">Task Name</div>
        <div className="col-header">Assignee</div>
        <div className="col-header">Status</div>
        <div className="col-header">Priority</div>
        <div className="col-header">Due Date</div>
        <div className="col-header"></div>
      </div>

      {/* Groups */}
      {projectGroups.map(group => (
        <GroupSection
          key={group.id}
          groupId={group.id}
          projectId={state.activeProjectId!}
        />
      ))}

      {/* Add group */}
      {addingGroup ? (
        <div className="add-group-row">
          <input
            className="new-task-input"
            placeholder="Group name..."
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddGroup();
              if (e.key === 'Escape') setAddingGroup(false);
            }}
            onBlur={handleAddGroup}
            autoFocus
          />
        </div>
      ) : (
        <button className="add-group-btn" onClick={() => setAddingGroup(true)}>
          <Plus size={14} />
          Add Group
        </button>
      )}
    </div>
  );
}
