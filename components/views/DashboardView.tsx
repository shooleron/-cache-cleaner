'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { isAdmin } from '@/lib/permissions';
import { Department } from '@/lib/types';

const DEPT_LABELS: Record<Department, string> = {
  operations: 'תפעול',
  sales: 'מכירות',
  marketing: 'שיווק',
  design: 'עיצוב',
  content: 'תוכן',
  management: 'ניהול',
};

const DEPT_COLORS: Record<Department, string> = {
  operations: '#3b82f6',
  sales: '#10b981',
  marketing: '#f59e0b',
  design: '#8b5cf6',
  content: '#ef4444',
  management: '#6366f1',
};

const STATUS_COLORS: Record<string, string> = {
  todo: '#64748b',
  in_progress: '#3b82f6',
  stuck: '#ef4444',
  done: '#10b981',
  backlog: '#94a3b8',
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'לביצוע',
  in_progress: 'בתהליך',
  stuck: 'תקוע',
  done: 'הושלם',
  backlog: 'בקצה',
};

function ManagerDashboard() {
  const { state, dispatch } = useStore();
  const now = new Date();

  // KPIs
  const activeEvents = state.events.filter(e => e.status === 'active').length;
  const openTasks = state.tasks.filter(t => t.status !== 'done').length;
  const doneTasks = state.tasks.filter(t => t.status === 'done').length;
  const closedDealsValue = state.deals
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + d.value, 0);
  const confirmedSpeakers = state.speakers.filter(s => s.approvalStatus === 'approved').length;
  const overdueTasks = state.tasks.filter(t =>
    t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
  ).length;

  // Projects with progress
  const projectsWithProgress = state.projects.map(p => {
    const tasks = state.tasks.filter(t => t.projectId === p.id);
    const done = tasks.filter(t => t.status === 'done').length;
    const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
    const event = state.events.find(e => e.id === p.eventId);
    return { project: p, tasks, done, pct, event };
  });

  // Team workload (tasks per user)
  const teamLoad = state.users.map(u => {
    const assigned = state.tasks.filter(t => t.assigneeIds.includes(u.id) && t.status !== 'done');
    const done = state.tasks.filter(t => t.assigneeIds.includes(u.id) && t.status === 'done');
    return { user: u, active: assigned.length, done: done.length };
  }).filter(x => x.active + x.done > 0);

  // Tasks by department
  const deptStats = (Object.keys(DEPT_LABELS) as Department[]).map(dept => {
    const tasks = state.tasks.filter(t => t.department === dept);
    const done = tasks.filter(t => t.status === 'done').length;
    return { dept, total: tasks.length, done };
  }).filter(d => d.total > 0);

  // Recent activity
  const recentLogs = state.activityLogs.slice(0, 6);

  const firstName = state.currentUser.name.split(' ')[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'שלום' : 'ערב טוב';

  return (
    <div className="dashboard-view">
      <div className="dashboard-greeting">
        <div>
          <h2 className="dashboard-greeting-title">{greeting}, {firstName}</h2>
          <p className="dashboard-greeting-sub">סקירת ניהול — {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button className="dashboard-greeting-btn" onClick={() => dispatch({ type: 'OPEN_NEW_PROJECT_MODAL' })}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          פרויקט חדש
        </button>
      </div>

      {/* KPI Strip */}
      <div className="mgr-kpi-strip">
        <div className="mgr-kpi-card">
          <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#3b82f6' }}>event</span>
          <div>
            <div className="mgr-kpi-value">{activeEvents}</div>
            <div className="mgr-kpi-label">אירועים פעילים</div>
          </div>
        </div>
        <div className="mgr-kpi-card">
          <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#f59e0b' }}>pending_actions</span>
          <div>
            <div className="mgr-kpi-value">{openTasks}</div>
            <div className="mgr-kpi-label">משימות פתוחות</div>
          </div>
        </div>
        <div className="mgr-kpi-card">
          <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#10b981' }}>check_circle</span>
          <div>
            <div className="mgr-kpi-value">{doneTasks}</div>
            <div className="mgr-kpi-label">משימות הושלמו</div>
          </div>
        </div>
        {overdueTasks > 0 && (
          <div className="mgr-kpi-card" style={{ borderColor: '#fca5a5' }}>
            <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#ef4444' }}>alarm</span>
            <div>
              <div className="mgr-kpi-value" style={{ color: '#ef4444' }}>{overdueTasks}</div>
              <div className="mgr-kpi-label">משימות באיחור</div>
            </div>
          </div>
        )}
        <div className="mgr-kpi-card">
          <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#10b981' }}>payments</span>
          <div>
            <div className="mgr-kpi-value">₪{(closedDealsValue / 1000).toFixed(0)}K</div>
            <div className="mgr-kpi-label">עסקאות סגורות</div>
          </div>
        </div>
        <div className="mgr-kpi-card">
          <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#8b5cf6' }}>mic</span>
          <div>
            <div className="mgr-kpi-value">{confirmedSpeakers}</div>
            <div className="mgr-kpi-label">דוברים מאושרים</div>
          </div>
        </div>
      </div>

      {/* All Events */}
      <div className="mgr-panel" style={{ marginBottom: 20 }}>
        <div className="mgr-panel-header">
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>event</span>
          <h3 className="mgr-panel-title">כל האירועים</h3>
          <button className="emp-see-all-btn" onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'events' })}>
            לכל האירועים <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_left</span>
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '4px 0' }}>
          {state.events.filter(e => e.status !== 'archived').map(event => {
            const brand = state.brands.find(b => b.id === event.brandId);
            const eventProjects = state.projects.filter(p => p.eventId === event.id);
            const eventTasks = state.tasks.filter(t => eventProjects.some(p => p.id === t.projectId));
            const done = eventTasks.filter(t => t.status === 'done').length;
            const pct = eventTasks.length > 0 ? Math.round((done / eventTasks.length) * 100) : 0;
            return (
              <div key={event.id} className="dash-event-card"
                style={{ borderTop: `3px solid ${event.color}` }}
                onClick={() => { dispatch({ type: 'SET_ACTIVE_EVENT', payload: event.id }); dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'events' }); }}>
                <div className="dash-event-card-top">
                  <span style={{ fontSize: 20 }}>{event.icon || '📅'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dash-event-name">{event.name}</div>
                    {brand && <div className="dash-event-brand" style={{ color: brand.color }}>{brand.icon} {brand.name}</div>}
                  </div>
                </div>
                <div className="dash-event-meta">
                  <span><span className="material-symbols-outlined" style={{ fontSize: 12, verticalAlign: 'middle' }}>calendar_today</span> {new Date(event.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}</span>
                  {event.location && <span style={{ color: 'var(--on-surface-variant)', fontSize: 11 }}>{event.location}</span>}
                </div>
                {eventTasks.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--on-surface-variant)', marginBottom: 3 }}>
                      <span>{pct}%</span><span>{done}/{eventTasks.length}</span>
                    </div>
                    <div className="mgr-progress-track" style={{ height: 4 }}>
                      <div className="mgr-progress-fill" style={{ width: `${pct}%`, background: event.color }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {state.events.filter(e => e.status !== 'archived').length === 0 && (
            <div className="mgr-empty">אין אירועים פעילים</div>
          )}
        </div>
      </div>

      <div className="mgr-grid">
        {/* Project Progress */}
        <div className="mgr-panel">
          <div className="mgr-panel-header">
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>folder_open</span>
            <h3 className="mgr-panel-title">התקדמות פרויקטים</h3>
          </div>
          <div className="mgr-projects-list">
            {projectsWithProgress.length === 0 && (
              <div className="mgr-empty">אין פרויקטים פעילים</div>
            )}
            {projectsWithProgress.map(({ project, tasks, done, pct, event }) => (
              <div key={project.id} className="mgr-project-row" onClick={() => {
                dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });
                if (project.eventId) dispatch({ type: 'SET_ACTIVE_EVENT', payload: project.eventId });
                dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'events' });
              }}>
                <div className="mgr-project-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
                    <span className="mgr-project-name">{project.name}</span>
                  </div>
                  <div className="mgr-project-meta">
                    {event && <span className="mgr-project-event-tag">{event.name}</span>}
                    <span className="mgr-project-pct">{pct}%</span>
                  </div>
                </div>
                <div className="mgr-progress-track">
                  <div className="mgr-progress-fill" style={{ width: `${pct}%`, background: project.color }} />
                </div>
                <div className="mgr-project-bottom">
                  <span>{done} / {tasks.length} משימות הושלמו</span>
                  <span className="mgr-task-chips">
                    {tasks.filter(t => t.status === 'stuck').length > 0 && (
                      <span className="mgr-chip stuck">{tasks.filter(t => t.status === 'stuck').length} תקועות</span>
                    )}
                    {tasks.filter(t => t.status === 'in_progress').length > 0 && (
                      <span className="mgr-chip inprog">{tasks.filter(t => t.status === 'in_progress').length} בתהליך</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload */}
        <div className="mgr-panel">
          <div className="mgr-panel-header">
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>group</span>
            <h3 className="mgr-panel-title">עומס צוות</h3>
          </div>
          <div className="mgr-team-list">
            {state.users.map(u => {
              const active = state.tasks.filter(t => t.assigneeIds.includes(u.id) && t.status !== 'done');
              const done = state.tasks.filter(t => t.assigneeIds.includes(u.id) && t.status === 'done').length;
              const stuck = active.filter(t => t.status === 'stuck').length;
              const total = active.length + done;
              if (total === 0) return null;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={u.id} className="mgr-team-row">
                  <div className="mgr-team-avatar" style={{ background: u.color }}>{u.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div className="mgr-team-top">
                      <span className="mgr-team-name">{u.name}</span>
                      <span className="mgr-team-dept" style={{ color: u.department ? DEPT_COLORS[u.department] : '#94a3b8' }}>
                        {u.department ? DEPT_LABELS[u.department] : ''}
                      </span>
                    </div>
                    <div className="mgr-progress-track" style={{ marginTop: 4 }}>
                      <div className="mgr-progress-fill" style={{ width: `${pct}%`, background: '#10b981' }} />
                    </div>
                    <div className="mgr-team-bottom">
                      <span>{active.length} פעילות</span>
                      {stuck > 0 && <span className="mgr-chip stuck">{stuck} תקועות</span>}
                      <span style={{ marginRight: 'auto' }}>{pct}% הושלם</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {teamLoad.length === 0 && <div className="mgr-empty">אין נתוני עומס</div>}
          </div>
        </div>

        {/* Department breakdown */}
        {deptStats.length > 0 && (
          <div className="mgr-panel">
            <div className="mgr-panel-header">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>bar_chart</span>
              <h3 className="mgr-panel-title">התקדמות לפי מחלקה</h3>
            </div>
            <div className="mgr-dept-list">
              {deptStats.map(({ dept, total, done }) => {
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={dept} className="mgr-dept-row">
                    <span className="mgr-dept-label" style={{ color: DEPT_COLORS[dept] }}>{DEPT_LABELS[dept]}</span>
                    <div className="mgr-progress-track" style={{ flex: 1 }}>
                      <div className="mgr-progress-fill" style={{ width: `${pct}%`, background: DEPT_COLORS[dept] }} />
                    </div>
                    <span className="mgr-dept-stat">{done}/{total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mgr-panel">
          <div className="mgr-panel-header">
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>history</span>
            <h3 className="mgr-panel-title">פעילות אחרונה</h3>
          </div>
          <div className="mgr-activity-list">
            {recentLogs.length === 0 && <div className="mgr-empty">אין פעילות להצגה</div>}
            {recentLogs.map(log => {
              const user = state.users.find(u => u.id === log.userId);
              return (
                <div key={log.id} className="mgr-activity-row">
                  <div className="mgr-activity-avatar" style={{ background: user?.color || '#94a3b8' }}>
                    {user?.avatar || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mgr-activity-label">{log.label}</div>
                    <div className="mgr-activity-time">
                      {new Date(log.createdAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = React.useState<'overview' | 'tasks'>('overview');
  const me = state.currentUser;
  const now = new Date();

  const myTasks = state.tasks
    .filter(t => t.assigneeIds.includes(me.id))
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const openTasks = myTasks.filter(t => t.status !== 'done');
  const doneTasks = myTasks.filter(t => t.status === 'done');
  const overdue = openTasks.filter(t => t.dueDate && new Date(t.dueDate) < now);
  const pct = myTasks.length > 0 ? Math.round((doneTasks.length / myTasks.length) * 100) : 0;

  const firstName = me.name.split(' ')[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'שלום' : 'ערב טוב';

  return (
    <div className="dashboard-view">
      <div className="dashboard-greeting">
        <div>
          <h2 className="dashboard-greeting-title">{greeting}, {firstName}</h2>
          <p className="dashboard-greeting-sub">
            {me.department ? DEPT_LABELS[me.department] : ''} — {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="emp-dash-tabs">
        <button className={`emp-dash-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
          סקירה
        </button>
        <button className={`emp-dash-tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>task_alt</span>
          המשימות שלי
          {openTasks.length > 0 && <span className="emp-dash-tab-count">{openTasks.length}</span>}
        </button>
      </div>

      {tab === 'overview' && (
        <>
          {/* Personal KPIs */}
          <div className="mgr-kpi-strip">
            <div className="mgr-kpi-card">
              <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#3b82f6' }}>pending_actions</span>
              <div>
                <div className="mgr-kpi-value">{openTasks.length}</div>
                <div className="mgr-kpi-label">משימות פתוחות</div>
              </div>
            </div>
            <div className="mgr-kpi-card">
              <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#10b981' }}>check_circle</span>
              <div>
                <div className="mgr-kpi-value">{doneTasks.length}</div>
                <div className="mgr-kpi-label">הושלמו</div>
              </div>
            </div>
            {overdue.length > 0 && (
              <div className="mgr-kpi-card" style={{ borderColor: '#fca5a5' }}>
                <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#ef4444' }}>alarm</span>
                <div>
                  <div className="mgr-kpi-value" style={{ color: '#ef4444' }}>{overdue.length}</div>
                  <div className="mgr-kpi-label">באיחור</div>
                </div>
              </div>
            )}
            <div className="mgr-kpi-card">
              <span className="material-symbols-outlined mgr-kpi-icon" style={{ color: '#8b5cf6' }}>donut_large</span>
              <div>
                <div className="mgr-kpi-value">{pct}%</div>
                <div className="mgr-kpi-label">השלמה כללית</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="emp-overall-progress">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>התקדמות כוללת</span>
              <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{doneTasks.length} מתוך {myTasks.length} משימות</span>
            </div>
            <div className="mgr-progress-track" style={{ height: 10 }}>
              <div className="mgr-progress-fill" style={{ width: `${pct}%`, background: 'var(--primary)', borderRadius: 5 }} />
            </div>
          </div>

          {/* Upcoming tasks preview */}
          <div className="emp-tasks-section">
            <div className="mgr-panel-header" style={{ marginBottom: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>upcoming</span>
              <h3 className="mgr-panel-title">הקרובות ביותר</h3>
              <button className="emp-see-all-btn" onClick={() => setTab('tasks')}>
                הצג הכל
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_left</span>
              </button>
            </div>
            {openTasks.slice(0, 5).map(task => {
              const project = state.projects.find(p => p.id === task.projectId);
              const isOverdue = task.dueDate && new Date(task.dueDate) < now;
              const isDueSoon = task.dueDate && !isOverdue && (new Date(task.dueDate).getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000;
              return (
                <div key={task.id} className="emp-task-row" onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}>
                  <div className="emp-task-status-dot" style={{ background: STATUS_COLORS[task.status] }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="emp-task-title">{task.title}</div>
                    <div className="emp-task-meta">
                      {project && <span className="emp-task-project">{project.name}</span>}
                      {task.department && <span className="emp-task-dept" style={{ color: DEPT_COLORS[task.department] }}>{DEPT_LABELS[task.department]}</span>}
                      {task.recurring && <span className="emp-task-recurring"><span className="material-symbols-outlined" style={{ fontSize: 11 }}>repeat</span>{task.recurringInterval === 'weekly' ? 'שבועי' : task.recurringInterval === 'monthly' ? 'חודשי' : 'יומי'}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className="emp-task-status-badge" style={{ background: STATUS_COLORS[task.status] + '22', color: STATUS_COLORS[task.status] }}>{STATUS_LABELS[task.status]}</span>
                    {task.dueDate && <span className="emp-task-due" style={{ color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : 'var(--on-surface-variant)' }}><span className="material-symbols-outlined" style={{ fontSize: 11 }}>schedule</span>{new Date(task.dueDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
              );
            })}
            {openTasks.length === 0 && <div className="mgr-empty" style={{ padding: 32 }}>🎉 כל המשימות הושלמו!</div>}
          </div>
        </>
      )}

      {tab === 'tasks' && (
        <div className="emp-tasks-section">
          <div className="mgr-panel-header" style={{ marginBottom: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>checklist</span>
            <h3 className="mgr-panel-title">כל המשימות שלי</h3>
            <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginRight: 'auto' }}>{openTasks.length} פתוחות · {doneTasks.length} הושלמו</span>
          </div>
          {myTasks.length === 0 && <div className="mgr-empty" style={{ padding: 32 }}>אין משימות מוקצות אליך</div>}
          {myTasks.map(task => {
            const project = state.projects.find(p => p.id === task.projectId);
            const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
            const isDueSoon = task.dueDate && !isOverdue && task.status !== 'done' && (new Date(task.dueDate).getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000;
            return (
              <div key={task.id} className="emp-task-row" onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
                style={{ opacity: task.status === 'done' ? 0.55 : 1 }}>
                <div className="emp-task-status-dot" style={{ background: STATUS_COLORS[task.status] }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="emp-task-title" style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</div>
                  <div className="emp-task-meta">
                    {project && <span className="emp-task-project">{project.name}</span>}
                    {task.department && <span className="emp-task-dept" style={{ color: DEPT_COLORS[task.department] }}>{DEPT_LABELS[task.department]}</span>}
                    {task.recurring && <span className="emp-task-recurring"><span className="material-symbols-outlined" style={{ fontSize: 11 }}>repeat</span>{task.recurringInterval === 'weekly' ? 'שבועי' : 'חודשי'}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span className="emp-task-status-badge" style={{ background: STATUS_COLORS[task.status] + '22', color: STATUS_COLORS[task.status] }}>{STATUS_LABELS[task.status]}</span>
                  {task.dueDate && <span className="emp-task-due" style={{ color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : 'var(--on-surface-variant)' }}><span className="material-symbols-outlined" style={{ fontSize: 11 }}>schedule</span>{new Date(task.dueDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardView() {
  const { state } = useStore();
  const admin = isAdmin(state.currentUser);
  return admin ? <ManagerDashboard /> : <EmployeeDashboard />;
}
