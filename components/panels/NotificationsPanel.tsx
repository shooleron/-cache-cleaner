'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { X, Bell, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_ICONS: Record<string, string> = {
  assigned: '👤',
  commented: '💬',
  status_changed: '🔄',
  due_soon: '⚠️',
  mentioned: '@',
};

export function NotificationsPanel() {
  const { state, dispatch } = useStore();

  const userNotifications = state.notifications
    .filter(n => n.userId === state.currentUser.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const unreadCount = userNotifications.filter(n => !n.read).length;

  if (!state.notificationsPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="panel-backdrop"
        onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' })}
      />

      {/* Panel */}
      <div className="notifications-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Bell size={16} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="panel-badge">{unreadCount}</span>
            )}
          </div>
          <div className="panel-actions">
            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
            <button
              className="modal-close-btn"
              onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS_PANEL' })}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="notifications-list">
          {userNotifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell size={32} strokeWidth={1} />
              <p>No notifications yet</p>
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
                <div className="notif-icon">{TYPE_ICONS[notif.type] || '🔔'}</div>
                <div className="notif-content">
                  <p className="notif-message">{notif.message}</p>
                  <p className="notif-time">
                    {format(new Date(notif.createdAt), 'MMM d, HH:mm')}
                  </p>
                </div>
                {!notif.read && (
                  <div className="unread-dot" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
