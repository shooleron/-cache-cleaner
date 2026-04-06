'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { X, Send, Bot, Sparkles, Loader2, Zap, ChevronDown } from 'lucide-react';
import { AIMessage, AIAction } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const QUICK_PROMPTS = [
  'What are the overdue tasks?',
  'Show me the pipeline summary',
  'Which tasks are stuck?',
  'Create a weekly status report',
  'What should I focus on today?',
  'Analyze my deals pipeline',
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
      <Zap size={12} />
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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMsg: AIMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.text,
        createdAt: new Date().toISOString(),
        actions: data.actions || undefined,
      };

      dispatch({ type: 'ADD_AI_MESSAGE', payload: assistantMsg });
    } catch (err) {
      const errorMsg: AIMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: err instanceof Error ? `⚠️ ${err.message}` : '⚠️ Something went wrong. Please check your API key.',
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_AI_MESSAGE', payload: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }

  function executeAction(action: AIAction) {
    if (action.type === 'create_task') {
      const p = action.payload as { title?: string; projectId?: string; priority?: string; status?: string };
      const projectId = p.projectId || state.activeProjectId || state.projects[0]?.id;
      const group = state.groups.find(g => g.projectId === projectId);
      if (projectId && group) {
        dispatch({ type: 'CREATE_TASK', payload: { projectId, groupId: group.id, title: p.title || 'New Task' } });
        dispatch({ type: 'ADD_AI_MESSAGE', payload: {
          id: uuidv4(),
          role: 'assistant',
          content: `✅ Task "${p.title}" has been created!`,
          createdAt: new Date().toISOString(),
        }});
      }
    } else if (action.type === 'create_contact') {
      const p = action.payload as { name?: string; email?: string; company?: string };
      dispatch({ type: 'CREATE_CONTACT', payload: { name: p.name || '', email: p.email || '', company: p.company || '', phone: '', position: '', status: 'prospect', tags: [], notes: '', ownerId: state.currentUser.id } });
      dispatch({ type: 'ADD_AI_MESSAGE', payload: {
        id: uuidv4(),
        role: 'assistant',
        content: `✅ Contact "${p.name}" has been created!`,
        createdAt: new Date().toISOString(),
      }});
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
            <Sparkles size={16} />
          </div>
          <div>
            <div className="ai-panel-name">AI Assistant</div>
            <div className="ai-panel-model">Powered by Claude</div>
          </div>
        </div>
        <div className="ai-panel-header-actions">
          <button
            className="ai-clear-btn"
            onClick={() => { dispatch({ type: 'CLEAR_AI_MESSAGES' }); setShowQuickPrompts(true); }}
            title="Clear conversation"
          >
            Clear
          </button>
          <button className="modal-close" onClick={() => dispatch({ type: 'TOGGLE_AI_PANEL' })}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {state.aiMessages.length === 0 && (
          <div className="ai-welcome">
            <div className="ai-welcome-icon">
              <Bot size={32} />
            </div>
            <h3>Hi, I&apos;m your AI assistant!</h3>
            <p>I can help you manage tasks, analyze your pipeline, create contacts, generate reports, and more.</p>
          </div>
        )}

        {state.aiMessages.map(msg => (
          <div key={msg.id} className={`ai-message ai-message-${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="ai-bubble-icon">
                <Sparkles size={12} />
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
                {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="ai-message ai-message-assistant">
            <div className="ai-bubble-icon">
              <Sparkles size={12} />
            </div>
            <div className="ai-bubble ai-bubble-loading">
              <Loader2 size={16} className="ai-spinner" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {showQuickPrompts && state.aiMessages.length === 0 && (
        <div className="ai-quick-prompts">
          <div className="ai-quick-prompts-label">Try asking:</div>
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
          placeholder="Ask anything about your workspace..."
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
          {isLoading ? <Loader2 size={16} className="ai-spinner" /> : <Send size={16} />}
        </button>
      </div>
      <div className="ai-footer-note">Claude has access to your workspace data</div>
    </div>
  );
}
