'use client';

import React from 'react';
import { useStore } from '@/lib/store';

export function DashboardView() {
  const { state, dispatch } = useStore();

  const overdueTasks = state.tasks.filter(t =>
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length;
  const activeProjects = state.projects.length;

  return (
    <div className="dashboard-view">
      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-bg-circle" />
          <p className="kpi-label">פרויקטים פעילים</p>
          <h3 className="kpi-value primary">{String(activeProjects).padStart(2, '0')}</h3>
          <div className="kpi-badge up">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
            <span>12% מעל החודש הקודם</span>
          </div>
        </div>

        <div className="kpi-card">
          <p className="kpi-label">משימות דחופות</p>
          <h3 className="kpi-value error">{String(overdueTasks).padStart(2, '0')}</h3>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 8 }}>נדרש טיפול מיידי</p>
        </div>

        <div className="kpi-card">
          <p className="kpi-label">זמן ביצוע ממוצע</p>
          <h3 className="kpi-value neutral">4.2d</h3>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 8 }}>שיפור של 0.5 ימים</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Timeline + gallery */}
        <div>
          <div className="section-header">
            <h2 className="section-title">לו&quot;ז תפעולי מרכזי</h2>
            <div className="section-tabs">
              <button className="section-tab">שבועי</button>
              <button className="section-tab active">חודשי</button>
            </div>
          </div>

          <div className="timeline-card">
            <div className="timeline-header">
              <span className="timeline-header-cell">פרויקט / שלב</span>
              <span className="timeline-header-cell">התקדמות</span>
              <span className="timeline-header-cell">תאריך יעד</span>
            </div>

            {state.projects.slice(0, 4).map((project, i) => {
              const projectTasks = state.tasks.filter(t => t.projectId === project.id);
              const done = projectTasks.filter(t => t.status === 'done').length;
              const pct = projectTasks.length > 0
                ? Math.round((done / projectTasks.length) * 100)
                : [75, 40, 95, 60][i % 4];
              const colors = ['var(--primary)', 'var(--tertiary-container)', '#059669', '#f59e0b'];
              const color = colors[i % 4];
              const dates = ['12 אוק׳, 2025', '28 אוק׳, 2025', '02 נוב׳, 2025', '15 נוב׳, 2025'];

              return (
                <div key={project.id} className="timeline-row">
                  <div>
                    <div className="timeline-task-name">{project.name}</div>
                    <div className="timeline-task-sub">{project.description || 'ניהול ותפעול'}</div>
                  </div>
                  <div className="timeline-progress-wrap">
                    <div className="timeline-progress-track">
                      <div className="timeline-progress-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <div className="timeline-date">
                    <span>{dates[i]}</span>
                    <div className="timeline-dot" style={{ background: color }} />
                  </div>
                </div>
              );
            })}

            {state.projects.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 13 }}>
                אין פרויקטים פעילים
              </div>
            )}
          </div>

          <div className="gallery-grid">
            <div className="gallery-item" style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' }}>
              <div className="gallery-item-overlay">
                <span className="gallery-item-label">ישיבת צוות - 09:00</span>
              </div>
            </div>
            <div className="gallery-item" style={{ background: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)' }}>
              <div className="gallery-item-overlay">
                <span className="gallery-item-label">סיור מלאי תקופתי</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks + AI */}
        <div>
          <div className="section-header">
            <h2 className="section-title">משימות לביצוע</h2>
            <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', cursor: 'pointer' }}>filter_list</span>
          </div>

          <div className="tasks-sidebar">
            {state.tasks.filter(t => t.status !== 'done').slice(0, 3).map((task, i) => {
              const types = ['urgent', 'in-progress', 'waiting'] as const;
              const labels = ['דחוף', 'בתהליך', 'ממתין'];
              const type = types[i % 3];
              const assigneeId = task.assigneeIds?.[0];
              const assignee = state.users.find(u => u.id === assigneeId);

              return (
                <div
                  key={task.id}
                  className={`task-card ${type}`}
                  onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
                >
                  <div className="task-card-top">
                    <span className={`task-badge ${type}`}>{labels[i % 3]}</span>
                    <input type="checkbox" style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} onClick={e => e.stopPropagation()} />
                  </div>
                  <div className="task-card-title">{task.title}</div>
                  <div className="task-card-desc">{task.description || 'אין תיאור נוסף'}</div>
                  <div className="task-card-footer">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{assignee ? 'person' : 'schedule'}</span>
                    <span>
                      {assignee ? `הוקצה ל: ${assignee.name}` : task.dueDate ? `עד ${new Date(task.dueDate).toLocaleDateString('he-IL')}` : 'ללא תאריך יעד'}
                    </span>
                  </div>
                </div>
              );
            })}

            {state.tasks.filter(t => t.status !== 'done').length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 13 }}>אין משימות פעילות</div>
            )}

            <button className="task-add-btn">+ הוספת משימה חדשה</button>
          </div>

          <div className="ai-insight-card">
            <span className="material-symbols-outlined ai-insight-icon">bolt</span>
            <div className="ai-insight-title">תובנת AI תפעולית</div>
            <p className="ai-insight-text">
              זיהינו עיכוב פוטנציאלי בשרשרת האספקה. מומלץ להסיט משאבים ממשימות ממתינות כדי לעמוד בלו&quot;ז.
            </p>
            <button className="ai-insight-btn" onClick={() => dispatch({ type: 'TOGGLE_AI_PANEL' })}>
              בצע אופטימיזציה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
