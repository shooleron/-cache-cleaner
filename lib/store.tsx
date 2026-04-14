'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import {
  AppState, Task, Project, User, Notification, Comment, Group, BoardView,
  AppSection, CRMView, Contact, ContactType, Deal, DealActivity, AutomationRule, AIMessage,
  DealStage, SubItem, ActivityLog, ActivityVerb, Event, Campaign, EventStatus,
  Attachment, AttachmentType, TaskNote, Speaker, Panel, SponsorshipProduct, DealLineItem, Brand,
  ChatConversation, ChatMessage,
} from './types';
import { INITIAL_STATE } from './mockData';
import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy Supabase client — avoids "supabaseUrl is required" during SSR prerender
let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    _supabase = createClient(url, key);
  }
  return _supabase;
}

type Action =
  | { type: 'SET_ACTIVE_PROJECT'; payload: string }
  | { type: 'SET_ACTIVE_VIEW'; payload: BoardView }
  | { type: 'SET_ACTIVE_SECTION'; payload: AppSection }
  | { type: 'SET_CRM_VIEW'; payload: CRMView }
  | { type: 'TOGGLE_NOTIFICATIONS_PANEL' }
  | { type: 'TOGGLE_AI_PANEL' }
  | { type: 'OPEN_TASK_MODAL'; payload: string }
  | { type: 'CLOSE_TASK_MODAL' }
  | { type: 'OPEN_NEW_PROJECT_MODAL' }
  | { type: 'CLOSE_NEW_PROJECT_MODAL' }
  | { type: 'OPEN_INVITE_MODAL' }
  | { type: 'CLOSE_INVITE_MODAL' }
  | { type: 'CREATE_PROJECT'; payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'memberIds'> }
  | { type: 'CREATE_TASK'; payload: { projectId: string; groupId: string; title: string } }
  | { type: 'UPDATE_TASK'; payload: Partial<Task> & { id: string } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStatus: Task['status'] } }
  | { type: 'ADD_COMMENT'; payload: { taskId: string; text: string; commentType?: Comment['type'] } }
  | { type: 'ADD_ATTACHMENT'; payload: { taskId: string; type: AttachmentType; name: string; url: string; size?: number; mimeType?: string } }
  | { type: 'DELETE_ATTACHMENT'; payload: { taskId: string; attachmentId: string } }
  | { type: 'ADD_NOTE'; payload: { taskId: string; content: string } }
  | { type: 'UPDATE_NOTE'; payload: { taskId: string; noteId: string; content: string } }
  | { type: 'DELETE_NOTE'; payload: { taskId: string; noteId: string } }
  | { type: 'ADD_SUB_ITEM'; payload: { taskId: string; title: string } }
  | { type: 'TOGGLE_SUB_ITEM'; payload: { taskId: string; subItemId: string } }
  | { type: 'CREATE_GROUP'; payload: { projectId: string; name: string } }
  | { type: 'UPDATE_GROUP'; payload: { id: string; name: string } }
  | { type: 'INVITE_USER'; payload: { email: string; projectId: string } }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CREATE_CONTACT'; payload: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'avatar' | 'linkedDealIds'> }
  | { type: 'UPDATE_CONTACT'; payload: Partial<Contact> & { id: string } }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'CREATE_DEAL'; payload: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'activities'> }
  | { type: 'UPDATE_DEAL'; payload: Partial<Deal> & { id: string } }
  | { type: 'CLOSE_DEAL_WON'; payload: { dealId: string } }
  | { type: 'DELETE_DEAL'; payload: string }
  | { type: 'MOVE_DEAL_STAGE'; payload: { dealId: string; stage: DealStage } }
  | { type: 'ADD_DEAL_ACTIVITY'; payload: { dealId: string; type: DealActivity['type']; description: string } }
  | { type: 'CREATE_AUTOMATION'; payload: Omit<AutomationRule, 'id' | 'timesTriggered' | 'createdAt'> }
  | { type: 'UPDATE_AUTOMATION'; payload: AutomationRule }
  | { type: 'DELETE_AUTOMATION'; payload: string }
  | { type: 'TOGGLE_AUTOMATION'; payload: string }
  | { type: 'ADD_AI_MESSAGE'; payload: AIMessage }
  | { type: 'CLEAR_AI_MESSAGES' }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'COMPLETE_ONBOARDING'; payload: { name: string; jobTitle: string; company: string; companyAddress: string; phone: string; email: string; isAdmin: boolean; passwordHash?: string } }
  | { type: 'SET_USER_ROLE'; payload: { userId: string; role: import('./types').UserRole } }
  | { type: 'UNLOCK_APP' }
  | { type: 'LOCK_APP' }
  | { type: 'OPEN_PROFILE_MODAL' }
  | { type: 'CLOSE_PROFILE_MODAL' }
  | { type: 'UPDATE_PROFILE'; payload: { name?: string; jobTitle?: string; phone?: string; email?: string; company?: string; companyAddress?: string } }
  | { type: 'OPEN_NEW_EVENT_MODAL' }
  | { type: 'CLOSE_NEW_EVENT_MODAL' }
  | { type: 'CREATE_EVENT'; payload: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_EVENT'; payload: Partial<Event> & { id: string } }
  | { type: 'UPDATE_PROJECT'; payload: Partial<Project> & { id: string } }
  | { type: 'ARCHIVE_EVENT'; payload: string }
  | { type: 'DUPLICATE_EVENT'; payload: { sourceEventId: string; newName: string; newDate: string } }
  | { type: 'SET_ACTIVE_EVENT'; payload: string }
  | { type: 'CREATE_CAMPAIGN'; payload: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_CAMPAIGN'; payload: Partial<Campaign> & { id: string } }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'OPEN_SPEAKER_MODAL'; payload: string }
  | { type: 'CLOSE_SPEAKER_MODAL' }
  | { type: 'CREATE_SPEAKER'; payload: Omit<Speaker, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_SPEAKER'; payload: Partial<Speaker> & { id: string } }
  | { type: 'DELETE_SPEAKER'; payload: string }
  | { type: 'CREATE_PANEL'; payload: Omit<Panel, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_PANEL'; payload: Partial<Panel> & { id: string } }
  | { type: 'DELETE_PANEL'; payload: string }
  | { type: 'ADD_SPEAKER_TO_PANEL'; payload: { panelId: string; speakerId: string } }
  | { type: 'REMOVE_SPEAKER_FROM_PANEL'; payload: { panelId: string; speakerId: string } }
  | { type: 'CREATE_BRAND'; payload: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'TOGGLE_CHAT_PANEL' }
  | { type: 'OPEN_CHAT'; payload: string }
  | { type: 'CLOSE_CHAT_CONVERSATION' }
  | { type: 'SEND_CHAT_MESSAGE'; payload: { toUserId: string; text: string } }
  | { type: 'MARK_CHAT_READ'; payload: { conversationId: string } }
  | { type: 'DISMISS_WELCOME' }
  | { type: 'DISMISS_CELEBRATION' };

// Fields that should NOT be synced to Supabase (UI-only state)
const UI_ONLY_FIELDS: (keyof AppState)[] = [
  'notificationsPanelOpen',
  'chatPanelOpen',
  'activeChatUserId',
  'taskModalId',
  'newProjectModalOpen',
  'inviteModalOpen',
  'aiPanelOpen',
  'contactModalId',
  'dealModalId',
  'aiMessages',
  'onboardingComplete',
  'appLocked',
  'profileModalOpen',
  'activeEventId',
  'newEventModalOpen',
  'speakerModalId',
  'welcomeTaskId',
  'celebrationTaskId',
];

function makeLog(userId: string, verb: ActivityVerb, label: string, entityId?: string, entityType?: ActivityLog['entityType']): ActivityLog {
  return { id: uuidv4(), userId, verb, label, entityId, entityType, createdAt: new Date().toISOString() };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProjectId: action.payload, taskModalId: null, activeSection: 'events' };

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };

    case 'SET_CRM_VIEW':
      return { ...state, activeCRMView: action.payload };

    case 'TOGGLE_NOTIFICATIONS_PANEL':
      return { ...state, notificationsPanelOpen: !state.notificationsPanelOpen };

    case 'TOGGLE_AI_PANEL':
      return { ...state, aiPanelOpen: !state.aiPanelOpen };

    case 'OPEN_TASK_MODAL':
      return { ...state, taskModalId: action.payload };

    case 'CLOSE_TASK_MODAL':
      return { ...state, taskModalId: null };

    case 'OPEN_NEW_PROJECT_MODAL':
      return { ...state, newProjectModalOpen: true };

    case 'CLOSE_NEW_PROJECT_MODAL':
      return { ...state, newProjectModalOpen: false };

    case 'OPEN_NEW_EVENT_MODAL':
      return { ...state, newEventModalOpen: true };

    case 'CLOSE_NEW_EVENT_MODAL':
      return { ...state, newEventModalOpen: false };

    case 'OPEN_INVITE_MODAL':
      return { ...state, inviteModalOpen: true };

    case 'CLOSE_INVITE_MODAL':
      return { ...state, inviteModalOpen: false };

    case 'CREATE_PROJECT': {
      const now = new Date().toISOString();
      const newProject: Project = {
        ...action.payload,
        id: uuidv4(),
        memberIds: [state.currentUser.id],
        createdAt: now,
        updatedAt: now,
      };
      const defaultGroup: Group = {
        id: uuidv4(),
        projectId: newProject.id,
        name: 'Tasks',
        color: action.payload.color,
        order: 0,
      };
      return { ...state, projects: [...state.projects, newProject], groups: [...state.groups, defaultGroup], activeProjectId: newProject.id, newProjectModalOpen: false, activeSection: 'events', activityLogs: [makeLog(state.currentUser.id, 'created_project', `יצר פרויקט "${newProject.name}"`, newProject.id, 'project'), ...state.activityLogs].slice(0, 500) };
    }

    case 'CREATE_TASK': {
      const now = new Date().toISOString();
      const existingTasks = state.tasks.filter(t => t.groupId === action.payload.groupId);
      const newTask: Task = {
        id: uuidv4(),
        projectId: action.payload.projectId,
        groupId: action.payload.groupId,
        title: action.payload.title,
        description: '',
        status: 'todo',
        priority: 'medium',
        assigneeIds: [],
        startDate: null,
        dueDate: null,
        order: existingTasks.length,
        comments: [],
        subItems: [],
        tags: [],
        timeTracked: 0,
        campaignId: null,
        attachments: [],
        notes: [],
        recurring: false,
        recurringInterval: null,
        department: null,
        contactId: null,
        checkboxValue: false, linkUrl: null, phoneValue: null, locationValue: null,
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, tasks: [...state.tasks, newTask], activityLogs: [makeLog(state.currentUser.id, 'created_task', `יצר משימה "${newTask.title}"`, newTask.id, 'task'), ...state.activityLogs].slice(0, 500) };
    }

    case 'UPDATE_TASK': {
      const now = new Date().toISOString();
      const oldTask = state.tasks.find(t => t.id === action.payload.id);
      const actor = state.currentUser;

      // Build activity comments for tracked field changes
      const activityComments: import('./types').Comment[] = [];

      if (oldTask) {
        const STATUS_LABELS: Record<string, string> = { todo: 'לביצוע', in_progress: 'בתהליך', done: 'הושלם', stuck: 'תקוע', backlog: 'בקלוג' };
        const PRIORITY_LABELS: Record<string, string> = { critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך' };

        if (action.payload.status && action.payload.status !== oldTask.status) {
          activityComments.push({ id: uuidv4(), taskId: oldTask.id, userId: actor.id, type: 'activity',
            text: `שינה סטטוס מ-"${STATUS_LABELS[oldTask.status] || oldTask.status}" ל-"${STATUS_LABELS[action.payload.status] || action.payload.status}"`, createdAt: now });
        }
        if (action.payload.priority && action.payload.priority !== oldTask.priority) {
          activityComments.push({ id: uuidv4(), taskId: oldTask.id, userId: actor.id, type: 'activity',
            text: `שינה עדיפות מ-"${PRIORITY_LABELS[oldTask.priority]}" ל-"${PRIORITY_LABELS[action.payload.priority]}"`, createdAt: now });
        }
        if (action.payload.assigneeIds) {
          const added = action.payload.assigneeIds.filter(id => !oldTask.assigneeIds.includes(id));
          const removed = oldTask.assigneeIds.filter(id => !action.payload.assigneeIds!.includes(id));
          added.forEach(id => {
            const u = state.users.find(u => u.id === id);
            if (u) activityComments.push({ id: uuidv4(), taskId: oldTask.id, userId: actor.id, type: 'activity',
              text: `הוסיף את ${u.name} לצוות המשימה`, createdAt: now });
          });
          removed.forEach(id => {
            const u = state.users.find(u => u.id === id);
            if (u) activityComments.push({ id: uuidv4(), taskId: oldTask.id, userId: actor.id, type: 'activity',
              text: `הסיר את ${u.name} מצוות המשימה`, createdAt: now });
          });
        }
        if ('contactId' in action.payload) {
          if (action.payload.contactId && action.payload.contactId !== oldTask.contactId) {
            const contact = state.contacts.find(c => c.id === action.payload.contactId);
            activityComments.push({ id: uuidv4(), taskId: oldTask.id, userId: actor.id, type: 'activity',
              text: `שייך איש קשר חיצוני: ${contact?.name || action.payload.contactId} (${contact?.company || ''})`, createdAt: now });
          } else if (!action.payload.contactId && oldTask.contactId) {
            const contact = state.contacts.find(c => c.id === oldTask.contactId);
            activityComments.push({ id: uuidv4(), taskId: oldTask.id, userId: actor.id, type: 'activity',
              text: `הסיר את איש הקשר ${contact?.name || ''}`, createdAt: now });
          }
        }
        if (action.payload.dueDate !== undefined && action.payload.dueDate !== oldTask.dueDate) {
          const dateStr = action.payload.dueDate ? new Date(action.payload.dueDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }) : 'ללא תאריך';
          activityComments.push({ id: uuidv4(), taskId: oldTask.id, userId: actor.id, type: 'activity',
            text: `עדכן תאריך יעד ל-${dateStr}`, createdAt: now });
        }
        if (action.payload.title && action.payload.title !== oldTask.title) {
          activityComments.push({ id: uuidv4(), taskId: oldTask.id, userId: actor.id, type: 'activity',
            text: `שינה שם המשימה`, createdAt: now });
        }
        if (action.payload.timeTracked && action.payload.timeTracked !== oldTask.timeTracked) {
          const added = action.payload.timeTracked - oldTask.timeTracked;
          activityComments.push({ id: uuidv4(), taskId: oldTask.id, userId: actor.id, type: 'activity',
            text: `רשם ${added} דקות עבודה`, createdAt: now });
        }
      }

      const updatedTasks = state.tasks.map(t => {
        if (t.id !== action.payload.id) return t;
        const updatedComments = activityComments.length > 0 ? [...t.comments, ...activityComments] : t.comments;
        return { ...t, ...action.payload, comments: updatedComments, updatedAt: now };
      });

      let notifications = state.notifications;
      let welcomeTaskId = state.welcomeTaskId;
      let celebrationTaskId = state.celebrationTaskId;

      // Celebration on task completion
      if (action.payload.status === 'done' && oldTask && oldTask.status !== 'done') {
        celebrationTaskId = action.payload.id;
        oldTask.assigneeIds.forEach(assigneeId => {
          notifications = [{ id: uuidv4(), userId: assigneeId, type: 'task_completed', message: `🎉 משימה "${oldTask.title}" הושלמה!`, taskId: action.payload.id, projectId: oldTask.projectId, read: false, createdAt: now }, ...notifications];
        });
      }

      // Assignment notifications + welcome screen
      if (action.payload.assigneeIds) {
        const newAssignees = action.payload.assigneeIds.filter(id => !oldTask?.assigneeIds.includes(id));
        newAssignees.forEach(assigneeId => {
          const assignee = state.users.find(u => u.id === assigneeId);
          if (assignee) {
            notifications = [{ id: uuidv4(), userId: assigneeId, type: 'assigned', message: `${state.currentUser.name} שייך אותך למשימה "${oldTask?.title}"`, taskId: action.payload.id, projectId: oldTask?.projectId || null, read: false, createdAt: now }, ...notifications];
            if (assigneeId === state.currentUser.id) {
              welcomeTaskId = action.payload.id;
            }
          }
        });
      }
      return { ...state, tasks: updatedTasks, notifications, welcomeTaskId, celebrationTaskId, activityLogs: [makeLog(actor.id, 'updated_task', `עדכן משימה "${oldTask?.title || ''}"`, action.payload.id, 'task'), ...state.activityLogs].slice(0, 500) };
    }

    case 'DELETE_TASK': {
      const deletedTask = state.tasks.find(t => t.id === action.payload);
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload), activityLogs: [makeLog(state.currentUser.id, 'deleted_task', `מחק משימה "${deletedTask?.title || ''}"`, action.payload, 'task'), ...state.activityLogs].slice(0, 500) };
    }

    case 'MOVE_TASK': {
      const now = new Date().toISOString();
      const movedTask = state.tasks.find(t => t.id === action.payload.taskId);
      const becameDone = action.payload.newStatus === 'done' && movedTask?.status !== 'done';
      const moveLog = becameDone
        ? makeLog(state.currentUser.id, 'completed_task', `סימן משימה "${movedTask?.title || ''}" כהושלמה`, action.payload.taskId, 'task')
        : null;
      let moveNotifications = state.notifications;
      if (becameDone && movedTask) {
        movedTask.assigneeIds.forEach(assigneeId => {
          moveNotifications = [{ id: uuidv4(), userId: assigneeId, type: 'task_completed', message: `🎉 משימה "${movedTask.title}" הושלמה!`, taskId: movedTask.id, projectId: movedTask.projectId, read: false, createdAt: now }, ...moveNotifications];
        });
      }
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, status: action.payload.newStatus, updatedAt: now } : t),
        notifications: moveNotifications,
        celebrationTaskId: becameDone ? action.payload.taskId : state.celebrationTaskId,
        activityLogs: moveLog ? [moveLog, ...state.activityLogs].slice(0, 500) : state.activityLogs,
      };
    }

    case 'ADD_COMMENT': {
      const now = new Date().toISOString();
      const comment: Comment = { id: uuidv4(), taskId: action.payload.taskId, userId: state.currentUser.id, text: action.payload.text, type: action.payload.commentType || 'comment', createdAt: now };
      const commentTask = state.tasks.find(t => t.id === action.payload.taskId);
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, comments: [...t.comments, comment], updatedAt: now } : t), activityLogs: [makeLog(state.currentUser.id, 'commented', `הגיב על משימה "${commentTask?.title || ''}"`, action.payload.taskId, 'task'), ...state.activityLogs].slice(0, 500) };
    }

    case 'ADD_ATTACHMENT': {
      const now = new Date().toISOString();
      const attachment: Attachment = { id: uuidv4(), taskId: action.payload.taskId, type: action.payload.type, name: action.payload.name, url: action.payload.url, size: action.payload.size, mimeType: action.payload.mimeType, uploadedBy: state.currentUser.id, createdAt: now };
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, attachments: [...(t.attachments || []), attachment], updatedAt: now } : t) };
    }

    case 'DELETE_ATTACHMENT':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, attachments: (t.attachments || []).filter(a => a.id !== action.payload.attachmentId) } : t) };

    case 'ADD_NOTE': {
      const now = new Date().toISOString();
      const note: TaskNote = { id: uuidv4(), taskId: action.payload.taskId, userId: state.currentUser.id, content: action.payload.content, createdAt: now, updatedAt: now };
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, notes: [...(t.notes || []), note], updatedAt: now } : t) };
    }

    case 'UPDATE_NOTE': {
      const now = new Date().toISOString();
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, notes: (t.notes || []).map(n => n.id === action.payload.noteId ? { ...n, content: action.payload.content, updatedAt: now } : n) } : t) };
    }

    case 'DELETE_NOTE':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, notes: (t.notes || []).filter(n => n.id !== action.payload.noteId) } : t) };

    case 'ADD_SUB_ITEM': {
      const sub: SubItem = { id: uuidv4(), taskId: action.payload.taskId, title: action.payload.title, done: false };
      const now = new Date().toISOString();
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, subItems: [...(t.subItems || []), sub], updatedAt: now } : t) };
    }

    case 'TOGGLE_SUB_ITEM': {
      const now = new Date().toISOString();
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, subItems: (t.subItems || []).map(s => s.id === action.payload.subItemId ? { ...s, done: !s.done } : s), updatedAt: now }
            : t
        ),
      };
    }

    case 'CREATE_GROUP': {
      const newGroup: Group = {
        id: uuidv4(),
        projectId: action.payload.projectId,
        name: action.payload.name,
        color: '#' + ['0073ea', 'e2445c', 'fdab3d', '00c875', '9c27b0', 'f44336'][Math.floor(Math.random() * 6)],
        order: state.groups.filter(g => g.projectId === action.payload.projectId).length,
      };
      return { ...state, groups: [...state.groups, newGroup], activityLogs: [makeLog(state.currentUser.id, 'created_group', `יצר קבוצה "${newGroup.name}"`, newGroup.id, 'project'), ...state.activityLogs].slice(0, 500) };
    }

    case 'UPDATE_GROUP':
      return { ...state, groups: state.groups.map(g => g.id === action.payload.id ? { ...g, name: action.payload.name } : g) };

    case 'INVITE_USER': {
      const existingUser = state.users.find(u => u.email === action.payload.email);
      if (existingUser) {
        const updatedProjects = state.projects.map(p => p.id === action.payload.projectId && !p.memberIds.includes(existingUser.id) ? { ...p, memberIds: [...p.memberIds, existingUser.id] } : p);
        return { ...state, projects: updatedProjects, inviteModalOpen: false, activityLogs: [makeLog(state.currentUser.id, 'invited_user', `הזמין ${existingUser.name} לפרויקט`, existingUser.id, 'user'), ...state.activityLogs].slice(0, 500) };
      }
      const newUser: User = { id: uuidv4(), name: action.payload.email.split('@')[0], email: action.payload.email, avatar: action.payload.email.substring(0, 2).toUpperCase(), color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), role: 'member', status: 'pending' };
      const updatedProjects = state.projects.map(p => p.id === action.payload.projectId ? { ...p, memberIds: [...p.memberIds, newUser.id] } : p);
      return { ...state, users: [...state.users, newUser], projects: updatedProjects, inviteModalOpen: false, activityLogs: [makeLog(state.currentUser.id, 'invited_user', `הזמין ${newUser.name} לפרויקט`, newUser.id, 'user'), ...state.activityLogs].slice(0, 500) };
    }

    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    case 'CREATE_CONTACT': {
      const now = new Date().toISOString();
      const name = action.payload.name || '';
      const newContact: Contact = {
        ...action.payload,
        id: uuidv4(),
        avatar: name.substring(0, 2).toUpperCase(),
        linkedDealIds: [],
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
      };
      return { ...state, contacts: [...state.contacts, newContact], activityLogs: [makeLog(state.currentUser.id, 'created_contact', `יצר איש קשר "${newContact.name}"`, newContact.id, 'contact'), ...state.activityLogs].slice(0, 500) };
    }

    case 'UPDATE_CONTACT': {
      const now = new Date().toISOString();
      const updContact = state.contacts.find(c => c.id === action.payload.id);
      return { ...state, contacts: state.contacts.map(c => c.id === action.payload.id ? { ...c, ...action.payload, updatedAt: now, lastActivityAt: now } : c), activityLogs: [makeLog(state.currentUser.id, 'updated_contact', `עדכן איש קשר "${action.payload.name || updContact?.name || ''}"`, action.payload.id, 'contact'), ...state.activityLogs].slice(0, 500) };
    }

    case 'DELETE_CONTACT': {
      const delContact = state.contacts.find(c => c.id === action.payload);
      return { ...state, contacts: state.contacts.filter(c => c.id !== action.payload), activityLogs: [makeLog(state.currentUser.id, 'deleted_contact', `מחק איש קשר "${delContact?.name || ''}"`, action.payload, 'contact'), ...state.activityLogs].slice(0, 500) };
    }

    case 'CREATE_DEAL': {
      const now = new Date().toISOString();
      const newDeal: Deal = { ...action.payload, id: uuidv4(), activities: [], lineItems: action.payload.lineItems || [], eventId: action.payload.eventId || null, operationsProjectId: null, createdAt: now, updatedAt: now };
      let contacts = state.contacts;
      if (newDeal.contactId) {
        contacts = contacts.map(c => c.id === newDeal.contactId ? { ...c, linkedDealIds: [...c.linkedDealIds, newDeal.id] } : c);
      }
      return { ...state, deals: [...state.deals, newDeal], contacts, activityLogs: [makeLog(state.currentUser.id, 'created_deal', `יצר עסקה "${newDeal.title}"`, newDeal.id, 'deal'), ...state.activityLogs].slice(0, 500) };
    }

    case 'UPDATE_DEAL': {
      const now = new Date().toISOString();
      const updDeal = state.deals.find(d => d.id === action.payload.id);
      return { ...state, deals: state.deals.map(d => d.id === action.payload.id ? { ...d, ...action.payload, updatedAt: now } : d), activityLogs: [makeLog(state.currentUser.id, 'updated_deal', `עדכן עסקה "${action.payload.title || updDeal?.title || ''}"`, action.payload.id, 'deal'), ...state.activityLogs].slice(0, 500) };
    }

    case 'CLOSE_DEAL_WON': {
      const now = new Date().toISOString();
      const deal = state.deals.find(d => d.id === action.payload.dealId);
      if (!deal || deal.operationsProjectId) return state; // already has a project

      const contact = state.contacts.find(c => c.id === deal.contactId);
      const projectId = uuidv4();
      const groupId = uuidv4();

      // Build task list from each line item's product templates
      const tasks: Task[] = [];
      let taskOrder = 0;
      deal.lineItems.forEach(item => {
        const product = state.products.find(p => p.id === item.productId);
        if (!product) return;
        product.taskTemplates.forEach(tmpl => {
          tasks.push({
            id: uuidv4(),
            projectId,
            groupId,
            title: `[${item.productName}] ${tmpl}`,
            description: '',
            status: 'todo',
            priority: 'medium',
            assigneeIds: [deal.ownerId],
            startDate: null,
            dueDate: deal.expectedCloseDate,
            order: taskOrder++,
            comments: [],
            subItems: [],
            tags: [item.productName],
            timeTracked: 0,
            campaignId: null,
            attachments: [],
            notes: [],
            recurring: false,
            recurringInterval: null,
            department: 'operations',
            contactId: null,
            checkboxValue: false, linkUrl: null, phoneValue: null, locationValue: null,
            createdAt: now,
            updatedAt: now,
          });
        });
      });

      const newGroup: Group = {
        id: groupId,
        projectId,
        name: 'משימות תפעול',
        color: '#0073ea',
        order: 0,
      };

      const newProject: Project = {
        id: projectId,
        name: `תפעול — ${contact?.name || deal.title}`,
        description: `פרויקט תפעול שנוצר אוטומטית מעסקה: ${deal.title}`,
        color: '#00c875',
        icon: '⚙️',
        memberIds: [deal.ownerId, state.currentUser.id],
        defaultView: 'table',
        eventId: deal.eventId,
        createdAt: now,
        updatedAt: now,
      };

      const updatedDeal: Deal = {
        ...deal,
        stage: 'closed_won',
        operationsProjectId: projectId,
        updatedAt: now,
        activities: [...deal.activities, {
          id: uuidv4(), dealId: deal.id,
          type: 'stage_changed' as const,
          description: `✅ עסקה נסגרה! פרויקט תפעול נוצר אוטומטית עם ${tasks.length} משימות.`,
          userId: state.currentUser.id, createdAt: now,
        }],
      };

      return {
        ...state,
        deals: state.deals.map(d => d.id === deal.id ? updatedDeal : d),
        projects: [...state.projects, newProject],
        groups: [...state.groups, newGroup],
        tasks: [...state.tasks, ...tasks],
        activityLogs: [makeLog(state.currentUser.id, 'moved_deal', `סגר עסקה "${deal.title}" — נוצר פרויקט תפעול עם ${tasks.length} משימות`, deal.id, 'deal'), ...state.activityLogs].slice(0, 500),
      };
    }

    case 'DELETE_DEAL': {
      const delDeal = state.deals.find(d => d.id === action.payload);
      return { ...state, deals: state.deals.filter(d => d.id !== action.payload), activityLogs: [makeLog(state.currentUser.id, 'deleted_deal', `מחק עסקה "${delDeal?.title || ''}"`, action.payload, 'deal'), ...state.activityLogs].slice(0, 500) };
    }

    case 'MOVE_DEAL_STAGE': {
      const now = new Date().toISOString();
      const movedDeal = state.deals.find(d => d.id === action.payload.dealId);
      return {
        ...state,
        deals: state.deals.map(d =>
          d.id === action.payload.dealId
            ? { ...d, stage: action.payload.stage, updatedAt: now, activities: [...d.activities, { id: uuidv4(), dealId: d.id, type: 'stage_changed' as const, description: `Stage changed to ${action.payload.stage}`, userId: state.currentUser.id, createdAt: now }] }
            : d
        ),
        activityLogs: [makeLog(state.currentUser.id, 'moved_deal', `הזיז עסקה "${movedDeal?.title || ''}" לשלב ${action.payload.stage}`, action.payload.dealId, 'deal'), ...state.activityLogs].slice(0, 500),
      };
    }

    case 'ADD_DEAL_ACTIVITY': {
      const now = new Date().toISOString();
      const activity: DealActivity = { id: uuidv4(), dealId: action.payload.dealId, type: action.payload.type, description: action.payload.description, userId: state.currentUser.id, createdAt: now };
      return { ...state, deals: state.deals.map(d => d.id === action.payload.dealId ? { ...d, activities: [...d.activities, activity], updatedAt: now } : d) };
    }

    case 'CREATE_AUTOMATION': {
      const newRule: AutomationRule = { ...action.payload, id: uuidv4(), timesTriggered: 0, createdAt: new Date().toISOString() };
      return { ...state, automations: [...state.automations, newRule], activityLogs: [makeLog(state.currentUser.id, 'created_automation', `יצר אוטומציה "${newRule.name}"`, newRule.id, 'automation'), ...state.activityLogs].slice(0, 500) };
    }

    case 'UPDATE_AUTOMATION':
      return { ...state, automations: state.automations.map(a => a.id === action.payload.id ? action.payload : a) };

    case 'DELETE_AUTOMATION':
      return { ...state, automations: state.automations.filter(a => a.id !== action.payload) };

    case 'TOGGLE_AUTOMATION': {
      const toggledAuto = state.automations.find(a => a.id === action.payload);
      const willBeEnabled = !toggledAuto?.enabled;
      return { ...state, automations: state.automations.map(a => a.id === action.payload ? { ...a, enabled: !a.enabled } : a), activityLogs: [makeLog(state.currentUser.id, 'toggled_automation', `${willBeEnabled ? 'הפעיל' : 'השבית'} אוטומציה "${toggledAuto?.name || ''}"`, action.payload, 'automation'), ...state.activityLogs].slice(0, 500) };
    }

    case 'ADD_AI_MESSAGE':
      return { ...state, aiMessages: [...state.aiMessages, action.payload] };

    case 'CLEAR_AI_MESSAGES':
      return { ...state, aiMessages: [] };

    case 'COMPLETE_ONBOARDING': {
      const avatar = action.payload.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      const role = action.payload.isAdmin ? 'owner' : 'member';
      const updatedUser = {
        ...state.currentUser,
        name: action.payload.name,
        email: action.payload.email || state.currentUser.email,
        phone: action.payload.phone,
        jobTitle: action.payload.jobTitle,
        company: action.payload.company,
        companyAddress: action.payload.companyAddress,
        avatar,
        role: role as import('./types').UserRole,
      };
      return {
        ...state,
        currentUser: updatedUser,
        users: state.users.map(u => u.id === state.currentUser.id ? updatedUser : u),
        workspaceName: action.payload.company || state.workspaceName,
        onboardingComplete: true,
        appLocked: false,
        activityLogs: [makeLog(updatedUser.id, 'completed_onboarding', 'השלים הגדרת פרופיל ראשונית', updatedUser.id, 'user'), ...state.activityLogs].slice(0, 500),
      };
    }

    case 'SET_USER_ROLE': {
      const roleTarget = state.users.find(u => u.id === action.payload.userId);
      const updatedUsers = state.users.map(u =>
        u.id === action.payload.userId ? { ...u, role: action.payload.role } : u
      );
      return { ...state, users: updatedUsers, activityLogs: [makeLog(state.currentUser.id, 'changed_role', `שינה הרשאות של ${roleTarget?.name || ''} ל-${action.payload.role}`, action.payload.userId, 'user'), ...state.activityLogs].slice(0, 500) };
    }

    case 'UNLOCK_APP':
      return { ...state, appLocked: false };

    case 'LOCK_APP': {
      if (typeof window !== 'undefined') {
        import('./password').then(({ clearSession }) => clearSession());
      }
      return { ...state, appLocked: true };
    }

    case 'OPEN_PROFILE_MODAL':
      return { ...state, profileModalOpen: true };

    case 'CLOSE_PROFILE_MODAL':
      return { ...state, profileModalOpen: false };

    case 'UPDATE_PROFILE': {
      const updatedUser = { ...state.currentUser, ...action.payload };
      const avatar = updatedUser.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      updatedUser.avatar = avatar;
      return {
        ...state,
        currentUser: updatedUser,
        users: state.users.map(u => u.id === state.currentUser.id ? updatedUser : u),
        profileModalOpen: false,
        activityLogs: [makeLog(state.currentUser.id, 'updated_profile', 'עדכן פרטי פרופיל', state.currentUser.id, 'user'), ...state.activityLogs].slice(0, 500),
      };
    }

    case 'SET_ACTIVE_EVENT':
      return { ...state, activeEventId: action.payload, activeSection: 'events' };

    case 'CREATE_EVENT': {
      const now = new Date().toISOString();
      const newEvent: Event = { ...action.payload, id: uuidv4(), createdAt: now, updatedAt: now };
      const eventNotifications: Notification[] = state.users.map(u => ({
        id: uuidv4(), userId: u.id, type: 'event_created' as const,
        message: `אירוע חדש נוצר: "${newEvent.name}"`,
        taskId: null, projectId: null, read: false, createdAt: now,
      }));
      return {
        ...state,
        events: [...state.events, newEvent],
        activeEventId: newEvent.id,
        notifications: [...eventNotifications, ...state.notifications],
        activityLogs: [makeLog(state.currentUser.id, 'created_event', `יצר אירוע "${newEvent.name}"`, newEvent.id, 'event'), ...state.activityLogs].slice(0, 500)
      };
    }

    case 'UPDATE_EVENT': {
      const now = new Date().toISOString();
      return {
        ...state,
        events: state.events.map(e => e.id === action.payload.id ? { ...e, ...action.payload, updatedAt: now } : e),
        activityLogs: [makeLog(state.currentUser.id, 'updated_event', `עדכן אירוע "${action.payload.name || ''}"`, action.payload.id, 'event'), ...state.activityLogs].slice(0, 500)
      };
    }

    case 'UPDATE_PROJECT': {
      const now = new Date().toISOString();
      return { ...state, projects: state.projects.map(p => p.id === action.payload.id ? { ...p, ...action.payload, updatedAt: now } : p) };
    }

    case 'ARCHIVE_EVENT': {
      return {
        ...state,
        events: state.events.map(e => e.id === action.payload ? { ...e, status: 'archived' as EventStatus } : e),
        activityLogs: [makeLog(state.currentUser.id, 'archived_event', `העביר אירוע לארכיון`, action.payload, 'event'), ...state.activityLogs].slice(0, 500)
      };
    }

    case 'DUPLICATE_EVENT': {
      const now = new Date().toISOString();
      const source = state.events.find(e => e.id === action.payload.sourceEventId);
      if (!source) return state;
      const newEventId = uuidv4();
      const sourceProjects = state.projects.filter(p => p.eventId === source.id);
      const projectIdMap: Record<string, string> = {};
      const newProjects = sourceProjects.map(p => {
        const newId = uuidv4();
        projectIdMap[p.id] = newId;
        return { ...p, id: newId, eventId: newEventId, createdAt: now, updatedAt: now };
      });
      const sourceCampaigns = state.campaigns.filter(c => sourceProjects.some(p => p.id === c.projectId));
      const newCampaigns = sourceCampaigns.map(c => ({
        ...c,
        id: uuidv4(),
        projectId: projectIdMap[c.projectId] || c.projectId,
        createdAt: now,
        updatedAt: now,
      }));
      const newGroups = newProjects.map(p => ({
        id: uuidv4(),
        projectId: p.id,
        name: 'משימות',
        color: p.color,
        order: 0,
      }));
      const newEvent: Event = {
        ...source,
        id: newEventId,
        name: action.payload.newName,
        date: action.payload.newDate,
        endDate: null,
        status: 'draft',
        parentEventId: source.id,
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...state,
        events: [...state.events, newEvent],
        projects: [...state.projects, ...newProjects],
        campaigns: [...state.campaigns, ...newCampaigns],
        groups: [...state.groups, ...newGroups],
        activeEventId: newEventId,
        activityLogs: [makeLog(state.currentUser.id, 'created_event', `שכפל אירוע "${newEvent.name}"`, newEventId, 'event'), ...state.activityLogs].slice(0, 500),
      };
    }

    case 'CREATE_CAMPAIGN': {
      const now = new Date().toISOString();
      const newCampaign: Campaign = { ...action.payload, id: uuidv4(), createdAt: now, updatedAt: now };
      return {
        ...state,
        campaigns: [...state.campaigns, newCampaign],
        activityLogs: [makeLog(state.currentUser.id, 'created_campaign', `יצר קמפיין "${newCampaign.name}"`, newCampaign.id, 'campaign'), ...state.activityLogs].slice(0, 500)
      };
    }

    case 'UPDATE_CAMPAIGN': {
      const now = new Date().toISOString();
      return { ...state, campaigns: state.campaigns.map(c => c.id === action.payload.id ? { ...c, ...action.payload, updatedAt: now } : c) };
    }

    case 'DELETE_CAMPAIGN': {
      const delCampaign = state.campaigns.find(c => c.id === action.payload);
      return {
        ...state,
        campaigns: state.campaigns.filter(c => c.id !== action.payload),
        tasks: state.tasks.map(t => t.campaignId === action.payload ? { ...t, campaignId: null } : t),
        activityLogs: [makeLog(state.currentUser.id, 'deleted_campaign', `מחק קמפיין "${delCampaign?.name || ''}"`, action.payload, 'campaign'), ...state.activityLogs].slice(0, 500)
      };
    }

    // ── Speakers ──
    case 'OPEN_SPEAKER_MODAL':
      return { ...state, speakerModalId: action.payload };
    case 'CLOSE_SPEAKER_MODAL':
      return { ...state, speakerModalId: null };

    case 'CREATE_SPEAKER': {
      const newSpeaker: Speaker = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        speakers: [...state.speakers, newSpeaker],
        speakerModalId: newSpeaker.id,
      };
    }

    case 'UPDATE_SPEAKER': {
      return {
        ...state,
        speakers: state.speakers.map(s =>
          s.id === action.payload.id
            ? { ...s, ...action.payload, updatedAt: new Date().toISOString() }
            : s
        ),
      };
    }

    case 'DELETE_SPEAKER': {
      return {
        ...state,
        speakerModalId: state.speakerModalId === action.payload ? null : state.speakerModalId,
        speakers: state.speakers.filter(s => s.id !== action.payload),
        panels: state.panels.map(p => ({
          ...p,
          speakerIds: p.speakerIds.filter(id => id !== action.payload),
          moderatorId: p.moderatorId === action.payload ? null : p.moderatorId,
        })),
      };
    }

    // ── Panels ──
    case 'CREATE_PANEL': {
      const newPanel: Panel = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // update speaker.panelIds
      const updatedSpeakersForPanel = state.speakers.map(s =>
        action.payload.speakerIds.includes(s.id)
          ? { ...s, panelIds: [...new Set([...s.panelIds, newPanel.id])] }
          : s
      );
      return { ...state, panels: [...state.panels, newPanel], speakers: updatedSpeakersForPanel };
    }

    case 'UPDATE_PANEL': {
      return {
        ...state,
        panels: state.panels.map(p =>
          p.id === action.payload.id
            ? { ...p, ...action.payload, updatedAt: new Date().toISOString() }
            : p
        ),
      };
    }

    case 'DELETE_PANEL': {
      return {
        ...state,
        panels: state.panels.filter(p => p.id !== action.payload),
        speakers: state.speakers.map(s => ({
          ...s,
          panelIds: s.panelIds.filter(id => id !== action.payload),
        })),
      };
    }

    case 'ADD_SPEAKER_TO_PANEL': {
      const { panelId, speakerId } = action.payload;
      return {
        ...state,
        panels: state.panels.map(p =>
          p.id === panelId && !p.speakerIds.includes(speakerId)
            ? { ...p, speakerIds: [...p.speakerIds, speakerId], updatedAt: new Date().toISOString() }
            : p
        ),
        speakers: state.speakers.map(s =>
          s.id === speakerId && !s.panelIds.includes(panelId)
            ? { ...s, panelIds: [...s.panelIds, panelId] }
            : s
        ),
      };
    }

    case 'REMOVE_SPEAKER_FROM_PANEL': {
      const { panelId: pId, speakerId: sId } = action.payload;
      return {
        ...state,
        panels: state.panels.map(p =>
          p.id === pId
            ? { ...p, speakerIds: p.speakerIds.filter(id => id !== sId), moderatorId: p.moderatorId === sId ? null : p.moderatorId, updatedAt: new Date().toISOString() }
            : p
        ),
        speakers: state.speakers.map(s =>
          s.id === sId ? { ...s, panelIds: s.panelIds.filter(id => id !== pId) } : s
        ),
      };
    }

    case 'CREATE_BRAND': {
      const newBrand: Brand = {
        id: uuidv4(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { ...state, brands: [...state.brands, newBrand] };
    }

    case 'TOGGLE_CHAT_PANEL':
      return { ...state, chatPanelOpen: !state.chatPanelOpen };

    case 'OPEN_CHAT':
      return { ...state, chatPanelOpen: true, activeChatUserId: action.payload };

    case 'CLOSE_CHAT_CONVERSATION':
      return { ...state, activeChatUserId: null };

    case 'SEND_CHAT_MESSAGE': {
      const { toUserId, text } = action.payload;
      const now = new Date().toISOString();
      const existingConv = state.chats.find(c =>
        c.participantIds.includes(state.currentUser.id) && c.participantIds.includes(toUserId)
      );
      const convId = existingConv?.id || uuidv4();
      const newMsg: ChatMessage = {
        id: uuidv4(),
        conversationId: convId,
        fromUserId: state.currentUser.id,
        text,
        createdAt: now,
        readByIds: [state.currentUser.id],
      };
      if (existingConv) {
        return { ...state, chats: state.chats.map(c => c.id === convId ? { ...c, messages: [...c.messages, newMsg] } : c) };
      } else {
        const newConv: ChatConversation = {
          id: convId,
          participantIds: [state.currentUser.id, toUserId],
          messages: [newMsg],
          createdAt: now,
        };
        return { ...state, chats: [...state.chats, newConv] };
      }
    }

    case 'MARK_CHAT_READ': {
      return {
        ...state,
        chats: state.chats.map(c =>
          c.id === action.payload.conversationId
            ? { ...c, messages: c.messages.map(m => m.readByIds.includes(state.currentUser.id) ? m : { ...m, readByIds: [...m.readByIds, state.currentUser.id] }) }
            : c
        ),
      };
    }

    case 'DISMISS_WELCOME':
      return { ...state, welcomeTaskId: null };

    case 'DISMISS_CELEBRATION':
      return { ...state, celebrationTaskId: null };

    default:
      return state;
  }
}

