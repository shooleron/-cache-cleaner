import * as XLSX from 'xlsx';
import type { Task, Speaker, Contact, User, Group, Project, Event } from './types';

// Helper to trigger download
function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const STATUS_MAP: Record<string, string> = {
  todo: 'לביצוע',
  in_progress: 'בעבודה',
  done: 'הושלם',
  stuck: 'תקוע',
  backlog: 'בהמתנה',
};

const PRIORITY_MAP: Record<string, string> = {
  critical: 'קריטי',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
};

export function exportTasks(tasks: Task[], groups: Group[], projects: Project[], users: User[]) {
  const rows = tasks.map(t => {
    const project = projects.find(p => p.id === t.projectId);
    const group = groups.find(g => g.id === t.groupId);
    const assignees = t.assigneeIds
      .map(id => users.find(u => u.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    return {
      'שם משימה': t.title,
      'פרויקט': project?.name || '',
      'קבוצה': group?.name || '',
      'סטטוס': STATUS_MAP[t.status] || t.status,
      'עדיפות': PRIORITY_MAP[t.priority] || t.priority,
      'אחראי': assignees,
      'תאריך התחלה': t.startDate || '',
      'תאריך יעד': t.dueDate || '',
      'תגיות': t.tags.join(', '),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'משימות');
  downloadWorkbook(wb, `משימות_${todayStr()}.xlsx`);
}

const CONTACT_TYPE_MAP: Record<string, string> = {
  developer: 'יזמים',
  lawyer: 'עורכי דין',
  infrastructure: 'תשתיות',
  appraiser: 'שמאים',
  other: 'אחר',
};

const CONTACT_STATUS_MAP: Record<string, string> = {
  prospect: 'ליד',
  active: 'פעיל',
  customer: 'לקוח',
  inactive: 'לא פעיל',
};

export function exportContacts(contacts: Contact[], users: User[]) {
  const rows = contacts.map(c => {
    const owner = users.find(u => u.id === c.ownerId);
    return {
      'שם': c.name,
      'חברה': c.company,
      'תפקיד': c.position,
      'טלפון': c.phone,
      'אימייל': c.email,
      'עיר': c.city || '',
      'סוג': CONTACT_TYPE_MAP[c.contactType] || c.contactType,
      'סטטוס': CONTACT_STATUS_MAP[c.status] || c.status,
      'תקציב': c.budget || '',
      'אחראי': owner?.name || '',
      'תגיות': c.tags.join(', '),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'אנשי קשר');
  downloadWorkbook(wb, `אנשי_קשר_${todayStr()}.xlsx`);
}

const APPROVAL_MAP: Record<string, string> = {
  approved: 'מאושר',
  pending: 'ממתין',
  cancelled: 'בוטל',
};

const CV_MAP: Record<string, string> = {
  received: 'התקבל',
  pending: 'ממתין',
};

const PHOTO_MAP: Record<string, string> = {
  uploaded: 'הועלתה',
  missing: 'חסרה',
};

export function exportSpeakers(speakers: Speaker[], events: Event[]) {
  const rows = speakers.map(s => {
    const eventNames = s.eventIds
      .map(id => events.find(e => e.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    return {
      'שם': s.name,
      'תפקיד': s.jobTitle,
      'ארגון': s.organization,
      'אימייל': s.email,
      'טלפון': s.phone,
      'סטטוס אישור': APPROVAL_MAP[s.approvalStatus] || s.approvalStatus,
      'קו״ח': CV_MAP[s.cvStatus] || s.cvStatus,
      'תמונה': PHOTO_MAP[s.photoStatus] || s.photoStatus,
      'אירועים': eventNames,
      'תגיות': s.tags.join(', '),
      'הערות': s.notes,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'דוברים');
  downloadWorkbook(wb, `דוברים_${todayStr()}.xlsx`);
}
