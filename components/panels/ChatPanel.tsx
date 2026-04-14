'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'היום';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'אתמול';
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}

export function ChatPanel() {
  const { state, dispatch } = useStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUsers = state.users.filter(u => u.id !== state.currentUser.id);

  const getConversation = (userId: string) =>
    state.chats.find(c =>
      c.participantIds.includes(state.currentUser.id) && c.participantIds.includes(userId)
    );

  const activeUser = state.activeChatUserId
    ? state.users.find(u => u.id === state.activeChatUserId)
    : null;

  const activeConv = state.activeChatUserId ? getConversation(state.activeChatUserId) : null;

  // Count unread per user
  const unreadFor = (userId: string) => {
    const conv = getConversation(userId);
    if (!conv) return 0;
    return conv.messages.filter(m => m.fromUserId !== state.currentUser.id && !m.readByIds.includes(state.currentUser.id)).length;
  };

  // Mark read when conversation opens
  useEffect(() => {
    if (activeConv) {
      dispatch({ type: 'MARK_CHAT_READ', payload: { conversationId: activeConv.id } });
    }
  }, [activeConv?.id, activeConv?.messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages.length]);

  useEffect(() => {
    if (state.activeChatUserId) inputRef.current?.focus();
  }, [state.activeChatUserId]);

  const sendMessage = () => {
    if (!inputText.trim() || !state.activeChatUserId) return;
    dispatch({ type: 'SEND_CHAT_MESSAGE', payload: { toUserId: state.activeChatUserId, text: inputText.trim() } });
    setInputText('');
  };

  const getLastMessage = (userId: string) => {
    const conv = getConversation(userId);
    if (!conv || conv.messages.length === 0) return null;
    return conv.messages[conv.messages.length - 1];
  };

  if (!state.chatPanelOpen) return null;

  return (
    <>
      <div className="panel-backdrop" onClick={() => dispatch({ type: 'TOGGLE_CHAT_PANEL' })} />
      <div className="chat-panel">
        {/* Panel Header */}
        <div className="chat-panel-header">
          {activeUser ? (
            <>
              <button className="chat-back-btn" onClick={() => dispatch({ type: 'CLOSE_CHAT_CONVERSATION' })}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
              <div className="chat-avatar" style={{ background: activeUser.color }}>{activeUser.avatar}</div>
              <div className="chat-panel-user-info">
                <span className="chat-panel-user-name">{activeUser.name}</span>
                <span className="chat-panel-user-title">{activeUser.jobTitle}</span>
              </div>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>chat</span>
              <span className="chat-panel-title">צ׳אט פנימי</span>
            </>
          )}
          <button className="modal-close-btn" style={{ marginRight: 'auto' }} onClick={() => dispatch({ type: 'TOGGLE_CHAT_PANEL' })}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* User list or conversation */}
        {!activeUser ? (
          <div className="chat-user-list">
            {otherUsers.map(user => {
              const lastMsg = getLastMessage(user.id);
              const unread = unreadFor(user.id);
              return (
                <div
                  key={user.id}
                  className="chat-user-item"
                  onClick={() => dispatch({ type: 'OPEN_CHAT', payload: user.id })}
                >
                  <div className="chat-avatar" style={{ background: user.color }}>{user.avatar}</div>
                  <div className="chat-user-item-info">
                    <div className="chat-user-item-name">{user.name}</div>
                    {lastMsg ? (
                      <div className="chat-user-item-preview">
                        {lastMsg.fromUserId === state.currentUser.id ? 'את: ' : ''}
                        {lastMsg.text.length > 35 ? lastMsg.text.slice(0, 35) + '…' : lastMsg.text}
                      </div>
                    ) : (
                      <div className="chat-user-item-preview" style={{ color: 'var(--outline)' }}>לחץ לפתיחת שיחה</div>
                    )}
                  </div>
                  <div className="chat-user-item-meta">
                    {lastMsg && <span className="chat-user-item-time">{formatTime(lastMsg.createdAt)}</span>}
                    {unread > 0 && <span className="chat-unread-badge">{unread}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="chat-conversation">
            <div className="chat-messages">
              {(!activeConv || activeConv.messages.length === 0) ? (
                <div className="chat-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline)' }}>chat_bubble</span>
                  <p>שלח הודעה ראשונה ל{activeUser.name}</p>
                </div>
              ) : (
                (() => {
                  let lastDate = '';
                  return activeConv.messages.map(msg => {
                    const isMine = msg.fromUserId === state.currentUser.id;
                    const sender = state.users.find(u => u.id === msg.fromUserId);
                    const msgDate = formatDate(msg.createdAt);
                    const showDate = msgDate !== lastDate;
                    if (showDate) lastDate = msgDate;
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="chat-date-separator"><span>{msgDate}</span></div>
                        )}
                        <div className={`chat-message ${isMine ? 'mine' : 'theirs'}`}>
                          {!isMine && (
                            <div className="chat-msg-avatar" style={{ background: sender?.color }}>{sender?.avatar}</div>
                          )}
                          <div className="chat-bubble">
                            <p className="chat-bubble-text">{msg.text}</p>
                            <span className="chat-bubble-time">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-row">
              <input
                ref={inputRef}
                className="chat-input"
                placeholder={`כתוב הודעה ל${activeUser.name}...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <button
                className="chat-send-btn"
                onClick={sendMessage}
                disabled={!inputText.trim()}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
