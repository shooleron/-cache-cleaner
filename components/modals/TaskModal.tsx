'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Task, TaskStatus, TaskPriority, AttachmentType } from '@/lib/types';
import { useConfirm } from '@/components/ui/ConfirmDialog';

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; textDark?: boolean }[] = [
  { value: 'todo',        label: 'לביצוע',  color: '#e6e9ef', textDark: true },
  { value: 'in_progress', label: 'בתהליך',  color: '#fdab3d' },
  { value: 'done',        label: 'הושלם',   color: '#00c875' },
  { value: 'stuck',       label: 'תקוע',    color: '#e2445c' },
  { value: 'backlog',     label: 'בקלוג',   color: '#9c27b0' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string; icon: string }[] = [
  { value: 'critical', label: 'קריטי',  color: '#e2445c', icon: 'priority_high' },
  { value: 'high',     label: 'גבוה',   color: '#fdab3d', icon: 'keyboard_double_arrow_up' },
  { value: 'medium',   label: 'בינוני', color: '#f2d600', icon: 'drag_handle' },
  { value: 'low',      label: 'נמוך',   color: '#c4c4c4', icon: 'keyboard_double_arrow_down' },
];

const ATTACHMENT_ICONS: Record<AttachmentType, string> = {
  file: 'attach_file',
  link: 'link',
  drive: 'folder_shared',
  dropbox: 'cloud',
};

const ATTACHMENT_COLORS: Record<AttachmentType, string> = {
  file: '#0073ea',
  link: '#9c27b0',
  drive: '#00c875',
  dropbox: '#0073ea',
};

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שע׳`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMimeIcon(mimeType?: string): string {
  if (!mimeType) return 'description';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'videocam';
  if (mimeType === 'application/pdf') return 'picture_as_pdf';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'table_chart';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'article';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slideshow';
  if (mimeType.startsWith('text/')) return 'text_snippet';
  return 'description';
}

type TabType = 'chat' | 'notes' | 'files' | 'subtasks';

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function TimerWidget({ task }: { task: Task }) {
  const { dispatch } = useStore();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds in current session
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const totalTrackedSec = (task.timeTracked || 0) * 60;

  function stop() {
    setRunning(false);
    if (elapsed > 0) {
      const addedMinutes = Math.ceil(elapsed / 60);
      dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, timeTracked: (task.timeTracked || 0) + addedMinutes } });
      setElapsed(0);
    }
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
  }

  return (
    <div className="timer-widget">
      <div className="timer-display">
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: running ? '#10b981' : 'var(--on-surface-variant)' }}>
          {running ? 'timer' : 'timer'}
        </span>
        <span className="timer-current" style={{ color: running ? '#10b981' : 'var(--on-surface)' }}>
          {formatDuration(elapsed)}
        </span>
      </div>
      <div className="timer-total">
        סה״כ: {formatDuration(totalTrackedSec + elapsed)}
      </div>
      <div className="timer-btns">
        {!running ? (
          <button className="timer-btn start" onClick={() => setRunning(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>play_arrow</span>
            התחל
          </button>
        ) : (
          <button className="timer-btn stop" onClick={stop}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>stop</span>
            עצור ושמור
          </button>
        )}
        {elapsed > 0 && !running && (
          <button className="timer-btn reset" onClick={reset}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>restart_alt</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function TaskModal() {
  const { state, dispatch } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [confirm, confirmDialog] = useConfirm();
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  const task = state.tasks.find(t => t.id === state.taskModalId);
  if (!task) return null;

  const project = state.projects.find(p => p.id === task.projectId);
  const projectMembers = project
    ? state.users.filter(u => project.memberIds.includes(u.id))
    : state.users;

  const updateTask = (updates: Partial<Task>) =>
    dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, ...updates } });

  const toggleAssignee = (userId: string) => {
    const newIds = task.assigneeIds.includes(userId)
      ? task.assigneeIds.filter(id => id !== userId)
      : [...task.assigneeIds, userId];
    updateTask({ assigneeIds: newIds });
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === task.status);
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === task.priority);

  const tabs: { id: TabType; label: string; icon: string; count?: number }[] = [
    { id: 'chat',     label: 'צ׳אט',      icon: 'forum',      count: task.comments.filter(c => c.type === 'comment').length || undefined },
    { id: 'notes',    label: 'הערות',     icon: 'sticky_note_2', count: (task.notes || []).length || undefined },
    { id: 'files',    label: 'קבצים',     icon: 'attach_file', count: (task.attachments || []).length || undefined },
    { id: 'subtasks', label: 'תת-משימות', icon: 'checklist',  count: task.subItems.length || undefined },
  ];

  return (
    <>
      {confirmDialog}
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
            <button className="modal-close-btn" onClick={() => dispatch({ type: 'CLOSE_TASK_MODAL' })}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="task-modal-body">
          {/* Left: main content */}
          <div className="task-modal-main">
            <textarea className="task-modal-title" value={task.title}
              onChange={e => updateTask({ title: e.target.value })} rows={2} placeholder="שם המשימה..." />

            <div className="task-modal-section">
              <label>תיאור</label>
              <textarea className="task-description" placeholder="הוסף תיאור למשימה..."
                value={task.description} onChange={e => updateTask({ description: e.target.value })} rows={3} />
            </div>

            {/* Tabs */}
            <div className="task-tabs">
              {tabs.map(tab => (
                <button key={tab.id} className={`task-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{tab.icon}</span>
                  {tab.label}
                  {tab.count ? <span className="task-tab-count">{tab.count}</span> : null}
                </button>
              ))}
            </div>

            <div className="task-tab-content">
              {activeTab === 'chat'     && <ChatTab task={task} />}
              {activeTab === 'notes'    && <NotesTab task={task} />}
              {activeTab === 'files'    && <FilesTab task={task} />}
              {activeTab === 'subtasks' && <SubtasksTab task={task} />}
            </div>
          </div>

          {/* Right: metadata */}
          <div className="task-modal-sidebar">
            <div className="task-meta-row">
              <label>סטטוס</label>
              <select className="task-meta-select" value={task.status}
                onChange={e => updateTask({ status: e.target.value as TaskStatus })}
                style={{ background: currentStatus?.color, color: currentStatus?.textDark ? '#323338' : '#fff', fontWeight: 700 }}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="task-meta-row">
              <label>עדיפות</label>
              <div className="task-priority-display" style={{ color: currentPriority?.color }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{currentPriority?.icon}</span>
                <select className="task-meta-select-bare" value={task.priority}
                  onChange={e => updateTask({ priority: e.target.value as TaskPriority })}>
                  {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div className="task-meta-row">
              <label>אחראים</label>
              <div className="assignee-selector" style={{ position: 'relative' }}>
                <div className="assignee-trigger" onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}>
                  {task.assigneeIds.length === 0
                    ? <span className="unassigned-text">+ הוסף</span>
                    : <div className="assignee-avatars">
                        {task.assigneeIds.map(id => {
                          const u = state.users.find(u => u.id === id);
                          return u ? <div key={id} className="assignee-avatar-sm" style={{ background: u.color }} title={u.name}>{u.avatar}</div> : null;
                        })}
                      </div>
                  }
                </div>
                {showAssigneeDropdown && (
                  <div className="assignee-dropdown">
                    {projectMembers.map(member => (
                      <div key={member.id} className={`assignee-option ${task.assigneeIds.includes(member.id) ? 'selected' : ''}`}
                        onClick={() => toggleAssignee(member.id)}>
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

            <div className="task-meta-row">
              <label>התחלה</label>
              <input type="date" className="task-date-input" value={task.startDate || ''}
                onChange={e => updateTask({ startDate: e.target.value || null })} />
            </div>

            <div className="task-meta-row">
              <label>יעד</label>
              <input type="date" className="task-date-input" value={task.dueDate || ''}
                onChange={e => updateTask({ dueDate: e.target.value || null })} />
            </div>

            {/* External Contact */}
            <div className="task-meta-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
              <label>איש קשר חיצוני</label>
              {task.contactId ? (() => {
                const contact = state.contacts.find(c => c.id === task.contactId);
                return contact ? (
                  <div className="task-contact-badge">
                    <div className="task-contact-avatar">{contact.name.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="task-contact-name">{contact.name}</div>
                      <div className="task-contact-co">{contact.company}</div>
                    </div>
                    <button className="task-contact-remove" onClick={() => updateTask({ contactId: null })} title="הסר">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                    </button>
                  </div>
                ) : null;
              })() : (
                <div style={{ position: 'relative' }}>
                  <button className="task-contact-add-btn" onClick={() => setShowContactDropdown(d => !d)}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_add</span>
                    שייך איש קשר
                  </button>
                  {showContactDropdown && (
                    <div className="task-contact-dropdown">
                      <input
                        className="task-contact-search"
                        placeholder="חיפוש..."
                        value={contactSearch}
                        onChange={e => setContactSearch(e.target.value)}
                        autoFocus
                      />
                      <div className="task-contact-options">
                        {state.contacts
                          .filter(c => !contactSearch || c.name.includes(contactSearch) || c.company.includes(contactSearch))
                          .slice(0, 8)
                          .map(c => (
                            <div key={c.id} className="task-contact-option" onClick={() => {
                              updateTask({ contactId: c.id });
                              setShowContactDropdown(false);
                              setContactSearch('');
                            }}>
                              <div className="task-contact-avatar" style={{ background: '#6366f1' }}>{c.name.charAt(0)}</div>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{c.company}</div>
                              </div>
                            </div>
                          ))}
                        {state.contacts.length === 0 && (
                          <div style={{ padding: 10, fontSize: 12, color: 'var(--on-surface-variant)', textAlign: 'center' }}>אין אנשי קשר</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="task-meta-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
              <label>מעקב זמן</label>
              <TimerWidget task={task} />
            </div>

            {task.tags.length > 0 && (
              <div className="task-meta-row" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <label>תגיות</label>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
                  {task.tags.map(tag => <span key={tag} className="task-tag-chip">{tag}</span>)}
                </div>
              </div>
            )}

            <div className="task-meta-row" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--outline-variant)' }}>
              <label>נוצר</label>
              <span className="task-meta-value">{new Date(task.createdAt).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
        </div>

        {/* Footer with delete */}
        <div className="task-modal-footer">
          <button className="task-modal-delete-btn-footer"
            onClick={async () => {
              const ok = await confirm({ title: 'מחיקת משימה', message: `האם אתה בטוח שברצונך למחוק את המשימה "${task.title}"?`, confirmLabel: 'מחק', danger: true });
              if (ok) { dispatch({ type: 'DELETE_TASK', payload: task.id }); dispatch({ type: 'CLOSE_TASK_MODAL' }); }
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
            מחק משימה
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

// ── Chat Tab ─────────────────────────────────────────────────────
function ChatTab({ task }: { task: Task }) {
  const { state, dispatch } = useStore();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Merge comments + activity entries, sorted by time
  const allItems = [...task.comments].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const send = () => {
    if (!text.trim()) return;
    dispatch({ type: 'ADD_COMMENT', payload: { taskId: task.id, text: text.trim(), commentType: 'comment' } });
    setText('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div className="chat-tab">
      <div className="chat-messages">
        {allItems.length === 0 && (
          <div className="chat-empty">
            <span className="material-symbols-outlined">forum</span>
            <p>אין הודעות עדיין — התחל שיחה</p>
          </div>
        )}
        {allItems.map(item => {
          const author = state.users.find(u => u.id === item.userId);

          // Activity entry — inline system row
          if (item.type === 'activity') {
            return (
              <div key={item.id} className="chat-activity-row">
                <div className="chat-activity-avatar" style={{ background: author?.color || '#94a3b8' }}>
                  {author?.avatar}
                </div>
                <div className="chat-activity-body">
                  <span className="chat-activity-actor">{author?.name}</span>
                  <span className="chat-activity-text">{item.text}</span>
                  <span className="chat-activity-time">{formatRelativeTime(item.createdAt)}</span>
                </div>
              </div>
            );
          }

          // Regular comment
          const isMe = item.userId === state.currentUser.id;
          return (
            <div key={item.id} className={`chat-message-row ${isMe ? 'mine' : 'theirs'}`}>
              {!isMe && (
                <div className="chat-avatar" style={{ background: author?.color || '#ccc' }}>{author?.avatar}</div>
              )}
              <div className={`chat-bubble ${isMe ? 'mine' : 'theirs'}`}>
                {!isMe && <div className="chat-sender">{author?.name}</div>}
                <p className="chat-text">{item.text}</p>
                <span className="chat-time">{formatRelativeTime(item.createdAt)}</span>
              </div>
              {isMe && (
                <div className="chat-avatar" style={{ background: state.currentUser.color }}>{state.currentUser.avatar}</div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <div className="chat-input-avatar" style={{ background: state.currentUser.color }}>{state.currentUser.avatar}</div>
        <input className="chat-input" placeholder="כתוב הודעה..." value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="chat-send-btn" onClick={send} disabled={!text.trim()}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
        </button>
      </div>
    </div>
  );
}

// ── Notes Tab ────────────────────────────────────────────────────
function NotesTab({ task }: { task: Task }) {
  const { state, dispatch } = useStore();
  const [confirm, confirmDialog] = useConfirm();
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const notes = task.notes || [];

  const addNote = () => {
    if (!newNote.trim()) return;
    dispatch({ type: 'ADD_NOTE', payload: { taskId: task.id, content: newNote.trim() } });
    setNewNote('');
  };

  const saveEdit = (noteId: string) => {
    if (editContent.trim()) {
      dispatch({ type: 'UPDATE_NOTE', payload: { taskId: task.id, noteId, content: editContent.trim() } });
    }
    setEditingId(null);
  };

  return (
    <>
      {confirmDialog}
      <div className="notes-tab">
      {/* Add note */}
      <div className="note-add-box">
        <textarea className="note-add-input" placeholder="הוסף הערה פנימית..." value={newNote}
          onChange={e => setNewNote(e.target.value)} rows={3}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote(); }} />
        <div className="note-add-footer">
          <span className="note-add-hint">⌘↵ לשמירה</span>
          <button className="note-save-btn" onClick={addNote} disabled={!newNote.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
            הוסף הערה
          </button>
        </div>
      </div>

      {notes.length === 0 && (
        <div className="chat-empty">
          <span className="material-symbols-outlined">sticky_note_2</span>
          <p>אין הערות עדיין</p>
        </div>
      )}

      <div className="notes-list">
        {notes.map(note => {
          const author = state.users.find(u => u.id === note.userId);
          const isMe = note.userId === state.currentUser.id;
          return (
            <div key={note.id} className="note-card">
              <div className="note-card-header">
                <div className="note-author-wrap">
                  <div className="chat-avatar" style={{ background: author?.color, width: 24, height: 24, fontSize: 10 }}>{author?.avatar}</div>
                  <span className="note-author-name">{author?.name}</span>
                  <span className="chat-time">{formatRelativeTime(note.createdAt)}</span>
                  {note.updatedAt !== note.createdAt && <span className="note-edited">(עודכן)</span>}
                </div>
                {isMe && (
                  <div className="note-actions">
                    <button className="note-action-btn" onClick={() => { setEditingId(note.id); setEditContent(note.content); }} title="ערוך">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                    </button>
                    <button className="note-action-btn danger" onClick={async () => { const ok = await confirm({ title: 'מחיקת הערה', message: 'האם אתה בטוח שברצונך למחוק את ההערה?', confirmLabel: 'מחק', danger: true }); if (ok) dispatch({ type: 'DELETE_NOTE', payload: { taskId: task.id, noteId: note.id } }); }} title="מחק">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                    </button>
                  </div>
                )}
              </div>
              {editingId === note.id ? (
                <div>
                  <textarea className="note-edit-input" value={editContent}
                    onChange={e => setEditContent(e.target.value)} rows={3} autoFocus />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                    <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => setEditingId(null)}>ביטול</button>
                    <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => saveEdit(note.id)}>שמור</button>
                  </div>
                </div>
              ) : (
                <p className="note-content">{note.content}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}

// ── Files Tab ────────────────────────────────────────────────────
function FilesTab({ task }: { task: Task }) {
  const { dispatch } = useStore();
  const [confirm, confirmDialog] = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [linkMode, setLinkMode] = useState<AttachmentType | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [sizeError, setSizeError] = useState('');
  const attachments = task.attachments || [];

  const processFile = useCallback((file: File) => {
    if (file.size > FILE_SIZE_LIMIT) {
      setSizeError(`הקובץ "${file.name}" גדול מדי (מקסימום 10MB)`);
      return;
    }
    setSizeError('');
    const reader = new FileReader();
    reader.onload = e => {
      dispatch({
        type: 'ADD_ATTACHMENT',
        payload: { taskId: task.id, type: 'file', name: file.name, url: e.target?.result as string, size: file.size, mimeType: file.type },
      });
    };
    reader.readAsDataURL(file);
  }, [task.id, dispatch]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(processFile);
    e.target.value = '';
  };

  const addLink = (type: AttachmentType) => {
    if (!linkUrl.trim()) return;
    const name = linkName.trim() || linkUrl;
    dispatch({ type: 'ADD_ATTACHMENT', payload: { taskId: task.id, type, name, url: linkUrl.trim() } });
    setLinkUrl('');
    setLinkName('');
    setLinkMode(null);
  };

  const LINK_CONFIGS: { type: AttachmentType; label: string; placeholder: string; icon: string; color: string }[] = [
    { type: 'link',    label: 'לינק חיצוני',     placeholder: 'https://...',                       icon: 'link',          color: '#9c27b0' },
    { type: 'drive',   label: 'Google Drive',     placeholder: 'https://drive.google.com/...',      icon: 'folder_shared', color: '#00c875' },
    { type: 'dropbox', label: 'Dropbox',           placeholder: 'https://www.dropbox.com/...',       icon: 'cloud',         color: '#0073ea' },
  ];

  return (
    <>
      {confirmDialog}
      <div className="files-tab">
      {/* Drop zone */}
      <div
        className={`file-drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 32, color: dragging ? 'var(--primary)' : 'var(--outline)' }}>upload_file</span>
        <p className="file-drop-text">{dragging ? 'שחרר להעלאה' : 'גרור קבצים לכאן, או לחץ לבחירה'}</p>
        <p className="file-drop-hint">מקסימום 10MB לקובץ</p>
        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileInput} />
      </div>

      {sizeError && (
        <div className="file-error">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
          {sizeError}
        </div>
      )}

      {/* Link buttons */}
      <div className="file-link-buttons">
        {LINK_CONFIGS.map(cfg => (
          <button key={cfg.type} className="file-link-btn" style={{ '--link-color': cfg.color } as React.CSSProperties}
            onClick={() => setLinkMode(linkMode === cfg.type ? null : cfg.type)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: cfg.color }}>{cfg.icon}</span>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Link input */}
      {linkMode && (() => {
        const cfg = LINK_CONFIGS.find(c => c.type === linkMode)!;
        return (
          <div className="file-link-form">
            <input className="form-input" placeholder={cfg.placeholder} value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)} dir="ltr" autoFocus />
            <input className="form-input" placeholder="שם לינק (אופציונלי)" value={linkName}
              onChange={e => setLinkName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addLink(linkMode)} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => { setLinkMode(null); setLinkUrl(''); setLinkName(''); }}>ביטול</button>
              <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => addLink(linkMode)} disabled={!linkUrl.trim()}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span> הוסף
              </button>
            </div>
          </div>
        );
      })()}

      {/* Attachments list */}
      {attachments.length === 0 && !linkMode && (
        <div className="chat-empty" style={{ paddingTop: 12 }}>
          <span className="material-symbols-outlined">attach_file</span>
          <p>אין קבצים או לינקים מצורפים</p>
        </div>
      )}

      <div className="attachments-list">
        {attachments.map(att => (
          <div key={att.id} className="attachment-row">
            <div className="attachment-icon" style={{ background: ATTACHMENT_COLORS[att.type] + '18' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: ATTACHMENT_COLORS[att.type] }}>
                {att.type === 'file' ? getMimeIcon(att.mimeType) : ATTACHMENT_ICONS[att.type]}
              </span>
            </div>
            <div className="attachment-info">
              <a className="attachment-name" href={att.url} target="_blank" rel="noreferrer" download={att.type === 'file' ? att.name : undefined}>
                {att.name}
              </a>
              <span className="attachment-meta">
                {att.type === 'file' && att.size ? formatFileSize(att.size) : att.type === 'drive' ? 'Google Drive' : att.type === 'dropbox' ? 'Dropbox' : 'לינק'}
                {' · '}{formatRelativeTime(att.createdAt)}
              </span>
            </div>
            <div className="attachment-actions">
              <a href={att.url} target="_blank" rel="noreferrer" className="attachment-action-btn" title="פתח" download={att.type === 'file' ? att.name : undefined}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{att.type === 'file' ? 'download' : 'open_in_new'}</span>
              </a>
              <button className="attachment-action-btn danger"
                onClick={async () => { const ok = await confirm({ title: 'מחיקת קובץ', message: `האם אתה בטוח שברצונך למחוק את "${att.name}"?`, confirmLabel: 'מחק', danger: true }); if (ok) dispatch({ type: 'DELETE_ATTACHMENT', payload: { taskId: att.taskId, attachmentId: att.id } }); }}
                title="הסר">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

// ── Subtasks Tab ─────────────────────────────────────────────────
function SubtasksTab({ task }: { task: Task }) {
  const { dispatch } = useStore();
  const done = task.subItems.filter(s => s.done).length;
  const pct = task.subItems.length ? Math.round((done / task.subItems.length) * 100) : 0;

  return (
    <div className="task-modal-section" style={{ marginTop: 0 }}>
      {task.subItems.length > 0 && (
        <div className="subtask-progress">
          <div className="subtask-progress-track">
            <div className="subtask-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="subtask-progress-label">{pct}% ({done}/{task.subItems.length})</span>
        </div>
      )}
      {task.subItems.length === 0 && (
        <div className="chat-empty">
          <span className="material-symbols-outlined">checklist</span>
          <p>אין תת-משימות</p>
        </div>
      )}
      <div className="subtask-list">
        {task.subItems.map(sub => (
          <div key={sub.id} className={`subtask-row ${sub.done ? 'done' : ''}`}>
            <input type="checkbox" checked={sub.done}
              onChange={() => dispatch({ type: 'TOGGLE_SUB_ITEM', payload: { taskId: task.id, subItemId: sub.id } })}
              style={{ accentColor: 'var(--primary)', width: 16, height: 16, flexShrink: 0 }} />
            <span className="subtask-title">{sub.title}</span>
          </div>
        ))}
      </div>
      <SubTaskInput taskId={task.id} />
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
      <input className="subtask-add-input" placeholder="+ הוסף תת-משימה..."
        value={title} onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') add(); }} />
    </div>
  );
}
