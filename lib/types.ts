export type UserRole = 'owner' | 'member' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type TaskStatus = 'todo' | 'in_progress' | 'stuck' | 'done' | 'backlog';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type BoardView = 'table' | 'kanban' | 'roadmap' | 'calendar';
export type AppSection = 'projects' | 'dashboard' | 'crm' | 'automations' | 'ai' | 'users';
export type CRMView = 'contacts' | 'deals';
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type ContactStatus = 'prospect' | 'active' | 'customer' | 'inactive';
export type AutomationTrigger = 'task_created' | 'status_changed' | 'due_date_passed' | 'deal_stage_changed' | 'task_assigned';
export type AutomationActionType = 'send_notification' | 'change_status' | 'assign_to' | 'move_deal_stage' | 'create_task';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  role: UserRole;
  status: UserStatus;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  startDate: string | null;
  dueDate: string | null;
  groupId: string;
  order: number;
  comments: Comment[];
  subItems: SubItem[];
  tags: string[];
  timeTracked: number; // minutes
  createdAt: string;
  updatedAt: string;
}

export interface SubItem {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
}

export interface Group {
  id: string;
  projectId: string;
  name: string;
  color: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  memberIds: string[];
  defaultView: BoardView;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'assigned' | 'commented' | 'status_changed' | 'due_soon' | 'mentioned' | 'deal_updated' | 'automation_fired';
  message: string;
  taskId: string | null;
  projectId: string | null;
  read: boolean;
  createdAt: string;
}

// ===================== CRM =====================

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  status: ContactStatus;
  tags: string[];
  ownerId: string;
  notes: string;
  avatar: string;
  linkedDealIds: string[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface Deal {
  id: string;
  title: string;
  contactId: string | null;
  stage: DealStage;
  value: number;
  currency: string;
  probability: number;
  ownerId: string;
  expectedCloseDate: string | null;
  notes: string;
  tags: string[];
  activities: DealActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface DealActivity {
  id: string;
  dealId: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'stage_changed';
  description: string;
  userId: string;
  createdAt: string;
}

// ===================== AUTOMATIONS =====================

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  triggerValue: string;
  action: AutomationActionType;
  actionValue: string;
  projectId: string | null;
  timesTriggered: number;
  createdAt: string;
}

// ===================== AI AGENT =====================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  actions?: AIAction[];
}

export interface AIAction {
  type: 'create_task' | 'update_task' | 'create_contact' | 'create_deal';
  label: string;
  payload: Record<string, unknown>;
}

// ===================== APP STATE =====================

export interface AppState {
  currentUser: User;
  users: User[];
  projects: Project[];
  tasks: Task[];
  groups: Group[];
  notifications: Notification[];
  contacts: Contact[];
  deals: Deal[];
  automations: AutomationRule[];
  aiMessages: AIMessage[];
  activeProjectId: string | null;
  activeView: BoardView;
  activeSection: AppSection;
  activeCRMView: CRMView;
  notificationsPanelOpen: boolean;
  taskModalId: string | null;
  newProjectModalOpen: boolean;
  inviteModalOpen: boolean;
  aiPanelOpen: boolean;
  contactModalId: string | null;
  dealModalId: string | null;
}
