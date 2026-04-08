'use client';

import React from 'react';
import { useStore } from '@/lib/store';

const TYPE_ICONS: Record<string, string> = {
  assigned: 'person_add',
  commented: 'chat_bubble',
  status_changed: 'sync',
  due_soon: 'schedule',
  mentioned: 'alternate_email',
  deal_updated: 'payments',
  automation_fired: 'bolt',
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שע׳`;
  const days = Math.floor(hours / 24);
  return `לפני ${days} ימים`;
}

export function NotificationsPanel() {
  const { state, dispatch } = useStore();

  const userNotifications = state.notifications
    .filter(n => n.userId === state.currentUser.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const unreadCount = userNotifications.filter(n => !n.read).length;

  if (!state.notificationsPanelOpen) return null;

  return (
    <>
      <div
        className="panel-backdrop"
        onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' })}
      />
      <div className="notifications-panel">
        {/* Header */}
        <div className="panel-header">
          <div className="panel-title">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
            <span>התראות</span>
            {unreadCount > 0 && (
              <span className="panel-badge">{unreadCount}</span>
            )}
          </div>
          <div className="panel-actions">
            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
                title="סמן הכל כנקרא"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>done_all</span>
                <span>סמן הכל</span>
              </button>
            )}
            <button
              className="modal-close-btn"
              onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' })}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="notifications-list">
          {userNotifications.length === 0 ? (
            <div className="notifications-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--outline)' }}>
                notifications_off
              </span>
              <p>אין התראות חדשות</p>
            </div>
          ) : (
            userNotifications.map(notif => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => {
                  dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id });
                  if (notif.taskId) {
                    dispatch({ type: 'OPEN_TASK_MODAL', payload: notif.taskId });
                    dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' });
                  }
                }}
              >
                <div className="notif-icon-wrap">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {TYPE_ICONS[notif.type] || 'notifications'}
                  </span>
                </div>
                <div className="notif-content">
                  <p className="notif-message">{notif.message}</p>
                  <p className="notif-time">{formatRelativeTime(notif.createdAt)}</p>
                </div>
                {!notif.read && <div className="unread-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
