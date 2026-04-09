import { AppState, Task, Group, Project, User, Notification, Contact, Deal, AutomationRule, Event, Campaign, Speaker, Panel, SponsorshipProduct } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Yuri Alt', email: 'yuri@example.com', avatar: 'YA', color: '#0073ea', role: 'owner', status: 'active' },
  { id: 'user-2', name: 'Dana Cohen', email: 'dana@example.com', avatar: 'DC', color: '#9c27b0', role: 'member', status: 'active' },
  { id: 'user-3', name: 'Ilan Mizrahi', email: 'ilan@example.com', avatar: 'IM', color: '#f44336', role: 'member', status: 'active' },
  { id: 'user-4', name: 'Sara Levi', email: 'sara@example.com', avatar: 'SL', color: '#4caf50', role: 'viewer', status: 'pending' },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'event-1',
    name: 'ועידת הנדל״ן אילת 2026',
    description: 'הכנס השנתי של תעשיית הנדל״ן בישראל',
    date: '2026-04-15',
    endDate: '2026-04-16',
    location: 'אילת',
    status: 'active',
    color: '#0073ea',
    icon: '🏗️',
    parentEventId: 'event-archived-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'event-2',
    name: 'כנס טכנולוגיה אפריל 2026',
    description: 'כנס חדשנות וטכנולוגיה',
    date: '2026-04-28',
    endDate: null,
    location: 'תל אביב',
    status: 'active',
    color: '#9c27b0',
    icon: '💻',
    parentEventId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'event-archived-1',
    name: 'ועידת הנדל״ן אילת 2025',
    description: 'הכנס השנתי של תעשיית הנדל״ן בישראל',
    date: '2025-04-10',
    endDate: '2025-04-11',
    location: 'אילת',
    status: 'archived',
    color: '#0073ea',
    icon: '🏗️',
    parentEventId: null,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Website Redesign', description: 'Complete overhaul of the company website', color: '#0073ea', icon: '🌐', memberIds: ['user-1', 'user-2', 'user-3'], defaultView: 'table', eventId: 'event-1', createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-03-10T12:00:00Z' },
  { id: 'proj-2', name: 'Mobile App Launch', description: 'Product launch plan for Q2', color: '#e2445c', icon: '📱', memberIds: ['user-1', 'user-2', 'user-4'], defaultView: 'kanban', eventId: 'event-1', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-03-15T08:00:00Z' },
  { id: 'proj-3', name: 'Marketing Campaign', description: 'Q2 marketing initiatives', color: '#fdab3d', icon: '📣', memberIds: ['user-1', 'user-3'], defaultView: 'roadmap', eventId: 'event-2', createdAt: '2026-03-01T11:00:00Z', updatedAt: '2026-03-17T14:00:00Z' },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign-1',
    projectId: 'proj-1',
    name: 'גיוס דוברים',
    description: '',
    color: '#0073ea',
    status: 'active',
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'campaign-2',
    projectId: 'proj-1',
    name: 'שיווק רשתות חברתיות',
    description: '',
    color: '#e2445c',
    status: 'active',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
  { id: 'task-1', projectId: 'proj-1', groupId: 'grp-1', title: 'Define project scope', description: 'Identify all deliverables and stakeholders', status: 'done', priority: 'high', assigneeIds: ['user-1'], startDate: '2026-01-16', dueDate: '2026-01-20', order: 0, attachments: [], notes: [], comments: [], subItems: [], tags: [], timeTracked: 120, campaignId: null, createdAt: '2026-01-16T09:00:00Z', updatedAt: '2026-01-20T09:00:00Z' },
  { id: 'task-2', projectId: 'proj-1', groupId: 'grp-1', title: 'Create wireframes', description: 'Low-fi wireframes for all main pages', status: 'done', priority: 'high', assigneeIds: ['user-2'], startDate: '2026-01-21', dueDate: '2026-02-01', order: 1, attachments: [], notes: [], comments: [], subItems: [], tags: ['design'], timeTracked: 240, campaignId: null, createdAt: '2026-01-21T09:00:00Z', updatedAt: '2026-02-01T09:00:00Z' },
  { id: 'task-3', projectId: 'proj-1', groupId: 'grp-2', title: 'Design homepage mockup', description: 'Full visual design for the hero section', status: 'in_progress', priority: 'critical', assigneeIds: ['user-2', 'user-3'], startDate: '2026-02-05', dueDate: '2026-03-25', order: 0, comments: [{ id: 'c-1', taskId: 'task-3', userId: 'user-1', text: 'Looking great so far!', type: 'comment' as const, createdAt: '2026-03-10T10:00:00Z' }], subItems: [{ id: 'sub-1', taskId: 'task-3', title: 'Hero section', done: true }, { id: 'sub-2', taskId: 'task-3', title: 'Footer', done: false }], tags: ['design', 'ui'], timeTracked: 480, campaignId: 'campaign-1', attachments: [], notes: [], createdAt: '2026-02-05T09:00:00Z', updatedAt: '2026-03-10T09:00:00Z' },
  { id: 'task-4', projectId: 'proj-1', groupId: 'grp-2', title: 'Mobile responsive design', description: 'Ensure all pages work on mobile', status: 'todo', priority: 'high', assigneeIds: ['user-2'], startDate: '2026-03-26', dueDate: '2026-04-10', order: 1, attachments: [], notes: [], comments: [], subItems: [], tags: ['mobile'], timeTracked: 0, campaignId: null, createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  { id: 'task-5', projectId: 'proj-1', groupId: 'grp-3', title: 'Set up Next.js project', description: 'Initialize the codebase with TypeScript', status: 'stuck', priority: 'medium', assigneeIds: ['user-3'], startDate: '2026-02-15', dueDate: '2026-02-20', order: 0, attachments: [], notes: [], comments: [], subItems: [], tags: ['dev'], timeTracked: 60, campaignId: null, createdAt: '2026-02-15T09:00:00Z', updatedAt: '2026-02-20T09:00:00Z' },
  { id: 'task-6', projectId: 'proj-1', groupId: 'grp-3', title: 'Implement navigation', description: 'Build the main navigation component', status: 'backlog', priority: 'medium', assigneeIds: [], startDate: null, dueDate: '2026-04-20', order: 1, attachments: [], notes: [], comments: [], subItems: [], tags: [], timeTracked: 0, campaignId: null, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
  { id: 'task-7', projectId: 'proj-2', groupId: 'grp-4', title: 'User interviews', description: 'Conduct 10 user interviews', status: 'done', priority: 'critical', assigneeIds: ['user-1', 'user-2'], startDate: '2026-02-01', dueDate: '2026-02-28', order: 0, attachments: [], notes: [], comments: [], subItems: [], tags: ['research'], timeTracked: 600, campaignId: null, createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-02-28T09:00:00Z' },
  { id: 'task-8', projectId: 'proj-2', groupId: 'grp-4', title: 'Competitive analysis', description: 'Review top 5 competitors', status: 'in_progress', priority: 'high', assigneeIds: ['user-2'], startDate: '2026-03-01', dueDate: '2026-03-28', order: 1, attachments: [], notes: [], comments: [], subItems: [], tags: ['research'], timeTracked: 180, campaignId: null, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-10T09:00:00Z' },
  { id: 'task-9', projectId: 'proj-2', groupId: 'grp-5', title: 'Build authentication', description: 'OAuth + email/password login', status: 'todo', priority: 'high', assigneeIds: ['user-3'], startDate: '2026-04-01', dueDate: '2026-04-15', order: 0, attachments: [], notes: [], comments: [], subItems: [], tags: ['dev', 'auth'], timeTracked: 0, campaignId: null, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z' },
  { id: 'task-10', projectId: 'proj-2', groupId: 'grp-5', title: 'Push notifications', description: 'FCM integration for iOS and Android', status: 'backlog', priority: 'medium', assigneeIds: [], startDate: null, dueDate: '2026-05-01', order: 1, attachments: [], notes: [], comments: [], subItems: [], tags: [], timeTracked: 0, campaignId: null, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z' },
  { id: 'task-11', projectId: 'proj-3', groupId: 'grp-6', title: 'Q2 campaign brief', description: 'Define goals and budget for Q2', status: 'in_progress', priority: 'critical', assigneeIds: ['user-1'], startDate: '2026-03-01', dueDate: '2026-03-22', order: 0, attachments: [], notes: [], comments: [], subItems: [], tags: ['strategy'], timeTracked: 90, campaignId: null, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-15T09:00:00Z' },
  { id: 'task-12', projectId: 'proj-3', groupId: 'grp-6', title: 'Target audience research', description: 'Define personas for each channel', status: 'todo', priority: 'high', assigneeIds: ['user-3'], startDate: '2026-03-20', dueDate: '2026-04-05', order: 1, attachments: [], notes: [], comments: [], subItems: [], tags: [], timeTracked: 0, campaignId: null, createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z' },
  { id: 'task-13', projectId: 'proj-3', groupId: 'grp-7', title: 'Social media content calendar', description: '3-month posting schedule', status: 'todo', priority: 'medium', assigneeIds: ['user-3'], startDate: '2026-04-07', dueDate: '2026-04-30', order: 0, attachments: [], notes: [], comments: [], subItems: [], tags: ['social'], timeTracked: 0, campaignId: null, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z' },
  { id: 'task-14', projectId: 'proj-3', groupId: 'grp-7', title: 'Launch email campaign', description: 'Design + send email blast', status: 'backlog', priority: 'high', assigneeIds: [], startDate: null, dueDate: '2026-05-15', order: 1, attachments: [], notes: [], comments: [], subItems: [], tags: ['email'], timeTracked: 0, campaignId: null, createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z' },
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
  { id: 'deal-1', title: 'קבוצת הנגב — חסות מרכזית + הרצאה', contactId: 'contact-1', stage: 'closed_won', value: 310000, currency: 'ILS', probability: 100, ownerId: 'user-1', expectedCloseDate: '2026-02-28', notes: 'חתמו חוזה. יש להעביר לתפעול.', tags: ['חסות-מרכזית'], lineItems: [{ productId: 'prod-6', productName: 'חסות מרכזית', quantity: 1, unitPrice: 250000, speakerIds: [], notes: '' }, { productId: 'prod-1', productName: 'הרצאה', quantity: 1, unitPrice: 60000, speakerIds: ['speaker-1'], notes: 'נאור בקר' }], eventId: 'event-1', operationsProjectId: null, activities: [{ id: 'act-1', dealId: 'deal-1', type: 'stage_changed', description: 'עסקה נסגרה! חוזה נחתם.', userId: 'user-1', createdAt: '2026-02-28T15:00:00Z' }], createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-02-28T15:00:00Z' },
  { id: 'deal-2', title: 'פירמת שפירא — פאנל + עמדה', contactId: 'contact-2', stage: 'proposal', value: 110000, currency: 'ILS', probability: 60, ownerId: 'user-1', expectedCloseDate: '2026-04-01', notes: 'שלחנו הצעה. ממתינים לחתימה.', tags: ['הצעה-פעילה'], lineItems: [{ productId: 'prod-2', productName: 'השתתפות בפאנל', quantity: 1, unitPrice: 50000, speakerIds: ['speaker-2'], notes: '' }, { productId: 'prod-3', productName: 'עמדה', quantity: 1, unitPrice: 60000, speakerIds: [], notes: 'מיקום — כניסה ראשית' }], eventId: 'event-1', operationsProjectId: null, activities: [{ id: 'act-2', dealId: 'deal-2', type: 'email', description: 'שלחנו הצעת מחיר.', userId: 'user-1', createdAt: '2026-03-18T10:00:00Z' }], createdAt: '2026-02-20T09:00:00Z', updatedAt: '2026-03-18T10:00:00Z' },
  { id: 'deal-3', title: 'PropTech ישראל — הרצאה דיגיטלית + אולפן שקוף', contactId: 'contact-3', stage: 'negotiation', value: 50000, currency: 'ILS', probability: 75, ownerId: 'user-2', expectedCloseDate: '2026-04-10', notes: 'במשא ומתן על מחיר חבילה.', tags: [], lineItems: [{ productId: 'prod-4', productName: 'הרצאה דיגיטלית', quantity: 1, unitPrice: 35000, speakerIds: ['speaker-5'], notes: '' }, { productId: 'prod-5', productName: 'אולפן שקוף', quantity: 1, unitPrice: 15000, speakerIds: [], notes: '' }], eventId: 'event-1', operationsProjectId: null, activities: [{ id: 'act-3', dealId: 'deal-3', type: 'meeting', description: 'שיחת משא ומתן — מסכימים על החבילה.', userId: 'user-2', createdAt: '2026-03-22T14:00:00Z' }], createdAt: '2026-02-25T09:00:00Z', updatedAt: '2026-03-22T14:00:00Z' },
  { id: 'deal-4', title: 'לקוח חדש — טרקלין עסקים', contactId: 'contact-6', stage: 'qualified', value: 300000, currency: 'ILS', probability: 30, ownerId: 'user-1', expectedCloseDate: '2026-05-01', notes: 'מתאים מאוד לטרקלין. פגישה שנייה בשבוע הבא.', tags: ['hot-lead'], lineItems: [{ productId: 'prod-7', productName: 'טרקלין עסקים', quantity: 1, unitPrice: 300000, speakerIds: [], notes: '' }], eventId: 'event-1', operationsProjectId: null, activities: [], createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-20T09:00:00Z' },
  { id: 'deal-5', title: 'ספונסר — חסויות מיוחדות', contactId: 'contact-4', stage: 'lead', value: 130000, currency: 'ILS', probability: 20, ownerId: 'user-2', expectedCloseDate: '2026-06-01', notes: 'מעוניין בכמה חסויות מיוחדות.', tags: [], lineItems: [{ productId: 'prod-10', productName: 'עמדות קפה', quantity: 1, unitPrice: 30000, speakerIds: [], notes: '' }, { productId: 'prod-11', productName: 'מתחם בר', quantity: 1, unitPrice: 30000, speakerIds: [], notes: '' }, { productId: 'prod-14', productName: 'עמדות מזון', quantity: 1, unitPrice: 30000, speakerIds: [], notes: '' }, { productId: 'prod-13', productName: 'מקרר גלידות', quantity: 1, unitPrice: 30000, speakerIds: [], notes: '' }, { productId: 'prod-15', productName: 'עמדות טעינה', quantity: 1, unitPrice: 30000, speakerIds: [], notes: '' }], eventId: 'event-1', operationsProjectId: null, activities: [], createdAt: '2026-03-15T09:00:00Z', updatedAt: '2026-03-15T09:00:00Z' },
  { id: 'deal-6', title: 'ניסיון חידוש — לא סגר', contactId: 'contact-5', stage: 'closed_lost', value: 60000, currency: 'ILS', probability: 0, ownerId: 'user-1', expectedCloseDate: '2026-01-31', notes: 'חרג מהתקציב. אולי Q3.', tags: [], lineItems: [], eventId: 'event-1', operationsProjectId: null, activities: [{ id: 'act-6', dealId: 'deal-6', type: 'note', description: 'עסקה אבדה — חריגת תקציב.', userId: 'user-1', createdAt: '2026-01-30T12:00:00Z' }], createdAt: '2026-01-10T09:00:00Z', updatedAt: '2026-01-30T12:00:00Z' },
];

export const MOCK_SPEAKERS: Speaker[] = [
  {
    id: 'speaker-1', name: 'נאור בקר', jobTitle: 'מנכ"ל', organization: 'קבוצת נדל"ן הנגב',
    bio: 'יזם ומשקיע נדל"ן עם ניסיון של מעל 20 שנה בשוק הישראלי. מייסד קבוצת הנגב.', email: 'naor@hanegev.co.il', phone: '050-1234567',
    avatar: 'נב', photoUrl: null, cvUrl: null,
    approvalStatus: 'approved', cvStatus: 'received', photoStatus: 'uploaded',
    panelIds: ['panel-1', 'panel-2'], eventIds: ['event-1'], tags: ['נדל"ן', 'יזמות'], notes: 'מגיע עם עוזר אישי. יש לשריין חניה VIP.', createdAt: '2026-01-10T09:00:00Z', updatedAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'speaker-2', name: 'מיכל שפירא', jobTitle: 'שותפה בכירה', organization: 'פירמת עורכי דין שפירא ושות\'',
    bio: 'מומחית בדיני מקרקעין ומיסוי נדל"ן. מרצה בקורסים מקצועיים ברחבי הארץ.', email: 'michal@shapira-law.co.il', phone: '052-9876543',
    avatar: 'מש', photoUrl: null, cvUrl: null,
    approvalStatus: 'approved', cvStatus: 'received', photoStatus: 'missing',
    panelIds: ['panel-1'], eventIds: ['event-1'], tags: ['משפט', 'מיסוי'], notes: '', createdAt: '2026-01-12T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z',
  },
  {
    id: 'speaker-3', name: 'אבי כהן', jobTitle: 'סמנכ"ל שיווק', organization: 'בנק לאומי למשכנתאות',
    bio: 'בכיר בתחום המימון הנדל"ני. מוביל את אסטרטגיית המשכנתאות בלאומי.', email: 'avi.cohen@leumi.co.il', phone: '054-1112233',
    avatar: 'אכ', photoUrl: null, cvUrl: null,
    approvalStatus: 'pending', cvStatus: 'pending', photoStatus: 'missing',
    panelIds: ['panel-2'], eventIds: ['event-1'], tags: ['מימון', 'בנקאות'], notes: 'מחכה לאישור מהדוברת ראשית של הבנק.', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-03-20T09:00:00Z',
  },
  {
    id: 'speaker-4', name: 'רות לוי', jobTitle: 'יועצת כלכלית', organization: 'משרד האוצר',
    bio: 'כלכלנית ראשית במשרד האוצר, מנהלת מחלקת מדיניות דיור וקרקעות.', email: 'ruth.levy@mof.gov.il', phone: '053-4445566',
    avatar: 'רל', photoUrl: null, cvUrl: null,
    approvalStatus: 'approved', cvStatus: 'received', photoStatus: 'uploaded',
    panelIds: ['panel-3'], eventIds: ['event-1'], tags: ['ממשלה', 'מדיניות', 'כלכלה'], notes: '', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-03-18T09:00:00Z',
  },
  {
    id: 'speaker-5', name: 'דני ברק', jobTitle: 'מייסד ומנכ"ל', organization: 'PropTech ישראל',
    bio: 'יזם טק סדרתי. מייסד פלטפורמת PropTech המובילה בישראל לניהול נכסים דיגיטלי.', email: 'danny@proptech.co.il', phone: '050-7778899',
    avatar: 'דב', photoUrl: null, cvUrl: null,
    approvalStatus: 'approved', cvStatus: 'received', photoStatus: 'uploaded',
    panelIds: ['panel-3', 'panel-4'], eventIds: ['event-1', 'event-2'], tags: ['טכנולוגיה', 'PropTech', 'סטארטאפ'], notes: 'יכול להציג demo של הפלטפורמה.', createdAt: '2026-01-25T09:00:00Z', updatedAt: '2026-03-22T09:00:00Z',
  },
  {
    id: 'speaker-6', name: 'שרון מזרחי', jobTitle: 'ראש עיריית אילת', organization: 'עיריית אילת',
    bio: 'ראש עיר אילת. מוביל פרויקטי פיתוח מהגדולים בנגב ובאזור הדרום.', email: 'mayor@eilat.muni.il', phone: '08-6361444',
    avatar: 'שמ', photoUrl: null, cvUrl: null,
    approvalStatus: 'pending', cvStatus: 'pending', photoStatus: 'missing',
    panelIds: [], eventIds: ['event-1'], tags: ['ממשל', 'פיתוח', 'דרום'], notes: 'ממתינים לאישור לוח זמנים מהלשכה.', createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-03-25T09:00:00Z',
  },
];

export const MOCK_PANELS: Panel[] = [
  {
    id: 'panel-1', eventId: 'event-1', name: 'אתגרי הנדל"ן בעשור הקרוב', description: 'דיון פאנל על מגמות ואתגרי שוק הנדל"ן בישראל עד 2035',
    format: 'panel', duration: 45, day: 'יום א\'', hall: 'אולם ראשי', startTime: '10:00',
    speakerIds: ['speaker-1', 'speaker-2'], moderatorId: 'speaker-1',
    status: 'confirmed', order: 1, notes: '',
    createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'panel-2', eventId: 'event-1', name: 'מימון ומשכנתאות — פתרונות חדשניים', description: 'סקירת מוצרי מימון ופתרונות לרוכשים ויזמים',
    format: 'panel', duration: 45, day: 'יום א\'', hall: 'אולם B', startTime: '11:00',
    speakerIds: ['speaker-1', 'speaker-3'], moderatorId: null,
    status: 'draft', order: 2, notes: 'ממתינים לאישור דובר נוסף',
    createdAt: '2026-01-16T09:00:00Z', updatedAt: '2026-03-12T09:00:00Z',
  },
  {
    id: 'panel-3', eventId: 'event-1', name: 'מדיניות ממשלתית ודיור בר השגה', description: 'הצגת תוכנית הממשלה לפתרון משבר הדיור',
    format: 'lecture', duration: 30, day: 'יום ב\'', hall: 'אולם ראשי', startTime: '09:00',
    speakerIds: ['speaker-4', 'speaker-5'], moderatorId: 'speaker-4',
    status: 'confirmed', order: 1, notes: '',
    createdAt: '2026-01-17T09:00:00Z', updatedAt: '2026-03-14T09:00:00Z',
  },
  {
    id: 'panel-4', eventId: 'event-1', name: 'PropTech — העתיד של ניהול נכסים', description: 'כיצד הטכנולוגיה משנה את עולם הנדל"ן',
    format: 'lecture', duration: 20, day: 'יום ב\'', hall: 'אולם טכנולוגיה', startTime: '11:30',
    speakerIds: ['speaker-5'], moderatorId: null,
    status: 'confirmed', order: 2, notes: '',
    createdAt: '2026-01-18T09:00:00Z', updatedAt: '2026-03-15T09:00:00Z',
  },
];

export const MOCK_PRODUCTS: SponsorshipProduct[] = [
  {
    id: 'prod-1', name: 'הרצאה', category: 'stage', price: 60000, icon: 'mic',
    description: 'הרצאה בכנס — 20-45 דקות על הבמה הראשית',
    requiresSpeaker: true,
    taskTemplates: [
      'תיאום עם הדובר — תאריך ושעה',
      'קבלת תוכן ומצגת מהדובר',
      'בדיקת טכנאי קול ואור',
      'הכנת שלט ברקע עם לוגו נותן החסות',
      'הפקת מזכר תודה לדובר',
    ],
  },
  {
    id: 'prod-2', name: 'השתתפות בפאנל', category: 'stage', price: 50000, icon: 'groups',
    description: 'מקום בפאנל — 45-60 דקות עם מנחה ודוברים נוספים',
    requiresSpeaker: true,
    taskTemplates: [
      'תיאום עם הדובר — כניסה לפאנל',
      'שליחת שאלות מנחה מראש',
      'הכנת שלט שם על שולחן הפאנל',
      'קבלת ביו ותמונה מהדובר',
    ],
  },
  {
    id: 'prod-3', name: 'עמדה', category: 'sponsorship', price: 60000, icon: 'store',
    description: 'עמדה תצוגה בשטח הכנס — כולל ריהוט ומיתוג',
    requiresSpeaker: false,
    taskTemplates: [
      'אישור מיקום עמדה עם מפת הכנס',
      'קבלת קבצי מיתוג מהלקוח',
      'תיאום הקמה עם צוות לוגיסטיקה',
      'בדיקת חשמל ותאורה בעמדה',
      'פירוק עמדה בסיום הכנס',
    ],
  },
  {
    id: 'prod-4', name: 'הרצאה דיגיטלית', category: 'digital', price: 35000, icon: 'videocam',
    description: 'הרצאה מוקלטת לשידור / עריכה ופרסום ברשת',
    requiresSpeaker: true,
    taskTemplates: [
      'הזמנת אולפן הקלטה — תאריך ושעה',
      'תיאום עם דובר — הגעה לסטודיו',
      'עריכת וידאו — קבלה מצלם',
      'הוספת גרפיקה ולוגו לסרטון',
      'פרסום בפלטפורמות הדיגיטל',
    ],
  },
  {
    id: 'prod-5', name: 'אולפן שקוף', category: 'digital', price: 15000, icon: 'radio',
    description: 'אולפן שידור/הקלטה גלוי בתוך הכנס',
    requiresSpeaker: false,
    taskTemplates: [
      'הגדרת מיקום האולפן השקוף',
      'תיאום ציוד הקלטה ופרודקשן',
      'מיתוג האולפן — לוגו נותן חסות',
      'לו"ז ראיונות והקלטות',
    ],
  },
  {
    id: 'prod-6', name: 'חסות מרכזית', category: 'sponsorship', price: 250000, icon: 'stars',
    description: 'חסות ראשית על הכנס כולו — נוכחות מרבית בכל אזורי האירוע',
    requiresSpeaker: false,
    taskTemplates: [
      'הכנת חוזה חסות מרכזית',
      'קבלת חבילת מיתוג מהלקוח',
      'מיתוג בכניסה הראשית',
      'לוגו על כל חומרי הדפוס',
      'מקום VIP — 10 פגישות עסקיות',
      'הכנת טרקלין לפגישות',
      'נוכחות לוגו בשידור הדיגיטלי',
      'דו"ח סיכום חשיפה ללקוח לאחר הכנס',
    ],
  },
  {
    id: 'prod-7', name: 'טרקלין עסקים', category: 'sponsorship', price: 300000, icon: 'business_center',
    description: 'טרקלין עסקים פרטי בלעדי לנותן החסות — ריהוט, כיבוד, ניהול פגישות',
    requiresSpeaker: false,
    taskTemplates: [
      'תכנון ועיצוב הטרקלין',
      'קבלת מיתוג ולוגו מהלקוח',
      'תיאום ריהוט וכיבוד',
      'הסדרת כרטיסי גישה VIP',
      'הצבת קמפיין של הלקוח',
      'תיאום מארח/ת לטרקלין',
      'דו"ח פגישות ואינטראקציות לאחר הכנס',
    ],
  },
  // חסויות מיוחדות
  {
    id: 'prod-8', name: 'אירוע פרטי ערב', category: 'special', price: 100000, icon: 'celebration',
    description: 'ארוחת שף במסעדה ל-50 איש — ללא הוצאות נוספות ללקוח',
    requiresSpeaker: false,
    taskTemplates: [
      'הזמנת מסעדה ותאריך',
      'תיאום תפריט שף עם מסעדה',
      'רשימת מוזמנים מהלקוח — עד 50 איש',
      'מיתוג שולחנות ותפריטים',
      'סידור הסעות',
    ],
  },
  {
    id: 'prod-9', name: 'כסאות ממותגים', category: 'special', price: 30000, icon: 'chair',
    description: 'כ-10 ₪ לגופייה — על הלקוח. עבודה עלינו.',
    requiresSpeaker: false,
    taskTemplates: [
      'קבלת לוגו ועיצוב מהלקוח',
      'הזמנת הדפסה / גופיות',
      'חלוקה בכניסה לכנס',
    ],
  },
  {
    id: 'prod-10', name: 'עמדות קפה', category: 'special', price: 30000, icon: 'local_cafe',
    description: '5 עמדות קפה — קפה והקמה עלינו. מיתוג וכוסות על הלקוח.',
    requiresSpeaker: false,
    taskTemplates: [
      'תיאום ספק קפה — 5 עמדות',
      'קבלת מיתוג וכוסות ממותגות מהלקוח',
      'מיפוי מיקומי עמדות',
      'הקמה וצוות הגשה',
    ],
  },
  {
    id: 'prod-11', name: 'מתחם בר', category: 'special', price: 30000, icon: 'sports_bar',
    description: 'מיתוג, קוקטיילים, ריהוט אלטרנטיבי — על הלקוח. אלכוהול עלינו.',
    requiresSpeaker: false,
    taskTemplates: [
      'קבלת עיצוב מתחם הבר מהלקוח',
      'הזמנת אלכוהול ומוצרים',
      'תיאום ריהוט אלטרנטיבי',
      'צוות ברמנים',
    ],
  },
  {
    id: 'prod-12', name: 'ברים בכנס', category: 'special', price: 30000, icon: 'local_bar',
    description: '4 ברים בכנס — מיתוג בלבד על הלקוח',
    requiresSpeaker: false,
    taskTemplates: [
      'קבלת מיתוג 4 ברים מהלקוח',
      'תיאום הקמה ופירוק',
    ],
  },
  {
    id: 'prod-13', name: 'מקרר גלידות', category: 'special', price: 30000, icon: 'icecream',
    description: 'גלידות ומיתוג — על הלקוח',
    requiresSpeaker: false,
    taskTemplates: [
      'קבלת גלידות ממותגות מהלקוח',
      'מיקום מקרר בכנס',
      'צוות חלוקה',
    ],
  },
  {
    id: 'prod-14', name: 'עמדות מזון', category: 'special', price: 30000, icon: 'restaurant',
    description: '2 ארוחות צהרים — כ-30 עמדות. מיתוג ~8,000 ₪ על הלקוח.',
    requiresSpeaker: false,
    taskTemplates: [
      'הזמנת קייטרינג 2 ארוחות צהרים',
      'קבלת מיתוג עמדות מהלקוח',
      'תיאום 30 עמדות מזון',
      'תיאום צוות הגשה',
    ],
  },
  {
    id: 'prod-15', name: 'עמדות טעינה', category: 'special', price: 30000, icon: 'battery_charging_full',
    description: '2-3 עמדות טעינה — העמדות והמיתוג על הלקוח (~30,000 ₪)',
    requiresSpeaker: false,
    taskTemplates: [
      'קבלת עמדות טעינה ממותגות מהלקוח',
      'מיפוי מיקומים בכנס',
      'חיבור חשמל ותיאום עם לוגיסטיקה',
    ],
  },
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
  events: MOCK_EVENTS,
  campaigns: MOCK_CAMPAIGNS,
  speakers: MOCK_SPEAKERS,
  panels: MOCK_PANELS,
  products: MOCK_PRODUCTS,
  projects: MOCK_PROJECTS,
  tasks: MOCK_TASKS,
  groups: MOCK_GROUPS,
  notifications: MOCK_NOTIFICATIONS,
  contacts: MOCK_CONTACTS,
  deals: MOCK_DEALS,
  automations: MOCK_AUTOMATIONS,
  aiMessages: [],
  activeEventId: 'event-1',
  activeProjectId: 'proj-1',
  activeView: 'table',
  activeSection: 'events',
  activeCRMView: 'contacts',
  notificationsPanelOpen: false,
  taskModalId: null,
  newProjectModalOpen: false,
  newEventModalOpen: false,
  inviteModalOpen: false,
  aiPanelOpen: false,
  contactModalId: null,
  dealModalId: null,
  speakerModalId: null,
  onboardingComplete: false,
  workspaceName: 'אטלייה',
  appLocked: false,
  profileModalOpen: false,
  activityLogs: [],
};
