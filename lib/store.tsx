'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import {
  AppState, Task, Project, User, Notification, Comment, Group, BoardView,
  AppSection, CRMView, Contact, Deal, DealActivity, AutomationRule, AIMessage,
  DealStage, SubItem,
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
  | { type: 'ADD_COMMENT'; payload: { taskId: string; text: string } }
  | { type: 'ADD_SUB_ITEM'; payload: { taskId: string; title: string } }
  | { type: 'TOGGLE_SUB_ITEM'; payload: { taskId: string; subItemId: string } }
  | { type: 'CREATE_GROUP'; payload: { projectId: string; name: string } }
  | { type: 'INVITE_USER'; payload: { email: string; projectId: string } }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CREATE_CONTACT'; payload: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'avatar' | 'linkedDealIds'> }
  | { type: 'UPDATE_CONTACT'; payload: Partial<Contact> & { id: string } }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'CREATE_DEAL'; payload: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'activities'> }
  | { type: 'UPDATE_DEAL'; payload: Partial<Deal> & { id: string } }
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
  | { type: 'COMPLETE_ONBOARDING'; payload: { name: string; jobTitle: string; company: string; companyAddress: string; phone: string; email: string; isAdmin: boolean } }
  | { type: 'SET_USER_ROLE'; payload: { userId: string; role: import('./types').UserRole } };

