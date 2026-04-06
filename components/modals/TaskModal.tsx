'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Task, TaskStatus, TaskPriority, User } from '@/lib/types';
import { X, Send, Calendar, User as UserIcon, Flag, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: '#e6e9ef' },
  { value: 'in_progress', label: 'Working on it', color: '#fdab3d' },
  { value: 'done', label: 'Done', color: '#00c875' },
  { value: 'stuck', label: 'Stuck', color: '#e2445c' },
  { value: 'backlog', label: 'Backlog', color: '#9c27b0' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: '#e2445c' },
  { value: 'high', label: 'High', color: '#fdab3d' },
  { value: 'medium', label: 'Medium', color: '#f2d600' },
  { value: 'low', label: 'Low', color: '#c4c4c4' },
];

export function TaskModal() {
  const { state, dispatch } = useStore();
  const [commentText, setCommentText] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const task = state.tasks.find(t => t.id === state.taskModalId);
  if (!task) return null;

  const project = state.projects.find(p => p.id === task.projectId);
  const projectMembers = project
    ? state.users.filter(u => project.memberIds.includes(u.id))
    : [];

  const updateTask = (updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, ...updates } });
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      dispatch({ type: 'ADD_COMMENT', payload: { taskId: task.id, text: commentText.trim() } });
      setCommentText('');
    }
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
            <span>{project?.icon} {project?.name}</span>
            <span>/</span>
            <span>Task Details</span>
          </div>
          <button className="modal-close-btn" onClick={() => dispatch({ type: 'CLOSE_TASK_MODAL' })}>
            <X size={18} />
          </button>
        </div>

        <div className="task-modal-body">
          {/* Left: main content */}
          <div className="task-modal-main">
            {/* Title */}
            <textarea
              className="task-modal-title"
              value={task.title}
              onChange={e => updateTask({ title: e.target.value })}
              rows={1}
            />

            {/* Description */}
            <div className="task-modal-section">
              <label>Description</label>
              <textarea
                className="task-description"
                placeholder="Add a description..."
                value={task.description}
                onChange={e => updateTask({ description: e.target.value })}
                rows={4}
              />
            </div>

            {/* Comments */}
            <div className="task-modal-section">
              <label>Activity</label>
              <div className="comments-list">
                {task.comments.map(comment => {
                  const author = state.users.find(u => u.id === comment.userId);
                  return (
                    <div key={comment.id} className="comment">
                      <div className="comment-avatar" style={{ background: author?.color || '#ccc' }}>
                        {author?.avatar}
                      </div>
                      <div className="comment-body">
                        <div className="comment-author">{author?.name}</div>
                        <div className="comment-text">{comment.text}</div>
                        <div className="comment-time">
                          {format(new Date(comment.createdAt), 'MMM d, HH:mm')}
                        </div>
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
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                />
                <button className="comment-send-btn" onClick={handleAddComment}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: metadata panel */}
          <div className="task-modal-sidebar">

            {/* Status */}
            <div className="task-meta-row">
              <label>Status</label>
              <div className="task-meta-select-wrap">
                <select
                  className="task-meta-select"
                  value={task.status}
                  onChange={e => updateTask({ status: e.target.value as TaskStatus })}
                  style={{ background: currentStatus?.color, color: task.status === 'todo' ? '#323338' : '#fff' }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div className="task-meta-row">
              <label>Priority</label>
              <select
                className="task-meta-select priority-select"
                value={task.priority}
                onChange={e => updateTask({ priority: e.target.value as TaskPriority })}
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Assignees */}
            <div className="task-meta-row">
              <label>Assignees</label>
              <div className="assignee-selector">
                <div
                  className="assignee-trigger"
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                >
                  {task.assigneeIds.length === 0 ? (
                    <span className="unassigned-text">+ Assign</span>
                  ) : (
                    <div className="assignee-avatars">
                      {task.assigneeIds.map(id => {
                        const u = state.users.find(u => u.id === id);
                        return u ? (
                          <div key={id} className="assignee-avatar-sm" style={{ background: u.color }}>{u.avatar}</div>
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
                        <div className="assignee-avatar-sm" style={{ background: member.color }}>
                          {member.avatar}
                        </div>
                        <div>
                          <div className="assignee-name">{member.name}</div>
                          <div className="assignee-email">{member.email}</div>
                        </div>
                        {task.assigneeIds.includes(member.id) && <span className="check-mark">✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div className="task-meta-row">
              <label>Start Date</label>
              <input
                type="date"
                className="task-date-input"
                value={task.startDate || ''}
                onChange={e => updateTask({ startDate: e.target.value || null })}
              />
            </div>

            {/* Due Date */}
            <div className="task-meta-row">
              <label>Due Date</label>
              <input
                type="date"
                className="task-date-input"
                value={task.dueDate || ''}
                onChange={e => updateTask({ dueDate: e.target.value || null })}
              />
            </div>

            {/* Created */}
            <div className="task-meta-row">
              <label>Created</label>
              <span className="task-meta-value">
                {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
