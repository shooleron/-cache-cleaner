'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { AIMessage, AIAction } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const QUICK_PROMPTS = [
  'מה המשימות שחלפו את המועד שלהן?',
  'תן לי סיכום של הפייפליין',
  'אילו משימות תקועות?',
  'צור דוח סטטוס שבועי',
  'על מה כדאי לי להתמקד היום?',
  'נתח את עסקאות המכירה',
];

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^## (.*)/gm, '<h3>$1</h3>')
    .replace(/^# (.*)/gm, '<h2>$1</h2>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n/g, '<br/>');
}

function ActionButton({ action, onExecute }: { action: AIAction; onExecute: (action: AIAction) => void }) {
  return (
    <button className="ai-action-btn" onClick={() => onExecute(action)}>
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>bolt</span>
      {action.label}
    </button>
  );
}

export function AIAgentPanel() {
  const { state, dispatch } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.aiMessages]);

  async function sendMessage(text?: string) {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    setInput('');
    setShowQuickPrompts(false);

    const userMsg: AIMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_AI_MESSAGE', payload: userMsg });
    setIsLoading(true);

    try {
      const messages = [
        ...state.aiMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content },
      ];

      const context = {
        projects: state.projects,
        tasks: state.tasks,
        deals: state.deals,
        contacts: state.contacts,
        users: state.users,
      };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'שגיאה בקבלת תגובה');

      dispatch({ type: 'ADD_AI_MESSAGE', payload: {
        id: uuidv4(),
        role: 'assistant',
        content: data.text,
        createdAt: new Date().toISOString(),
        actions: data.actions || undefined,
      }});
    } catch (err) {
      dispatch({ type: 'ADD_AI_MESSAGE', payload: {
        id: uuidv4(),
        role: 'assistant',
        content: err instanceof Error ? `⚠️ ${err.message}` : '⚠️ שגיאה. בדוק את הגדרות ה-API.',
        createdAt: new Date().toISOString(),
      }});
    } finally {
      setIsLoading(false);
    }
  }

  function executeAction(action: AIAction) {
    if (action.type === 'create_task') {
      const p = action.payload as { title?: string; projectId?: string };
      const projectId = p.projectId || state.activeProjectId || state.projects[0]?.id;
      const group = state.groups.find(g => g.projectId === projectId);
      if (projectId && group) {
        dispatch({ type: 'CREATE_TASK', payload: { projectId, groupId: group.id, title: p.title || 'משימה חדשה' } });
        dispatch({ type: 'ADD_AI_MESSAGE', payload: { id: uuidv4(), role: 'assistant', content: `✅ משימה "${p.title}" נוצר!`, createdAt: new Date().toISOString() }});
      }
    } else if (action.type === 'create_contact') {
      const p = action.payload as { name?: string; email?: string; company?: string };
      dispatch({ type: 'CREATE_CONTACT', payload: { name: p.name || '', email: p.email || '', company: p.company || '', phone: '', position: '', status: 'prospect', contactType: 'other', tags: [], notes: '', ownerId: state.currentUser.id } });
      dispatch({ type: 'ADD_AI_MESSAGE', payload: { id: uuidv4(), role: 'assistant', content: `✅ איש קשר "${p.name}" נוצר!`, createdAt: new Date().toISOString() }});
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!state.aiPanelOpen) return null;

  return (
    <div className="ai-panel">
      {/* Header */}
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <div className="ai-panel-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
          </div>
          <div>
            <div className="ai-panel-name">AI אסיסטנט</div>
            <div className="ai-panel-model">מופעל על ידי Claude</div>
          </div>
        </div>
        <div className="ai-panel-header-actions">
          <button
            className="ai-clear-btn"
            onClick={() => { dispatch({ type: 'CLEAR_AI_MESSAGES' }); setShowQuickPrompts(true); }}
            title="נקה שיחה"
          >
            נקה
          </button>
          <button className="modal-close-btn" onClick={() => dispatch({ type: 'TOGGLE_AI_PANEL' })}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {state.aiMessages.length === 0 && (
          <div className="ai-welcome">
            <div className="ai-welcome-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>smart_toy</span>
            </div>
            <h3>שלום, אני האסיסטנט שלך!</h3>
            <p>אני יכול לעזור לך לנהל משימות, לנתח את הפייפליין, ליצור אנשי קשר, ועוד.</p>
          </div>
        )}

        {state.aiMessages.map(msg => (
          <div key={msg.id} className={`ai-message ai-message-${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="ai-bubble-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>auto_awesome</span>
              </div>
            )}
            <div className="ai-bubble">
              <div
                className="ai-bubble-text"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
              />
              {msg.actions && msg.actions.length > 0 && (
                <div className="ai-actions">
                  {msg.actions.map((action, i) => (
                    <ActionButton key={i} action={action} onExecute={executeAction} />
                  ))}
                </div>
              )}
              <div className="ai-bubble-time">
                {new Date(msg.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="ai-message ai-message-assistant">
            <div className="ai-bubble-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>auto_awesome</span>
            </div>
            <div className="ai-bubble ai-bubble-loading">
              <span className="material-symbols-outlined ai-spinner" style={{ fontSize: 18 }}>progress_activity</span>
              <span>חושב...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {showQuickPrompts && state.aiMessages.length === 0 && (
        <div className="ai-quick-prompts">
          <div className="ai-quick-prompts-label">נסה לשאול:</div>
          <div className="ai-quick-prompts-grid">
            {QUICK_PROMPTS.map(prompt => (
              <button key={prompt} className="ai-quick-prompt-btn" onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="ai-input-area">
        <textarea
          ref={inputRef}
          className="ai-input"
          placeholder="שאל כל שאלה על סביבת העבודה שלך..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        <button
          className={`ai-send-btn ${input.trim() && !isLoading ? 'active' : ''}`}
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {isLoading ? 'progress_activity' : 'send'}
          </span>
        </button>
      </div>
      <div className="ai-footer-note">Claude ניגש לנתוני סביבת העבודה שלך</div>
    </div>
  );
}
