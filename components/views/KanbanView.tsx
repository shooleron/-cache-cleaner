'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Task, TaskStatus } from '@/lib/types';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  closestCenter, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog',     label: 'בקלוג',   color: '#9c27b0' },
  { id: 'todo',        label: 'לביצוע',  color: '#c4c4c4' },
  { id: 'in_progress', label: 'בתהליך',  color: '#fdab3d' },
  { id: 'stuck',       label: 'תקוע',    color: '#e2445c' },
  { id: 'done',        label: 'הושלם',   color: '#00c875' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#e2445c',
  high: '#fdab3d',
  medium: '#f2d600',
  low: '#c4c4c4',
};

function KanbanCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const { state, dispatch } = useStore();
  const assignees = task.assigneeIds.map(id => state.users.find(u => u.id === id)).filter(Boolean);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
      onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: task.id })}
    >
      <div className="kanban-card-header">
        <span className="priority-dot" style={{ background: PRIORITY_COLORS[task.priority] }} />
        <button
          className="card-delete-btn"
          onClick={e => {
            e.stopPropagation();
            dispatch({ type: 'DELETE_TASK', payload: task.id });
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
        </button>
      </div>
      <p className="kanban-card-title">{task.title}</p>
      {task.dueDate && (
        <p className="kanban-card-date">
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>calendar_today</span>
          {new Date(task.dueDate).toLocaleDateString('he-IL')}
        </p>
      )}
      <div className="kanban-card-footer">
        <div className="card-avatars">
          {assignees.map(u => u && (
            <div key={u.id} className="kanban-avatar" style={{ background: u.color }} title={u.name}>
              {u.avatar}
            </div>
          ))}
        </div>
        {task.comments.length > 0 && (
          <span className="comment-count">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>chat_bubble</span>
            {task.comments.length}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ status, tasks }: { status: typeof COLUMNS[0]; tasks: Task[] }) {
  const { state, dispatch } = useStore();
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const firstGroupId = state.groups.find(g => g.projectId === state.activeProjectId)?.id;

  const handleAddTask = () => {
    if (newTaskTitle.trim() && state.activeProjectId && firstGroupId) {
      dispatch({ type: 'CREATE_TASK', payload: {
        projectId: state.activeProjectId,
        groupId: firstGroupId,
        title: newTaskTitle.trim(),
      }});
      setNewTaskTitle('');
      setAddingTask(false);
    }
  };

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <div className="kanban-column-label">
          <span className="kanban-status-dot" style={{ background: status.color }} />
          <span className="kanban-column-title">{status.label}</span>
          <span className="kanban-task-count">{tasks.length}</span>
        </div>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-cards">
          {tasks.map(task => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {addingTask ? (
        <div className="kanban-add-form">
          <input
            className="kanban-new-input"
            placeholder="שם המשימה..."
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddTask();
              if (e.key === 'Escape') setAddingTask(false);
            }}
            onBlur={handleAddTask}
            autoFocus
          />
        </div>
      ) : (
        <button className="kanban-add-btn" onClick={() => setAddingTask(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
          הוסף כרטיס
        </button>
      )}
    </div>
  );
}

export function KanbanView() {
  const { state, dispatch } = useStore();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }));

  const projectTasks = state.tasks.filter(t => t.projectId === state.activeProjectId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);
    if (!over) return;
    const overTask = state.tasks.find(t => t.id === over.id);
    if (overTask && overTask.id !== active.id) {
      dispatch({ type: 'MOVE_TASK', payload: { taskId: active.id as string, newStatus: overTask.status } });
    }
  };

  const activeTask = activeTaskId ? state.tasks.find(t => t.id === activeTaskId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const colTasks = projectTasks.filter(t => t.status === col.id);
          return <KanbanColumn key={col.id} status={col} tasks={colTasks} />;
        })}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="kanban-card drag-overlay">
            <p className="kanban-card-title">{activeTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
