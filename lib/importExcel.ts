import * as XLSX from 'xlsx';

export interface ParsedContact {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  city: string;
  website: string;
  notes: string;
  source: string;
  status: string;
  tags: string[];
}

function findHeaderRow(rows: string[][]): number {
  const markers = ['שם פרטי', 'דוא"ל', 'טלפון', 'דוא״ל', 'אימייל', 'שם משפחה'];
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    if (!row) continue;
    const joined = row.join(' ');
    if (markers.some(m => joined.includes(m))) {
      return i;
    }
  }
  return 0;
}

function getCol(headers: string[], ...candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.findIndex(h => h && h.includes(c));
    if (idx !== -1) return idx;
  }
  return -1;
}

function cellStr(row: unknown[], idx: number): string {
  if (idx < 0 || idx >= row.length) return '';
  const v = row[idx];
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

export async function parseContactsFile(file: File): Promise<ParsedContact[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (rows.length < 2) return [];

  const headerIdx = findHeaderRow(rows as string[][]);
  const headers = (rows[headerIdx] as string[]).map(h => (h ? String(h).trim() : ''));

  // Column indices
  const iFirstName = getCol(headers, 'שם פרטי');
  const iLastName = getCol(headers, 'שם משפחה');
  const iEmail = getCol(headers, 'דוא"ל', 'דוא״ל', 'אימייל', 'email', 'Email');
  const iPhone = getCol(headers, 'סלולרי', 'נייד');
  const iPhoneMain = getCol(headers, 'טלפון ראשי', 'טלפון');
  const iCompany = getCol(headers, 'שם החברה', 'שם חברה', 'חברה');
  const iPosition = getCol(headers, 'תפקיד');
  const iCity = getCol(headers, 'ישוב', 'עיר');
  const iWebsite = getCol(headers, 'אתר אינטרנט', 'אתר');
  const iNotes = getCol(headers, 'הערות');
  const iSource = getCol(headers, 'מקור הגעה', 'מקור');
  const iStatus = getCol(headers, 'סטאטוס', 'סטטוס', 'status');

  const results: ParsedContact[] = [];

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || row.length === 0) continue;

    const firstName = cellStr(row, iFirstName);
    const lastName = cellStr(row, iLastName);
    const name = [firstName, lastName].filter(Boolean).join(' ');
    const email = cellStr(row, iEmail);

    // Skip rows where both name and email are empty
    if (!name && !email) continue;

    const phone = cellStr(row, iPhone) || cellStr(row, iPhoneMain);
    const company = cellStr(row, iCompany);
    const position = cellStr(row, iPosition);
    const city = cellStr(row, iCity);
    const website = cellStr(row, iWebsite);
    const notes = cellStr(row, iNotes);
    const source = cellStr(row, iSource);
    const status = cellStr(row, iStatus);
    const tags: string[] = [];
    if (source) tags.push(source);

    results.push({ name, email, phone, company, position, city, website, notes, source, status, tags });
  }

  return results;
}