// Extract only data fields (not UI state) for syncing
function getSharedData(state: AppState) {
  const shared: Partial<AppState> = { ...state };
  UI_ONLY_FIELDS.forEach(f => delete shared[f as keyof typeof shared]);
  return shared;
}

// Check if action should trigger a sync
function isSyncAction(action: Action): boolean {
  const uiOnlyActions = [
    'TOGGLE_NOTIFICATIONS_PANEL', 'TOGGLE_AI_PANEL', 'TOGGLE_CHAT_PANEL',
    'OPEN_TASK_MODAL', 'CLOSE_TASK_MODAL',
    'OPEN_NEW_PROJECT_MODAL', 'CLOSE_NEW_PROJECT_MODAL',
    'OPEN_NEW_EVENT_MODAL', 'CLOSE_NEW_EVENT_MODAL',
    'OPEN_INVITE_MODAL', 'CLOSE_INVITE_MODAL',
    'OPEN_CHAT', 'CLOSE_CHAT_CONVERSATION', 'MARK_CHAT_READ',
    'DISMISS_WELCOME', 'DISMISS_CELEBRATION',
    'SET_ACTIVE_VIEW', 'SET_ACTIVE_SECTION', 'SET_CRM_VIEW',
    'SET_ACTIVE_PROJECT', 'SET_ACTIVE_EVENT', 'ADD_AI_MESSAGE', 'CLEAR_AI_MESSAGES',
    'LOAD_STATE',
  ];
  return !uiOnlyActions.includes(action.type);
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

import { getStoredPasswordHash, isSessionValid } from './password';

function loadOnboardingFromStorage(): Partial<AppState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('atelier_onboarding');
    if (!raw) return {};
    const saved = JSON.parse(raw);
    const hasPassword = !!getStoredPasswordHash();
    // If password set but session still valid — stay unlocked
    const appLocked = hasPassword && !isSessionValid();
    return { ...saved, appLocked };
  } catch { return {}; }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ...INITIAL_STATE, ...loadOnboardingFromStorage() });
  const isLoadingRef = useRef(false);
  const lastSyncRef = useRef<string>('');
  const pendingSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist onboarding state to localStorage
  useEffect(() => {
    if (state.onboardingComplete) {
      localStorage.setItem('atelier_onboarding', JSON.stringify({
        onboardingComplete: true,
        currentUser: state.currentUser,
        workspaceName: state.workspaceName,
      }));
    }
  }, [state.onboardingComplete, state.currentUser]);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      const sb = getSupabase();
      if (!sb) return;
      isLoadingRef.current = true;
      try {
        const { data, error } = await sb
          .from('workspace_state')
          .select('data, updated_at')
          .eq('id', 'main')
          .single();

        if (error) {
          console.warn('Supabase load error, using local state:', error.message);
          return;
        }

        if (data?.data && Object.keys(data.data).length > 0) {
          lastSyncRef.current = data.updated_at;
          dispatch({
            type: 'LOAD_STATE',
            payload: { ...INITIAL_STATE, ...data.data, aiMessages: [] }
          });
        } else {
          // First time — save initial state to Supabase
          const shared = getSharedData(INITIAL_STATE);
          await sb
            .from('workspace_state')
            .upsert({ id: 'main', data: shared, updated_at: new Date().toISOString() });
        }
      } catch (e) {
        console.warn('Failed to load from Supabase:', e);
      } finally {
        isLoadingRef.current = false;
      }
    }

    loadFromSupabase();

    const sb = getSupabase();
    if (!sb) return;

    // Realtime subscription — when another user makes changes
    const channel = sb
      .channel('workspace_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'workspace_state',
        filter: 'id=eq.main',
      }, (payload) => {
        if (isLoadingRef.current) return;
        const updatedAt = (payload.new as { updated_at: string }).updated_at;
        // Avoid re-applying our own updates
        if (updatedAt === lastSyncRef.current) return;
        lastSyncRef.current = updatedAt;
        const newData = (payload.new as { data: Partial<AppState> }).data;
        if (newData && Object.keys(newData).length > 0) {
          dispatch({ type: 'LOAD_STATE', payload: { ...INITIAL_STATE, ...newData, aiMessages: [] } });
        }
      })
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  // Save to Supabase when data changes (debounced)
  useEffect(() => {
    if (isLoadingRef.current) return;

    if (pendingSyncRef.current) clearTimeout(pendingSyncRef.current);

    pendingSyncRef.current = setTimeout(async () => {
      try {
        const sb = getSupabase();
        if (!sb) return;
        const shared = getSharedData(state);
        const now = new Date().toISOString();
        lastSyncRef.current = now;
        await sb
          .from('workspace_state')
          .upsert({ id: 'main', data: shared, updated_at: now });
      } catch (e) {
        console.warn('Failed to sync to Supabase:', e);
      }
    }, 800);

    return () => {
      if (pendingSyncRef.current) clearTimeout(pendingSyncRef.current);
    };
  }, [state.projects, state.tasks, state.groups, state.contacts, state.deals, state.automations, state.notifications, state.users, state.activityLogs, state.events, state.campaigns, state.speakers, state.panels]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
