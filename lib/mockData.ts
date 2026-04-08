import { AppState, Task, Group, Project, User, Notification, Contact, Deal, AutomationRule } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Yuri Alt', email: 'yuri@example.com', avatar: 'YA', color: '#0073ea', role: 'owner', status: 'active' },
  { id: 'user-2', name: 'Dana Cohen', email: 'dana@example.com', avatar: 'DC', color: '#9c27b0', role: 'member', status: 'active' },
  { id: 'user-3', name: 'Ilan Mizrahi', email: 'ilan@example.com', avatar: 'IM', color: '#f44336', role: 'member', status: 'active' },
  { id: 'user-4', name: 'Sara Levi', email: 'sara@example.com', avatar: 'SL', color: '#4caf50', role: 'viewer', status: 'pending' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Website Redesign', description: 'Complete overhaul of the company website', color: '#0073ea', icon: '🌐', memberIds: ['user-1', 'user-2', 'user-3'], defaultView: 'table', createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-03-10T12:00:00Z' },
  { id: 'proj-2', name: 'Mobile App Launch', description: 'Product launch plan for Q2', color: '#e2445c', icon: '📱', memberIds: ['user-1', 'user-2', 'user-4'], defaultView: 'kanban', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-03-15T08:00:00Z' },
  { id: 'proj-3', name: 'Marketing Campaign', description: 'Q2 marketing initiatives', color: '#fdab3d', icon: '📣', memberIds: ['user-1', 'user-3'], defaultView: 'roadmap', createdAt: '2026-03-01T11:00:00Z', updatedAt: '2026-03-17T14:00:00Z' },
];

export const MOCK_GROUPS: Group[] = [
  { id: 'grp-1', projectId: 'proj-1', name: 'Planning', color: '#0073ea', order: 0 },
  { id: 'grp-2', projectId: 'proj-1', name: 'Design', color: '#e2445c', order: 1 },
  { id: 'grp-3', projectId: 'proj-1', name: 'Development', color: '#fdab3d', order: 2 },
  { id: 'grp-4', projectId: 'proj-2', name: 'Research', color: '#00c875', order: 0 },
  { id: 'grp-5', projectId: 'proj-2', name: 'Development', color: '#9c27b0', order: 1 },
  { id: 'grp-6', projectId: 'proj-3', name: 'Strategy', color: '#fdab3d', order: 0 },
  { id: 'grp-7', projectId: 'proj-3', name: 'Execution', color: '#e2445c', order: 1 },
];

export const MOCK_TASKS: Task[] = [
  { id: 'task-1', projectId: 'proj-1', groupId: 'grp-1', title: 'Define project scope', description: 'Identify all deliverables and stakeholders', status: 'done', priority: 'high', assigneeIds: ['user-1'], startDate: '2026-01-16', dueDate: '2026-01-20', order: 0, comments: [], subItems: [], tags: [], timeTracked: 120, createdAt: '2026-01-16T09:00:00Z', updatedAt: '2026-01-20T09:00:00Z' },
  { id: 'task-2', projectId: 'proj-1', groupId: 'grp-1', title: 'Create wireframes', description: 'Low-fi wireframes for all main pages', status: 'done', priority: 'high', assigneeIds: ['user-2'], startDate: '2026-01-21', dueDate: '2026-02-01', order: 1, comments: [], subItems: [], tags: ['design'], timeTracked: 240, createdAt: '2026-01-21T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
  { id: 'task-3', projectId: 'proj-1', groupId: 'grp-2', title: 'Design homepage mockup', description: 'Full visual design for the hero section', status: 'in_progress', priority: 'critical', assigneeIds: ['user-2', 'user-3'], startDate: '2026-02-05', dueDate: '2026-03-25', order: 0, comments: [{ id: 'c-1', taskId: 'task-3', userId: 'user-1', text: 'Looking great so far!', createdAt: '2026-03-10T10:00:00Z' }], subItems: [{ id: 'sub-1', taskId: 'task-3', title: 'Hero section', done: true }, { id: 'sub-2', taskId: 'task-3', title: 'Footer', done: false }], tags: ['design', 'ui'], timeTracked: 480, createdAt: '2026-02-05T09:00:00Z', updatedAt: '2026-03-10T09:00:00Z' },
  { id: 'task-4', projectId: 'proj-1', groupId: 'grp-2', title: 'Mobile responsive design', description: 'Ensure all pages work on mobile', status: 'todo', priority: 'high', assigneeIds: ['user-2'], startDate: '2026-03-26', dueDate: '2026-04-10', order: 1, comments: [], subItems: [], tags: ['mobile'], timeTracked: 0, createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  { id: 'task-5', projectId: 'proj-1', groupId: 'grp-3', title: 'Set up Next.js project', description: 'Initialize the codebase with TypeScript', status: 'stuck', priority: 'medium', assigneeIds: ['user-3'], startDate: '2026-02-15', dueDate: '2026-02-20', order: 0, comments: [], subItems: [], tags: ['dev'], timeTracked: 60, createdAt: '2026-02-15T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  { id: 'task-6', projectId: 'proj-1', groupId: 'grp-3', title: 'Implement navigation', description: 'Build the main navigation component', status: 'backlog', priority: 'medium', assigneeIds: [], startDate: null, dueDate: '2026-04-20', order: 1, comments: [], subItems: [], tags: [], timeTracked: 0, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
  { id: 'task-7', projectId: 'proj-2', groupId: 'grp-4', title: 'User interviews', description: 'Conduct 10 user interviews', status: 'done', priority: 'critical', assigneeIds: ['user-1', 'user-2'], startDate: '2026-02-01', dueDate: '2026-02-28', order: 0, comments: [], subItems: [], tags: ['research'], timeTracked: 600, createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-28T09:00:00Z' },
  { id: 'task-8', projectId: 'proj-2', groupId: 'grp-4', title: 'Competitive analysis', description: 'Review top 5 competitors', status: 'in_progress', priority: 'high', assigneeIds: ['user-2'], startDate: '2026-03-01', dueDate: '2026-03-28', order: 1, comments: [], subItems: [], tags: ['research'], timeTracked: 180, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-10T09:00:00Z' },
  { id: 'task-9', projectId: 'proj-2', groupId: 'grp-5', title: 'Build authentication', description: 'OAuth + email/password login', status: 'todo', priority: 'high', assigneeIds: ['user-3'], startDate: '2026-04-01', dueDate: '2026-04-15', order: 0, comments: [], subItems: [], tags: ['dev', 'auth'], timeTracked: 0, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z' },
  { id: 'task-10', projectId: 'proj-2', groupId: 'grp-5', title: 'Push notifications', description: 'FCM integration for iOS and Android', status: 'backlog', priority: 'medium', assigneeIds: [], startDate: null, dueDate: '2026-05-01', order: 1, comments: [], subItems: [], tags: [], timeTracked: 0, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z' },
  { id: 'task-11', projectId: 'proj-3', groupId: 'grp-6', title: 'Q2 campaign brief', description: 'Define goals and budget for Q2', status: 'in_progress', priority: 'critical', assigneeIds: ['user-1'], startDate: '2026-03-01', dueDate: '2026-03-22', order: 0, comments: [], subItems: [], tags: ['strategy'], timeTracked: 90, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-15T09:00:00Z' },
  { id: 'task-12', projectId: 'proj-3', groupId: 'grp-6', title: 'Target audience research', description: 'Define personas for each channel', status: 'todo', priority: 'high', assigneeIds: ['user-3'], startDate: '2026-03-20', dueDate: '2026-04-05', order: 1, comments: [], subItems: [], tags: [], timeTracked: 0, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
  { id: 'task-13', projectId: 'proj-3', groupId: 'grp-7', title: 'Social media content calendar', description: '3-month posting schedule', status: 'todo', priority: 'medium', assigneeIds: ['user-3'], startDate: '2026-04-07', dueDate: '2026-04-30', order: 0, comments: [], subItems: [], tags: ['social'], timeTracked: 0, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z' },
  { id: 'task-14', projectId: 'proj-3', groupId: 'grp-7', title: 'Launch email campaign', description: 'Design + send email blast', status: 'backlog', priority: 'high', assigneeIds: [], startDate: null, dueDate: '2026-05-15', order: 1, comments: [], subItems: [], tags: ['email'], timeTracked: 0, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', userId: 'user-1', type: 'assigned', message: 'Dana Cohen assigned you to "Design homepage mockup"', taskId: 'task-3', projectId: 'proj-1', read: false, createdAt: '2026-03-17T14:00:00Z' },
  { id: 'notif-2', userId: 'user-1', type: 'commented', message: 'Ilan Mizrahi commented on "Set up Next.js project"', taskId: 'task-5', projectId: 'proj-1', read: false, createdAt: '2026-03-16T10:00:00Z' },
  { id: 'notif-3', userId: 'user-1', type: 'status_changed', message: '"User interviews" status changed to Done', taskId: 'task-7', projectId: 'proj-2', read: true, createdAt: '2026-03-15T08:00:00Z' },
];

export const MOCK_CONTACTS: Contact[] = [
  { id: 'contact-1', name: 'Alex Johnson', email: 'alex@techcorp.com', phone: '+1 555-0101', company: 'TechCorp', position: 'CTO', status: 'customer', tags: ['enterprise', 'saas'], ownerId: 'user-1', notes: 'Key decision maker. Very technical background.', avatar: 'AJ', linkedDealIds: ['deal-1'], createdAt: '2026-01-10T09:00:00Z', updatedAt: '2026-03-20T09:00:00Z', lastActivityAt: '2026-03-20T09:00:00Z' },
  { id: 'contact-2', name: 'Maria Santos', email: 'maria@startup.io', phone: '+1 555-0102', company: 'StartupIO', position: 'CEO', status: 'prospect', tags: ['startup', 'hot-lead'], ownerId: 'user-2', notes: 'Met at SaaStr 2026. Very interested in our enterprise plan.', avatar: 'MS', linkedDealIds: ['deal-2'], createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-03-18T14:00:00Z', lastActivityAt: '2026-03-18T14:00:00Z' },
  { id: 'contact-3', name: 'David Kim', email: 'david@enterprise.co', phone: '+1 555-0103', company: 'Enterprise Co', position: 'VP Sales', status: 'active', tags: ['enterprise'], ownerId: 'user-1', notes: 'Evaluating multiple vendors. Price sensitive.', avatar: 'DK', linkedDealIds: ['deal-3'], createdAt: '2026-02-20T08:00:00Z', updatedAt: '2026-03-22T11:00:00Z', lastActivityAt: '2026-03-22T11:00:00Z' },
  { id: 'contact-4', name: 'Sarah Park', email: 'sarah@agency.com', phone: '+1 555-0104', company: 'Creative Agency', position: 'Marketing Director', status: 'customer', tags: ['agency', 'recurring'], ownerId: 'user-3', notes: 'Long-term customer. Uses basic plan.', avatar: 'SP', linkedDealIds: [], createdAt: '2026-01-05T09:00:00Z', updatedAt: '2026-03-10T16:00:00Z', lastActivityAt: '2026-03-10T16:00:00Z' },
  { id: 'contact-5', name: 'Mike Wilson', email: 'mike@oldclient.com', phone: '+1 555-0105', company: 'Old Client Inc', position: 'CFO', status: 'inactive', tags: ['churned'], ownerId: 'user-1', notes: 'Churned Q4 2025. Budget cuts.', avatar: 'MW', linkedDealIds: [], createdAt: '2025-06-01T09:00:00Z', updatedAt: '2025-12-15T09:00:00Z', lastActivityAt: '2025-12-15T09:00:00Z' },
  { id: 'contact-6', name: 'Lisa Chen', email: 'lisa@fintech.com', phone: '+1 555-0106', company: 'FinTech Labs', position: 'Head of Product', status: 'prospect', tags: ['fintech', 'demo-done'], ownerId: 'user-2', notes: 'Completed demo. Waiting for security review.', avatar: 'LC', linkedDealIds: ['deal-4', 'deal-5'], createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-25T13:00:00Z', lastActivityAt: '2026-03-25T13:00:00Z' },
];

export const MOCK_DEALS: Deal[] = [
  { id: 'deal-1', title: 'TechCorp Enterprise License', contactId: 'contact-1', stage: 'closed_won', value: 48000, currency: 'USD', probability: 100, ownerId: 'user-1', expectedCloseDate: '2026-02-28', notes: 'Annual enterprise license. 3-year contract.', tags: ['enterprise'], activities: [{ id: 'act-1', dealId: 'deal-1', type: 'stage_changed', description: 'Deal closed! Signed contract.', userId: 'user-1', createdAt: '2026-02-28T15:00:00Z' }], createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-02-28T15:00:00Z' },
  { id: 'deal-2', title: 'StartupIO Growth Plan', contactId: 'contact-2', stage: 'proposal', value: 12000, currency: 'USD', probability: 50, ownerId: 'user-2', expectedCloseDate: '2026-04-15', notes: 'Annual growth plan subscription.', tags: ['startup'], activities: [{ id: 'act-2', dealId: 'deal-2', type: 'email', description: 'Sent pricing proposal.', userId: 'user-2', createdAt: '2026-03-18T10:00:00Z' }], createdAt: '2026-02-20T09:00:00Z', updatedAt: '2026-03-18T10:00:00Z' },
  { id: 'deal-3', title: 'Enterprise Co Team Plan', contactId: 'contact-3', stage: 'negotiation', value: 24000, currency: 'USD', probability: 75, ownerId: 'user-1', expectedCloseDate: '2026-04-30', notes: '50 seat team plan.', tags: ['enterprise'], activities: [{ id: 'act-3', dealId: 'deal-3', type: 'meeting', description: 'Legal review call. Negotiating on contract terms.', userId: 'user-1', createdAt: '2026-03-22T14:00:00Z' }], createdAt: '2026-02-25T09:00:00Z', updatedAt: '2026-03-22T14:00:00Z' },
  { id: 'deal-4', title: 'FinTech Labs Starter', contactId: 'contact-6', stage: 'qualified', value: 8400, currency: 'USD', probability: 25, ownerId: 'user-2', expectedCloseDate: '2026-05-15', notes: 'Security review in progress.', tags: ['fintech'], activities: [], createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-20T09:00:00Z' },
  { id: 'deal-5', title: 'FinTech Labs API Add-on', contactId: 'contact-6', stage: 'lead', value: 6000, currency: 'USD', probability: 10, ownerId: 'user-3', expectedCloseDate: '2026-06-01', notes: 'Interested in API access.', tags: ['fintech', 'api'], activities: [], createdAt: '2026-03-15T09:00:00Z', updatedAt: '2026-03-15T09:00:00Z' },
  { id: 'deal-6', title: 'Old Client Renewal Attempt', contactId: 'contact-5', stage: 'closed_lost', value: 5000, currency: 'USD', probability: 0, ownerId: 'user-1', expectedCloseDate: '2026-01-31', notes: 'Budget was cut. May revisit Q3.', tags: [], activities: [{ id: 'act-6', dealId: 'deal-6', type: 'note', description: 'Lost deal. Budget cuts cited as reason.', userId: 'user-1', createdAt: '2026-01-30T12:00:00Z' }], createdAt: '2026-01-10T09:00:00Z', updatedAt: '2026-01-30T12:00:00Z' },
];

export const MOCK_AUTOMATIONS: AutomationRule[] = [
  { id: 'auto-1', name: 'Notify on task done', enabled: true, trigger: 'status_changed', triggerValue: 'done', action: 'send_notification', actionValue: 'Task marked as done!', projectId: null, timesTriggered: 14, createdAt: '2026-01-20T09:00:00Z' },
  { id: 'auto-2', name: 'Assign stuck tasks to owner', enabled: true, trigger: 'status_changed', triggerValue: 'stuck', action: 'assign_to', actionValue: 'user-1', projectId: 'proj-1', timesTriggered: 3, createdAt: '2026-02-01T09:00:00Z' },
  { id: 'auto-3', name: 'Alert on deal won', enabled: true, trigger: 'deal_stage_changed', triggerValue: 'closed_won', action: 'send_notification', actionValue: '🎉 Deal closed!', projectId: null, timesTriggered: 1, createdAt: '2026-02-15T09:00:00Z' },
  { id: 'auto-4', name: 'Create follow-up on overdue', enabled: false, trigger: 'due_date_passed', triggerValue: '', action: 'create_task', actionValue: 'Follow up on overdue task', projectId: null, timesTriggered: 0, createdAt: '2026-03-01T09:00:00Z' },
];

export const INITIAL_STATE: AppState = {
  currentUser: MOCK_USERS[0],
  users: MOCK_USERS,
  projects: MOCK_PROJECTS,
  tasks: MOCK_TASKS,
  groups: MOCK_GROUPS,
  notifications: MOCK_NOTIFICATIONS,
  contacts: MOCK_CONTACTS,
  deals: MOCK_DEALS,
  automations: MOCK_AUTOMATIONS,
  aiMessages: [],
  activeProjectId: 'proj-1',
  activeView: 'table',
  activeSection: 'projects',
  activeCRMView: 'contacts',
  notificationsPanelOpen: false,
  taskModalId: null,
  newProjectModalOpen: false,
  inviteModalOpen: false,
  aiPanelOpen: false,
  contactModalId: null,
  dealModalId: null,
  onboardingComplete: false,
};
