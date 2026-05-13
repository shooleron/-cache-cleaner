import * as XLSX from 'xlsx';

export interface ParsedSheetContact {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  city: string;
  notes: string;
  status: string;
  tags: string[];
}

export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export async function fetchSheetAsCSV(sheetId: string): Promise<string> {
  const primaryUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
  const fallbackUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  try {
    const res = await fetch(primaryUrl);
    if (!res.ok) throw new Error('Primary fetch failed');
    return await res.text();
  } catch {
    try {
      const res = await fetch(fallbackUrl);
      if (!res.ok) throw new Error('Fallback fetch failed');
      return await res.text();
    } catch {
      throw new Error('לא ניתן לגשת לגיליון. ודא שהוא מפורסם לאינטרנט (Publish to web)');
    }
  }
}

type ColumnMapping = Record<string, keyof Omit<ParsedSheetContact, 'tags'> | 'firstName' | 'lastName' | 'tags'>;

function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};

  for (const header of headers) {
    const h = header.trim().toLowerCase();

    if (h.includes('שם משפחה')) {
      mapping[header] = 'lastName';
    } else if (h.includes('שם פרטי') || h === 'שם') {
      mapping[header] = 'firstName';
    } else if (h.includes('דוא') || h.includes('אימייל') || h.includes('email') || h.includes('מייל')) {
      mapping[header] = 'email';
    } else if (h.includes('טלפון') || h.includes('סלולרי') || h.includes('נייד') || h.includes('phone') || h.includes('טל')) {
      mapping[header] = 'phone';
    } else if (h.includes('חברה') || h.includes('ארגון') || h.includes('company') || h.includes('שם החברה')) {
      mapping[header] = 'company';
    } else if (h.includes('תפקיד') || h.includes('role')) {
      mapping[header] = 'position';
    } else if (h.includes('עיר') || h.includes('ישוב') || h.includes('city')) {
      mapping[header] = 'city';
    } else if (h.includes('הערות') || h.includes('notes')) {
      mapping[header] = 'notes';
    } else if (h.includes('סטאטוס') || h.includes('status') || h.includes('סטטוס')) {
      mapping[header] = 'status';
    } else if (h.includes('תגיות') || h.includes('tags')) {
      mapping[header] = 'tags';
    }
  }

  return mapping;
}

export function parseSheetContacts(csvText: string): ParsedSheetContact[] {
  const workbook = XLSX.read(csvText, { type: 'string' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });

  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const mapping = detectColumnMapping(headers);

  const contacts: ParsedSheetContact[] = [];

  for (const row of rows) {
    let firstName = '';
    let lastName = '';
    let name = '';
    let email = '';
    let phone = '';
    let company = '';
    let position = '';
    let city = '';
    let notes = '';
    let status = '';
    let tags: string[] = [];

    for (const [col, field] of Object.entries(mapping)) {
      const val = (row[col] || '').toString().trim();
      if (!val) continue;

      switch (field) {
        case 'firstName': firstName = val; break;
        case 'lastName': lastName = val; break;
        case 'email': email = val; break;
        case 'phone': phone = val; break;
        case 'company': company = val; break;
        case 'position': position = val; break;
        case 'city': city = val; break;
        case 'notes': notes = val; break;
        case 'status': status = val; break;
        case 'tags': tags = val.split(',').map(t => t.trim()).filter(Boolean); break;
      }
    }

    // Build name from firstName + lastName, or use "שם" column directly
    if (firstName || lastName) {
      name = [firstName, lastName].filter(Boolean).join(' ');
    }
    // If mapping had 'firstName' pointing to a "שם" header and no lastName
    if (!name && firstName) {
      name = firstName;
    }

    // Skip empty rows
    if (!name && !email) continue;

    contacts.push({ name, email, phone, company, position, city, notes, status, tags });
  }

  return contacts;
}
