'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; textDark?: boolean }[] = [
  { value: 'todo',        label: 'לביצוע',         color: '#e6e9ef', textDark: true },
  { value: 'in_progress', label: 'בתהליך',          color: '#fdab3d' },
  { value: 'done',        label: 'הושלם',           color: '#00c875' },
  { value: 'stuck',       label: 'תקוע',            color: '#e2445c' },
  { value: 'backlog',     label: 'בקלוג',           color: '#9c27b0' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string; icon: string }[] = [
  { value: 'critical', label: 'קריטי',   color: '#e2445c', icon: 'priority_high' },
  { value: 'high',     label: 'גבוה',    color: '#fdab3d', icon: 'keyboard_double_arrow_up' },
  { value: 'medium',   label: 'בינוני',  color: '#f2d600', icon: 'drag_handle' },
  { value: 'low',      label: 'נמוך',    color: '#c4c4c4', icon: 'keyboard_double_arrow_down' },
];

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שע׳`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

export function TaskModal() {
  const { state, dispatch } = useStore();
  const [commentText, setCommentText] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'subtasks'>('activity');

  const task = state.tasks.find(t => t.id === state.taskModalId);
  if (!task) return null;

  const project = state.projects.find(p => p.id === task.projectId);
  const projectMembers = project
    ? state.users.filter(u => project.memberIds.includes(u.id))
    : state.users;

  const updateTask = (updates: Partial<Task>) =>
    dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, ...updates } });

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    dispatch({ type: 'ADD_COMMENT', payload: { taskId: task.id, text: commentText.trim() } });
    setCommentText('');
  };

  const toggleAssignee = (userId: string) => {
    const newIds = task.assigneeIds.includes(userId)
      ? task.assigneeIds.filter(id => id !== userId)
      : [...task.assigneeIds, userId];
    updateTask({ assigneeIds: newIds });
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === task.status);
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === task.priority);

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_TASK_MODAL' })}>
      <div className="task-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-breadcrumb">
            <span style={{ opacity: 0.5 }}>{project?.icon} {project?.name}</span>
            <span style={{ opacity: 0.3 }}>/</span>
            <span>פרטי משימה</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="task-modal-delete-btn"
              onClick={() => { dispatch({ type: 'DELETE_TASK', payload: task.id }); dispatch({ type: 'CLOSE_TASK_MODAL' }); }}
              title="מחק משימה"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
            </button>
            <button className="modal-close-btn" onClick={() => dispatch({ type: 'CLOSE_TASK_MODAL' })}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="task-modal-body">
          {/* Left: main content */}
          <div className="task-modal-main">
            <textarea
              className="task-modal-title"
              value={task.title}
              onChange={e => updateTask({ title: e.target.value })}
              rows={2}
              placeholder="שם המשימה..."
            />

            <div className="task-modal-section">
              <label>תיאור</label>
              <textarea
                className="task-description"
                placeholder="הוסף תיאור למשימה..."
                value={task.description}
                onChange={e => updateTask({ description: e.target.value })}
                rows={4}
              />
            </div>

            {/* Tabs */}
            <div className="task-tabs">
              <button
                className={`task-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>forum</span>
                פעילות {task.comments.length > 0 && `(${task.comments.length})`}
              </button>
              <button
                className={`task-tab-btn ${activeTab === 'subtasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('subtasks')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>checklist</span>
                תת-משימות {task.subItems.length > 0 && `(${task.subItems.length})`}
              </button>
            </div>

            {/* Activity tab */}
            {activeTab === 'activity' && (
              <div className="task-modal-section" style={{ marginTop: 0 }}>
                <div className="comments-list">
                  {task.comments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--on-surface-variant)', fontSize: 13 }}>
                      אין תגובות עדיין
                    </div>
                  )}
                  {task.comments.map(comment => {
                    const author = state.users.find(u => u.id === comment.userId);
                    return (
                      <div key={comment.id} className="comment">
                        <div className="comment-avatar" style={{ background: author?.color || '#ccc' }}>
                          {author?.avatar}
                        </div>
                        <div className="comment-body">
                          <div style={{ display: 'flex', gap: 8, flexDirection: 'row-reverse', alignItems: 'baseline' }}>
                            <div className="comment-author">{author?.name}</div>
                            <div className="comment-time">{formatRelativeTime(comment.createdAt)}</div>
                          </div>
                          <div className="comment-text">{comment.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="comment-input-row">
                  <div className="comment-input-avatar" style={{ background: state.currentUser.color }}>
                    {state.currentUser.avatar}
                  </div>
                  <input
                    className="comment-input"
                    placeholder="כתוב תגובה..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  />
                  <button className="comment-send-btn" onClick={handleAddComment} disabled={!commentText.trim()}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-tasks tab */}
            {activeTab === 'subtasks' && (
              <div className="task-modal-section" style={{ marginTop: 0 }}>
                {task.subItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--on-surface-variant)', fontSize: 13 }}>
                    אין תת-משימות
                  </div>
                ) : (
                  <div className="subtask-list">
                    {task.subItems.map(sub => (
                      <div key={sub.id} className={`subtask-row ${sub.done ? 'done' : ''}`}>
                        <input
                          type="checkbox"
                          checked={sub.done}
                          onChange={() => dispatch({ type: 'TOGGLE_SUB_ITEM', payload: { taskId: task.id, subItemId: sub.id } })}
                          style={{ accentColor: 'var(--primary)', width: 16, height: 16, flexShrink: 0 }}
                        />
                        <span className="subtask-title">{sub.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <SubTaskInput taskId={task.id} />
              </div>
            )}
          </div>

          {/* Right: metadata */}
          <div className="task-modal-sidebar">

            {/* Status */}
            <div className="task-meta-row">
              <label>סטטוס</label>
              <select
                className="task-meta-select"
                value={task.status}
                onChange={e => updateTask({ status: e.target.value as TaskStatus })}
                style={{
                  background: currentStatus?.color,
                  color: currentStatus?.textDark ? '#323338' : '#fff',
                  fontWeight: 700,
                }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="task-meta-row">
              <label>עדיפות</label>
              <div className="task-priority-display" style={{ color: currentPriority?.color }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{currentPriority?.icon}</span>
                <select
                  className="task-meta-select-bare"
                  value={task.priority}
                  onChange={e => updateTask({ priority: e.target.value as TaskPriority })}
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignees */}
            <div className="task-meta-row">
              <label>אחראים</label>
              <div className="assignee-selector" style={{ position: 'relative' }}>
                <div className="assignee-trigger" onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}>
                  {task.assigneeIds.length === 0 ? (
                    <span className="unassigned-text">+ הוסף</span>
                  ) : (
                    <div className="assignee-avatars">
                      {task.assigneeIds.map(id => {
                        const u = state.users.find(u => u.id === id);
                        return u ? (
                          <div key={id} className="assignee-avatar-sm" style={{ background: u.color }} title={u.name}>{u.avatar}</div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                {showAssigneeDropdown && (
                  <div className="assignee-dropdown">
                    {projectMembers.map(member => (
                      <div
                        key={member.id}
                        className={`assignee-option ${task.assigneeIds.includes(member.id) ? 'selected' : ''}`}
                        onClick={() => toggleAssignee(member.id)}
                      >
                        <div className="assignee-avatar-sm" style={{ background: member.color }}>{member.avatar}</div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <div className="assignee-name">{member.name}</div>
                          <div className="assignee-email">{member.email}</div>
                        </div>
                        {task.assigneeIds.includes(member.id) && (
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>check</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div className="task-meta-row">
              <label>התחלה</label>
              <input
                type="date"
                className="task-date-input"
                value={task.startDate || ''}
                onChange={e => updateTask({ startDate: e.target.value || null })}
              />
            </div>

            {/* Due Date */}
            <div className="task-meta-row">
              <label>יעד</label>
              <input
                type="date"
                className="task-date-input"
                value={task.dueDate || ''}
                onChange={e => updateTask({ dueDate: e.target.value || null })}
              />
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="task-meta-row" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <label>תגיות</label>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
                  {task.tags.map(tag => (
                    <span key={tag} className="task-tag-chip">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Created */}
            <div className="task-meta-row" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--outline-variant)' }}>
              <label>נוצר</label>
              <span className="task-meta-value">
                {new Date(task.createdAt).toLocaleDateString('he-IL')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubTaskInput({ taskId }: { taskId: string }) {
  const { dispatch } = useStore();
  const [title, setTitle] = useState('');

  const add = () => {
    if (!title.trim()) return;
    dispatch({ type: 'ADD_SUB_ITEM', payload: { taskId, title: title.trim() } });
    setTitle('');
  };

  return (
    <div className="subtask-add-row">
      <input
        className="subtask-add-input"
        placeholder="+ הוסף תת-משימה..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') add(); }}
      />
    </div>
  );
}
