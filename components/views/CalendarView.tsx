'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  todo: '#fdab3d',
  in_progress: '#0073ea',
  stuck: '#e2445c',
  done: '#00c875',
  backlog: '#c5c7d4',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarView() {
  const { state, dispatch } = useStore();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const projectTasks = state.tasks.filter(t => t.projectId === state.activeProjectId);

  function getTasksForDay(day: number, m: number, y: number): Task[] {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return projectTasks.filter(t => t.dueDate === dateStr || t.startDate === dateStr);
  }

  const cells: { day: number; month: number; year: number; current: boolean }[] = [];

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({ day: d, month: prevMonth, year: prevYear, current: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, current: true });
  }

  // Next month fill
  const remaining = 42 - cells.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: nextMonth, year: nextYear, current: false });
  }

  const selectedTasks = selectedDate
    ? projectTasks.filter(t => t.dueDate === selectedDate || t.startDate === selectedDate)
    : [];

  return (
    <div className="calendar-layout">
      <div className="calendar-main">
        {/* Calendar Header */}
        <div className="calendar-header">
          <button className="cal-nav-btn" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
            <ChevronLeft size={16} />
          </button>
          <h2 className="calendar-month-title">{MONTHS[month]} {year}</h2>
          <button className="cal-nav-btn" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
            <ChevronRight size={16} />
          </button>
          <button
            className="cal-today-btn"
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            Today
          </button>
        </div>

        {/* Day Headers */}
        <div className="calendar-grid-header">
          {DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {cells.map((cell, idx) => {
            const tasks = getTasksForDay(cell.day, cell.month, cell.year);
            const isToday = cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear();
            const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={idx}
                className={`cal-cell ${!cell.current ? 'cal-cell-other' : ''} ${isToday ? 'cal-cell-today' : ''} ${isSelected ? 'cal-cell-selected' : ''}`}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              >
                <div className="cal-cell-day">{cell.day}</div>
                <div className="cal-cell-tasks">
                  {tasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className="cal-task-chip"
                      style={{ background: STATUS_COLORS[task.status] + '22', borderLeft: `3px solid ${STATUS_COLORS[task.status]}`, color: STATUS_COLORS[task.status] }}
                      onClick={e => { e.stopPropagation(); dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id }); }}
                    >
                      {task.title}
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <div className="cal-task-more">+{tasks.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side panel */}
      <div className="calendar-side">
        <h3 className="cal-side-title">
          {selectedDate
            ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : 'Select a day'}
        </h3>
        {selectedDate && selectedTasks.length === 0 && (
          <div className="cal-empty">No tasks on this day</div>
        )}
        <div className="cal-side-tasks">
          {selectedTasks.map(task => {
            const assignees = task.assigneeIds.map(id => state.users.find(u => u.id === id)).filter(Boolean);
            return (
              <div
                key={task.id}
                className="cal-side-task"
                onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
              >
                <div className="cal-side-task-header">
                  <div className="cal-task-status-dot" style={{ background: STATUS_COLORS[task.status] }} />
                  <div className="cal-side-task-title">{task.title}</div>
                </div>
                <div className="cal-side-task-meta">
                  <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                  <div className="cal-side-task-assignees">
                    {assignees.map(u => u && (
                      <div key={u.id} className="cal-mini-avatar" style={{ background: u.color }} title={u.name}>
                        {u.avatar}
                      </div>
                    ))}
                  </div>
                </div>
                {task.dueDate === selectedDate && (
                  <div className="cal-due-label">Due today</div>
                )}
                {task.startDate === selectedDate && task.dueDate !== selectedDate && (
                  <div className="cal-start-label">Starts today</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="cal-side-divider" />
        <h4 className="cal-side-month-title">This month overview</h4>
        <div className="cal-month-stats">
          <div className="cal-month-stat">
            <div className="cal-month-stat-val" style={{ color: '#00c875' }}>
              {projectTasks.filter(t => t.dueDate?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}
            </div>
            <div className="cal-month-stat-label">Due this month</div>
          </div>
          <div className="cal-month-stat">
            <div className="cal-month-stat-val" style={{ color: '#0073ea' }}>
              {projectTasks.filter(t => t.status === 'in_progress').length}
            </div>
            <div className="cal-month-stat-label">In progress</div>
          </div>
          <div className="cal-month-stat">
            <div className="cal-month-stat-val" style={{ color: '#e2445c' }}>
              {projectTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'done').length}
            </div>
            <div className="cal-month-stat-label">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
