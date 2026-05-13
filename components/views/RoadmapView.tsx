'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Task } from '@/lib/types';
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, differenceInDays, parseISO, startOfWeek, endOfWeek } from 'date-fns';

type Zoom = 'week' | 'month' | 'quarter';

function getTimelineStart(zoom: Zoom): Date {
  const now = new Date();
  if (zoom === 'week') return startOfWeek(addDays(now, -7), { weekStartsOn: 0 });
  if (zoom === 'month') return startOfMonth(addDays(now, -14));
  return startOfMonth(addDays(now, -30));
}

function getTimelineEnd(zoom: Zoom, start: Date): Date {
  if (zoom === 'week') return addDays(start, 28);
  if (zoom === 'month') return addDays(start, 90);
  return addDays(start, 180);
}

function getDayWidth(zoom: Zoom): number {
  if (zoom === 'week') return 40;
  if (zoom === 'month') return 20;
  return 8;
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#c4c4c4',
  in_progress: '#fdab3d',
  done: '#00c875',
  stuck: '#e2445c',
  backlog: '#9c27b0',
};

export function RoadmapView() {
  const { state, dispatch } = useStore();
  const [zoom, setZoom] = useState<Zoom>('month');
  const scrollRef = useRef<HTMLDivElement>(null);

  const projectTasks = state.tasks
    .filter(t => t.projectId === state.activeProjectId && (t.startDate || t.dueDate))
    .sort((a, b) => (a.startDate || a.dueDate || '').localeCompare(b.startDate || b.dueDate || ''));

  const timelineStart = getTimelineStart(zoom);
  const timelineEnd = getTimelineEnd(zoom, timelineStart);
  const dayWidth = getDayWidth(zoom);
  const days = eachDayOfInterval({ start: timelineStart, end: timelineEnd });
  const totalWidth = days.length * dayWidth;

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayOffset = differenceInDays(new Date(), timelineStart) * dayWidth;
      scrollRef.current.scrollLeft = Math.max(0, todayOffset - 200);
    }
  }, [zoom]);

  const getTaskBar = (task: Task) => {
    const start = task.startDate ? parseISO(task.startDate) : task.dueDate ? parseISO(task.dueDate) : null;
    const end = task.dueDate ? parseISO(task.dueDate) : task.startDate ? addDays(parseISO(task.startDate), 7) : null;

    if (!start || !end) return null;

    const left = differenceInDays(start, timelineStart) * dayWidth;
    const width = Math.max((differenceInDays(end, start) + 1) * dayWidth, dayWidth);

    return { left, width };
  };

  // Month labels
  const monthLabels: { label: string; left: number }[] = [];
  let currMonth = '';
  days.forEach((d, i) => {
    const m = format(d, 'MMM yyyy');
    if (m !== currMonth) {
      monthLabels.push({ label: m, left: i * dayWidth });
      currMonth = m;
    }
  });

  return (
    <div className="roadmap-container">
      {/* Controls */}
      <div className="roadmap-controls">
        <div className="zoom-tabs">
          {(['week', 'month', 'quarter'] as Zoom[]).map(z => (
            <button
              key={z}
              className={`zoom-tab ${zoom === z ? 'active' : ''}`}
              onClick={() => setZoom(z)}
            >
              {z.charAt(0).toUpperCase() + z.slice(1)}
            </button>
          ))}
        </div>
        <div className="roadmap-legend">
          {Object.entries(STATUS_COLORS).map(([k, v]) => (
            <div key={k} className="legend-item">
              <span className="legend-dot" style={{ background: v }} />
              <span>{k.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="roadmap-layout">
        {/* Task names column */}
        <div className="roadmap-names-col">
          <div className="roadmap-header-cell" style={{ height: 56 }}>Task</div>
          {projectTasks.map(task => (
            <div
              key={task.id}
              className="roadmap-task-label"
              onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
            >
              <span
                className="roadmap-status-dot"
                style={{ background: STATUS_COLORS[task.status] }}
              />
              <span className="roadmap-task-name">{task.title}</span>
            </div>
          ))}
        </div>

        {/* Timeline scroll area */}
        <div className="roadmap-timeline-scroll" ref={scrollRef}>
          <div style={{ width: totalWidth, minWidth: totalWidth }}>
            {/* Month headers */}
            <div className="roadmap-months" style={{ position: 'relative', height: 28 }}>
              {monthLabels.map(m => (
                <span
                  key={m.label}
                  className="roadmap-month-label"
                  style={{ left: m.left }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Day headers */}
            <div className="roadmap-days" style={{ display: 'flex', height: 28 }}>
              {days.map(d => (
                <div
                  key={d.toISOString()}
                  className={`roadmap-day-cell ${isToday(d) ? 'today' : ''}`}
                  style={{ minWidth: dayWidth, width: dayWidth }}
                >
                  {zoom !== 'quarter' && <span>{format(d, 'd')}</span>}
                </div>
              ))}
            </div>

            {/* Today line */}
            <div
              className="today-line"
              style={{ left: differenceInDays(new Date(), timelineStart) * dayWidth }}
            />

            {/* Task bars */}
            <div className="roadmap-bars">
              {projectTasks.map(task => {
                const bar = getTaskBar(task);
                if (!bar) return (
                  <div key={task.id} className="roadmap-row" style={{ height: 40 }} />
                );
                return (
                  <div key={task.id} className="roadmap-row" style={{ position: 'relative', height: 40 }}>
                    <div
                      className="roadmap-bar"
                      style={{
                        left: bar.left,
                        width: bar.width,
                        background: STATUS_COLORS[task.status],
                      }}
                      onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
                      title={task.title}
                    >
                      <span className="roadmap-bar-label">{task.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {projectTasks.length === 0 && (
        <div className="roadmap-empty">
          <p>No tasks with dates found in this project.</p>
          <p>Add start/due dates to tasks to see them on the roadmap.</p>
        </div>
      )}
    </div>
  );
}
