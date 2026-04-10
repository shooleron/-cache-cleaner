export type UserRole = 'owner' | 'member' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type TaskStatus = 'todo' | 'in_progress' | 'stuck' | 'done' | 'backlog';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type BoardView = 'table' | 'kanban' | 'roadmap' | 'calendar';
export type AppSection = 'events' | 'dashboard' | 'crm' | 'automations' | 'ai' | 'users' | 'speakers' | 'my-tasks' | 'marketing' | 'promotion' | 'social' | 'design';
export type Department = 'operations' | 'sales' | 'marketing' | 'design' | 'content' | 'management';
export type SpeakerApprovalStatus = 'approved' | 'pending' | 'cancelled';
export type SpeakerCVStatus = 'received' | 'pending';
export type SpeakerPhotoStatus = 'uploaded' | 'missing';
export type PanelFormat = 'panel' | 'lecture' | 'interview' | 'video' | 'discussion';
export type PanelStatus = 'draft' | 'confirmed' | 'cancelled';
export type EventStatus = 'draft' | 'active' | 'completed' | 'archived';
export type CRMView = 'contacts' | 'deals';
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type ContactStatus = 'prospect' | 'active' | 'customer' | 'inactive';
export type AutomationTrigger = 'task_created' | 'status_changed' | 'due_date_passed' | 'deal_stage_changed' | 'task_assigned';
export type AutomationActionType = 'send_notification' | 'change_status' | 'assign_to' | 'move_deal_stage' | 'create_task';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  color: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  companyAddress?: string;
  jobTitle?: string;
  department?: Department;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  type: CommentType;
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
  campaignId: string | null;
  attachments: Attachment[];
  notes: TaskNote[];
  recurring: boolean;
  recurringInterval: 'daily' | 'weekly' | 'monthly' | null;
  department: Department | null;
  contactId: string | null;
  // custom columns
  checkboxValue: boolean;
  linkUrl: string | null;
  phoneValue: string | null;
  locationValue: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubItem {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
}

export type AttachmentType = 'file' | 'link' | 'drive' | 'dropbox';

export interface Attachment {
  id: string;
  taskId: string;
  type: AttachmentType;
  name: string;
  url: string;       // data URL for files, href for links/drive/dropbox
  size?: number;     // bytes
  mimeType?: string;
  uploadedBy: string;
  createdAt: string;
}

export type CommentType = 'comment' | 'note' | 'activity';

export interface TaskNote {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  projectId: string;
  name: string;
  color: string;
  order: number;
}

export interface Brand {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  endDate: string | null;
  location: string;
  status: EventStatus;
  color: string;
  icon: string;
  parentEventId: string | null;
  brandId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  projectId: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'completed' | 'paused';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  memberIds: string[];
  defaultView: BoardView;
  eventId: string | null;
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

// ===================== PRODUCT CATALOG =====================

export type ProductCategory = 'stage' | 'sponsorship' | 'digital' | 'special';

export interface SponsorshipProduct {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;           // ₪
  description: string;
  taskTemplates: string[]; // default task titles to create when sold
  requiresSpeaker: boolean;
  icon: string;
}

export interface DealLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  speakerIds: string[];  // if requiresSpeaker
  notes: string;
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
  lineItems: DealLineItem[];
  eventId: string | null;
  operationsProjectId: string | null; // set when deal closes → project created
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

// ===================== ACTIVITY LOG =====================

export type ActivityVerb =
  | 'created_task' | 'updated_task' | 'deleted_task' | 'completed_task'
  | 'commented' | 'created_project' | 'created_group'
  | 'invited_user' | 'changed_role'
  | 'created_contact' | 'updated_contact' | 'deleted_contact'
  | 'created_deal' | 'updated_deal' | 'deleted_deal' | 'moved_deal'
  | 'created_automation' | 'toggled_automation'
  | 'updated_profile' | 'completed_onboarding'
  | 'created_event' | 'updated_event' | 'archived_event'
  | 'created_campaign' | 'deleted_campaign';

export interface ActivityLog {
  id: string;
  userId: string;
  verb: ActivityVerb;
  label: string;         // human-readable Hebrew description
  entityId?: string;     // id of affected task/deal/contact etc.
  entityType?: 'task' | 'project' | 'contact' | 'deal' | 'user' | 'automation' | 'event' | 'campaign';
  createdAt: string;
}

// ===================== SPEAKERS & PANELS =====================

export interface Speaker {
  id: string;
  name: string;
  jobTitle: string;
  organization: string;
  bio: string;
  email: string;
  phone: string;
  avatar: string;          // initials fallback
  photoUrl: string | null; // uploaded photo data URL
  cvUrl: string | null;    // uploaded CV data URL
  approvalStatus: SpeakerApprovalStatus;
  cvStatus: SpeakerCVStatus;
  photoStatus: SpeakerPhotoStatus;
  panelIds: string[];
  eventIds: string[];
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Panel {
  id: string;
  eventId: string;
  name: string;
  description: string;
  format: PanelFormat;
  duration: number; // minutes
  day: string;
  hall: string;
  startTime: string | null;
  speakerIds: string[];
  moderatorId: string | null;
  status: PanelStatus;
  order: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ===================== APP STATE =====================

export interface AppState {
  currentUser: User;
  users: User[];
  brands: Brand[];
  events: Event[];
  campaigns: Campaign[];
  speakers: Speaker[];
  panels: Panel[];
  products: SponsorshipProduct[];
  projects: Project[];
  tasks: Task[];
  groups: Group[];
  notifications: Notification[];
  contacts: Contact[];
  deals: Deal[];
  automations: AutomationRule[];
  aiMessages: AIMessage[];
  activeEventId: string | null;
  activeProjectId: string | null;
  activeView: BoardView;
  activeSection: AppSection;
  activeCRMView: CRMView;
  notificationsPanelOpen: boolean;
  taskModalId: string | null;
  newProjectModalOpen: boolean;
  newEventModalOpen: boolean;
  inviteModalOpen: boolean;
  aiPanelOpen: boolean;
  contactModalId: string | null;
  dealModalId: string | null;
  speakerModalId: string | null;
  onboardingComplete: boolean;
  workspaceName: string;
  appLocked: boolean;
  profileModalOpen: boolean;
  activityLogs: ActivityLog[];
}