// Fields that should NOT be synced to Supabase (UI-only state)
const UI_ONLY_FIELDS: (keyof AppState)[] = [
  'notificationsPanelOpen',
  'taskModalId',
  'newProjectModalOpen',
  'inviteModalOpen',
  'aiPanelOpen',
  'contactModalId',
  'dealModalId',
  'aiMessages',
  'onboardingComplete',
];

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProjectId: action.payload, taskModalId: null, activeSection: 'projects' };

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
      return { ...state, projects: [...state.projects, newProject], groups: [...state.groups, defaultGroup], activeProjectId: newProject.id, newProjectModalOpen: false, activeSection: 'projects' };
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
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'UPDATE_TASK': {
      const now = new Date().toISOString();
      const updatedTasks = state.tasks.map(t =>
        t.id === action.payload.id ? { ...t, ...action.payload, updatedAt: now } : t
      );
      let notifications = state.notifications;
      if (action.payload.assigneeIds) {
        const oldTask = state.tasks.find(t => t.id === action.payload.id);
        const newAssignees = action.payload.assigneeIds.filter(id => !oldTask?.assigneeIds.includes(id));
        newAssignees.forEach(assigneeId => {
          const assignee = state.users.find(u => u.id === assigneeId);
          if (assignee && assigneeId !== state.currentUser.id) {
            const task = state.tasks.find(t => t.id === action.payload.id);
            notifications = [{ id: uuidv4(), userId: assigneeId, type: 'assigned', message: `${state.currentUser.name} assigned you to "${task?.title}"`, taskId: action.payload.id, projectId: task?.projectId || null, read: false, createdAt: now }, ...notifications];
          }
        });
      }
      return { ...state, tasks: updatedTasks, notifications };
    }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };

    case 'MOVE_TASK': {
      const now = new Date().toISOString();
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, status: action.payload.newStatus, updatedAt: now } : t) };
    }

    case 'ADD_COMMENT': {
      const now = new Date().toISOString();
      const comment: Comment = { id: uuidv4(), taskId: action.payload.taskId, userId: state.currentUser.id, text: action.payload.text, createdAt: now };
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.taskId ? { ...t, comments: [...t.comments, comment], updatedAt: now } : t) };
    }

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
      return { ...state, groups: [...state.groups, newGroup] };
    }

    case 'INVITE_USER': {
      const existingUser = state.users.find(u => u.email === action.payload.email);
      if (existingUser) {
        const updatedProjects = state.projects.map(p => p.id === action.payload.projectId && !p.memberIds.includes(existingUser.id) ? { ...p, memberIds: [...p.memberIds, existingUser.id] } : p);
        return { ...state, projects: updatedProjects, inviteModalOpen: false };
      }
      const newUser: User = { id: uuidv4(), name: action.payload.email.split('@')[0], email: action.payload.email, avatar: action.payload.email.substring(0, 2).toUpperCase(), color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), role: 'member', status: 'pending' };
      const updatedProjects = state.projects.map(p => p.id === action.payload.projectId ? { ...p, memberIds: [...p.memberIds, newUser.id] } : p);
      return { ...state, users: [...state.users, newUser], projects: updatedProjects, inviteModalOpen: false };
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
      return { ...state, contacts: [...state.contacts, newContact] };
    }

    case 'UPDATE_CONTACT': {
      const now = new Date().toISOString();
      return { ...state, contacts: state.contacts.map(c => c.id === action.payload.id ? { ...c, ...action.payload, updatedAt: now, lastActivityAt: now } : c) };
    }

    case 'DELETE_CONTACT':
      return { ...state, contacts: state.contacts.filter(c => c.id !== action.payload) };

    case 'CREATE_DEAL': {
      const now = new Date().toISOString();
      const newDeal: Deal = { ...action.payload, id: uuidv4(), activities: [], createdAt: now, updatedAt: now };
      let contacts = state.contacts;
      if (newDeal.contactId) {
        contacts = contacts.map(c => c.id === newDeal.contactId ? { ...c, linkedDealIds: [...c.linkedDealIds, newDeal.id] } : c);
      }
      return { ...state, deals: [...state.deals, newDeal], contacts };
    }

    case 'UPDATE_DEAL': {
      const now = new Date().toISOString();
      return { ...state, deals: state.deals.map(d => d.id === action.payload.id ? { ...d, ...action.payload, updatedAt: now } : d) };
    }

    case 'DELETE_DEAL':
      return { ...state, deals: state.deals.filter(d => d.id !== action.payload) };

    case 'MOVE_DEAL_STAGE': {
      const now = new Date().toISOString();
      return {
        ...state,
        deals: state.deals.map(d =>
          d.id === action.payload.dealId
            ? { ...d, stage: action.payload.stage, updatedAt: now, activities: [...d.activities, { id: uuidv4(), dealId: d.id, type: 'stage_changed' as const, description: `Stage changed to ${action.payload.stage}`, userId: state.currentUser.id, createdAt: now }] }
            : d
        ),
      };
    }

    case 'ADD_DEAL_ACTIVITY': {
      const now = new Date().toISOString();
      const activity: DealActivity = { id: uuidv4(), dealId: action.payload.dealId, type: action.payload.type, description: action.payload.description, userId: state.currentUser.id, createdAt: now };
      return { ...state, deals: state.deals.map(d => d.id === action.payload.dealId ? { ...d, activities: [...d.activities, activity], updatedAt: now } : d) };
    }

    case 'CREATE_AUTOMATION': {
      const newRule: AutomationRule = { ...action.payload, id: uuidv4(), timesTriggered: 0, createdAt: new Date().toISOString() };
      return { ...state, automations: [...state.automations, newRule] };
    }

    case 'UPDATE_AUTOMATION':
      return { ...state, automations: state.automations.map(a => a.id === action.payload.id ? action.payload : a) };

    case 'DELETE_AUTOMATION':
      return { ...state, automations: state.automations.filter(a => a.id !== action.payload) };

    case 'TOGGLE_AUTOMATION':
      return { ...state, automations: state.automations.map(a => a.id === action.payload ? { ...a, enabled: !a.enabled } : a) };

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
      };
    }

    case 'SET_USER_ROLE': {
      const updatedUsers = state.users.map(u =>
        u.id === action.payload.userId ? { ...u, role: action.payload.role } : u
      );
      return { ...state, users: updatedUsers };
    }

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
    'TOGGLE_NOTIFICATIONS_PANEL', 'TOGGLE_AI_PANEL',
    'OPEN_TASK_MODAL', 'CLOSE_TASK_MODAL',
    'OPEN_NEW_PROJECT_MODAL', 'CLOSE_NEW_PROJECT_MODAL',
    'OPEN_INVITE_MODAL', 'CLOSE_INVITE_MODAL',
    'SET_ACTIVE_VIEW', 'SET_ACTIVE_SECTION', 'SET_CRM_VIEW',
    'SET_ACTIVE_PROJECT', 'ADD_AI_MESSAGE', 'CLEAR_AI_MESSAGES',
    'LOAD_STATE',
  ];
  return !uiOnlyActions.includes(action.type);
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

function loadOnboardingFromStorage(): Partial<AppState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('atelier_onboarding');
    if (!raw) return {};
    return JSON.parse(raw);
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
  }, [state.projects, state.tasks, state.groups, state.contacts, state.deals, state.automations, state.notifications, state.users]);

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
