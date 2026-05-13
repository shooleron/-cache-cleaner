'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Task } from '@/lib/types';

type CalView = 'day' | 'week' | 'month' | 'year';

const STATUS_COLORS: Record<string, string> = {
  todo: '#fdab3d',
  in_progress: '#0073ea',
  stuck: '#e2445c',
  done: '#00c875',
  backlog: '#c5c7d4',
};

const DAYS_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const DAYS_FULL_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00–22:00

// Mock personal calendar events (shown when sync is on)
const PERSONAL_EVENTS = [
  { id: 'pe-1', title: 'ישיבת צוות שבועית', dayOfWeek: 1, hour: 9, color: '#4caf50' },
  { id: 'pe-2', title: 'ארוחת צהרים עם לקוח', dayOfWeek: 3, hour: 13, color: '#ff9800' },
  { id: 'pe-3', title: 'הדרכה חודשית', dayOfWeek: 2, hour: 11, color: '#9c27b0' },
  { id: 'pe-4', title: 'סיכום שבועי', dayOfWeek: 4, hour: 16, color: '#0073ea' },
];

function dateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function CalendarView() {
  const { state, dispatch } = useStore();
  const today = new Date();
  const [calView, setCalView] = useState<CalView>('month');
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [syncPersonal, setSyncPersonal] = useState(false);

  const projectTasks = state.tasks.filter(t => t.projectId === state.activeProjectId);

  function getTasksForDate(ds: string): Task[] {
    return projectTasks.filter(t => t.dueDate === ds || t.startDate === ds);
  }

  function navigate(delta: number) {
    const d = new Date(viewDate);
    if (calView === 'day') d.setDate(d.getDate() + delta);
    else if (calView === 'week') d.setDate(d.getDate() + delta * 7);
    else if (calView === 'month') d.setMonth(d.getMonth() + delta);
    else d.setFullYear(d.getFullYear() + delta);
    setViewDate(d);
  }

  function goToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  }

  function headerTitle(): string {
    if (calView === 'day') {
      return `${DAYS_FULL_HE[viewDate.getDay()]}, ${viewDate.getDate()} ${MONTHS_HE[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    } else if (calView === 'week') {
      const ws = getWeekStart(viewDate);
      const we = new Date(ws); we.setDate(ws.getDate() + 6);
      if (ws.getMonth() === we.getMonth()) return `${ws.getDate()}–${we.getDate()} ${MONTHS_HE[ws.getMonth()]} ${ws.getFullYear()}`;
      return `${ws.getDate()} ${MONTHS_HE[ws.getMonth()]} – ${we.getDate()} ${MONTHS_HE[we.getMonth()]} ${ws.getFullYear()}`;
    } else if (calView === 'month') {
      return `${MONTHS_HE[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    } else {
      return `${viewDate.getFullYear()}`;
    }
  }

  // ── MONTH VIEW ──
  function renderMonth() {
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const cells: { day: number; month: number; year: number; current: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      cells.push({ day: daysInPrev - i, month: pm, year: py, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month, year, current: true });
    const nm = month === 11 ? 0 : month + 1, ny = month === 11 ? year + 1 : year;
    for (let d = 1; d <= 42 - cells.length; d++) cells.push({ day: d, month: nm, year: ny, current: false });

    const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

    return (
      <div className="calendar-layout">
        <div className="calendar-main">
          <div className="calendar-grid-header">
            {DAYS_HE.map(d => <div key={d} className="cal-day-header">{d}</div>)}
          </div>
          <div className="calendar-grid">
            {cells.map((cell, idx) => {
              const tasks = getTasksForDate(dateStr(cell.year, cell.month, cell.day));
              const ds = dateStr(cell.year, cell.month, cell.day);
              const isToday = cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear();
              const isSelected = selectedDate === ds;
              return (
                <div
                  key={idx}
                  className={`cal-cell ${!cell.current ? 'cal-cell-other' : ''} ${isToday ? 'cal-cell-today' : ''} ${isSelected ? 'cal-cell-selected' : ''}`}
                  onClick={() => { setSelectedDate(isSelected ? null : ds); if (!cell.current) { setViewDate(new Date(cell.year, cell.month, cell.day)); } }}
                >
                  <div className="cal-cell-day">{cell.day}</div>
                  <div className="cal-cell-tasks">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="cal-task-chip"
                        style={{ background: STATUS_COLORS[task.status] + '22', borderRight: `3px solid ${STATUS_COLORS[task.status]}`, color: STATUS_COLORS[task.status] }}
                        onClick={e => { e.stopPropagation(); dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id }); }}>
                        {task.title}
                      </div>
                    ))}
                    {tasks.length > 3 && <div className="cal-task-more">+{tasks.length - 3}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="calendar-side">
          <h3 className="cal-side-title">
            {selectedDate
              ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', month: 'long', day: 'numeric' })
              : 'בחר יום'}
          </h3>
          {selectedDate && selectedTasks.length === 0 && <div className="cal-empty">אין משימות ביום זה</div>}
          <div className="cal-side-tasks">
            {selectedTasks.map(task => {
              const assignees = task.assigneeIds.map(id => state.users.find(u => u.id === id)).filter(Boolean);
              return (
                <div key={task.id} className="cal-side-task" onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}>
                  <div className="cal-side-task-header">
                    <div className="cal-task-status-dot" style={{ background: STATUS_COLORS[task.status] }} />
                    <div className="cal-side-task-title">{task.title}</div>
                  </div>
                  <div className="cal-side-task-meta">
                    <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                    <div className="cal-side-task-assignees">
                      {assignees.map(u => u && <div key={u.id} className="cal-mini-avatar" style={{ background: u.color }} title={u.name}>{u.avatar}</div>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cal-side-divider" />
          <h4 className="cal-side-month-title">סיכום חודש</h4>
          <div className="cal-month-stats">
            <div className="cal-month-stat">
              <div className="cal-month-stat-val" style={{ color: '#00c875' }}>
                {projectTasks.filter(t => t.dueDate?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}
              </div>
              <div className="cal-month-stat-label">יעד הגשה החודש</div>
            </div>
            <div className="cal-month-stat">
              <div className="cal-month-stat-val" style={{ color: '#0073ea' }}>
                {projectTasks.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="cal-month-stat-label">בתהליך</div>
            </div>
            <div className="cal-month-stat">
              <div className="cal-month-stat-val" style={{ color: '#e2445c' }}>
                {projectTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'done').length}
              </div>
              <div className="cal-month-stat-label">באיחור</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DAY VIEW ──
  function renderDay() {
    const ds = dateStr(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate());
    const dayTasks = getTasksForDate(ds);
    const personalToday = syncPersonal
      ? PERSONAL_EVENTS.filter(e => e.dayOfWeek === viewDate.getDay())
      : [];

    return (
      <div className="cal-time-grid">
        {HOURS.map(hour => {
          const tasks = dayTasks.filter((_, i) => i % HOURS.length === (hour - 7) % dayTasks.length);
          const personal = personalToday.filter(e => e.hour === hour);
          return (
            <div key={hour} className="cal-time-row">
              <div className="cal-time-label">{String(hour).padStart(2, '0')}:00</div>
              <div className="cal-time-cell">
                {personal.map(e => (
                  <div key={e.id} className="cal-event-block cal-event-personal" style={{ borderRight: `3px solid ${e.color}`, background: e.color + '18' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>person</span>
                    {e.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {dayTasks.length > 0 && (
          <div className="cal-day-task-list">
            <div className="cal-day-task-list-title">משימות היום</div>
            {dayTasks.map(task => (
              <div key={task.id} className="cal-side-task" onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}>
                <div className="cal-side-task-header">
                  <div className="cal-task-status-dot" style={{ background: STATUS_COLORS[task.status] }} />
                  <div className="cal-side-task-title">{task.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {dayTasks.length === 0 && personalToday.length === 0 && (
          <div className="cal-empty" style={{ padding: '40px 0' }}>אין אירועים ביום זה</div>
        )}
      </div>
    );
  }

  // ── WEEK VIEW ──
  function renderWeek() {
    const weekStart = getWeekStart(viewDate);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });

    return (
      <div className="cal-week-grid-wrap">
        <div className="cal-week-header-row">
          <div className="cal-week-time-col" />
          {days.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={i} className={`cal-week-day-header ${isToday ? 'cal-week-day-today' : ''}`}
                onClick={() => { setViewDate(new Date(d)); setCalView('day'); }}>
                <span className="cal-week-day-name">{DAYS_HE[d.getDay()]}</span>
                <span className={`cal-week-day-num ${isToday ? 'cal-week-day-num-today' : ''}`}>{d.getDate()}</span>
              </div>
            );
          })}
        </div>
        <div className="cal-week-body">
          {HOURS.map(hour => (
            <div key={hour} className="cal-week-row">
              <div className="cal-week-time-label">{String(hour).padStart(2, '0')}:00</div>
              {days.map((d, di) => {
                const ds = dateStr(d.getFullYear(), d.getMonth(), d.getDate());
                const tasks = getTasksForDate(ds);
                const personal = syncPersonal ? PERSONAL_EVENTS.filter(e => e.dayOfWeek === d.getDay() && e.hour === hour) : [];
                return (
                  <div key={di} className={`cal-week-cell ${d.toDateString() === today.toDateString() ? 'cal-week-cell-today' : ''}`}
                    onClick={() => { setViewDate(new Date(d)); setCalView('day'); }}>
                    {personal.map(e => (
                      <div key={e.id} className="cal-event-block cal-event-personal" style={{ borderRight: `3px solid ${e.color}`, background: e.color + '18' }} onClick={ev => ev.stopPropagation()}>
                        {e.title}
                      </div>
                    ))}
                    {hour === 9 && tasks.slice(0, 2).map(task => (
                      <div key={task.id} className="cal-event-block" style={{ borderRight: `3px solid ${STATUS_COLORS[task.status]}`, background: STATUS_COLORS[task.status] + '18', color: STATUS_COLORS[task.status] }}
                        onClick={ev => { ev.stopPropagation(); dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id }); }}>
                        {task.title}
                      </div>
                    ))}
                    {hour === 9 && tasks.length > 2 && (
                      <div className="cal-task-more" onClick={ev => ev.stopPropagation()}>+{tasks.length - 2}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── YEAR VIEW ──
  function renderYear() {
    const year = viewDate.getFullYear();
    return (
      <div className="cal-year-grid">
        {MONTHS_HE.map((mName, mi) => {
          const firstDay = new Date(year, mi, 1).getDay();
          const daysInMonth = new Date(year, mi + 1, 0).getDate();
          const cells: (number | null)[] = Array(firstDay).fill(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);
          while (cells.length % 7 !== 0) cells.push(null);
          return (
            <div key={mi} className="cal-year-month"
              onClick={() => { setViewDate(new Date(year, mi, 1)); setCalView('month'); }}>
              <div className="cal-year-month-name">{mName}</div>
              <div className="cal-year-mini-header">
                {DAYS_HE.map(d => <div key={d} className="cal-year-mini-day-head">{d}</div>)}
              </div>
              <div className="cal-year-mini-grid">
                {cells.map((day, ci) => {
                  if (!day) return <div key={ci} className="cal-year-mini-cell" />;
                  const ds = dateStr(year, mi, day);
                  const hasTasks = getTasksForDate(ds).length > 0;
                  const isToday = day === today.getDate() && mi === today.getMonth() && year === today.getFullYear();
                  return (
                    <div key={ci}
                      className={`cal-year-mini-cell cal-year-mini-cell-active ${isToday ? 'cal-year-mini-cell-today' : ''} ${hasTasks ? 'cal-year-mini-cell-has-tasks' : ''}`}
                      onClick={ev => { ev.stopPropagation(); setViewDate(new Date(year, mi, day)); setCalView('day'); }}
                    >{day}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="cal-root">
      {/* Top bar */}
      <div className="cal-topbar">
        <div className="cal-topbar-right">
          {/* View tabs */}
          <div className="cal-view-tabs">
            {(['day', 'week', 'month', 'year'] as CalView[]).map(v => (
              <button key={v} className={`cal-view-tab ${calView === v ? 'active' : ''}`} onClick={() => setCalView(v)}>
                {{ day: 'יומי', week: 'שבועי', month: 'חודשי', year: 'שנתי' }[v]}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="cal-nav-group">
            <button className="cal-nav-btn" onClick={() => navigate(1)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
            <button className="cal-nav-btn" onClick={() => navigate(-1)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
            </button>
            <button className="cal-today-btn" onClick={goToday}>היום</button>
          </div>

          <h2 className="calendar-month-title">{headerTitle()}</h2>
        </div>

        <div className="cal-topbar-left">
          {/* Jump to date */}
          <input
            type="date"
            className="cal-date-jump"
            value={`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(viewDate.getDate()).padStart(2, '0')}`}
            onChange={e => { if (e.target.value) setViewDate(new Date(e.target.value + 'T12:00:00')); }}
            title="קפוץ לתאריך"
          />

          {/* Personal calendar sync */}
          <button
            className={`cal-sync-btn ${syncPersonal ? 'active' : ''}`}
            onClick={() => setSyncPersonal(!syncPersonal)}
            title={syncPersonal ? 'הסתר יומן אישי' : 'הצג יומן אישי'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_month</span>
            יומן אישי
            {syncPersonal && <span className="cal-sync-dot" />}
          </button>
        </div>
      </div>

      {/* Calendar body */}
      <div className="cal-body">
        {calView === 'month' && renderMonth()}
        {calView === 'day' && renderDay()}
        {calView === 'week' && renderWeek()}
        {calView === 'year' && renderYear()}
      </div>
    </div>
  );
}
