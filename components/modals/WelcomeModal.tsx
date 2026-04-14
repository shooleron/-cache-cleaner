'use client';

import React from 'react';
import { useStore } from '@/lib/store';

export function WelcomeModal() {
  const { state, dispatch } = useStore();
  if (!state.welcomeTaskId) return null;

  const task = state.tasks.find(t => t.id === state.welcomeTaskId);
  const project = task ? state.projects.find(p => p.id === task.projectId) : null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <div className="welcome-emoji">👋</div>
        <h2 className="welcome-title">ברוך הבא למשימה!</h2>
        <p className="welcome-task-name">{task?.title || 'משימה חדשה'}</p>
        {project && (
          <p className="welcome-project">
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle' }}>folder</span>
            {' '}{project.name}
          </p>
        )}
        <p className="welcome-message">
          שויכת למשימה זו. אנחנו סומכים עליך — בהצלחה! 💪
        </p>
        <div className="welcome-actions">
          <button
            className="btn-primary"
            onClick={() => {
              dispatch({ type: 'DISMISS_WELCOME' });
              if (task) dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id });
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
            פתח משימה
          </button>
          <button
            className="btn-ghost"
            onClick={() => dispatch({ type: 'DISMISS_WELCOME' })}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
