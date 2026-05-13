'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { extractSheetId, fetchSheetAsCSV, parseSheetContacts, ParsedSheetContact } from '@/lib/googleSheetsSync';

type Stage = 'config' | 'loading' | 'preview' | 'done' | 'error';

export function GoogleSheetsModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [stage, setStage] = useState<Stage>('config');
  const [url, setUrl] = useState('');
  const [contacts, setContacts] = useState<ParsedSheetContact[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultNew, setResultNew] = useState(0);
  const [resultUpdated, setResultUpdated] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('gsheets_contacts_url');
    if (saved) setUrl(saved);
  }, []);

  const hasSavedUrl = !!localStorage.getItem('gsheets_contacts_url');

  async function startSync() {
    if (!url.trim()) {
      setErrorMsg('קישור לא תקין — הדבק קישור לגוגל שיטס');
      setStage('error');
      return;
    }

    const sheetId = extractSheetId(url.trim());
    if (!sheetId) {
      setErrorMsg('קישור לא תקין — הדבק קישור לגוגל שיטס');
      setStage('error');
      return;
    }

    setStage('loading');

    try {
      const csv = await fetchSheetAsCSV(sheetId);
      const parsed = parseSheetContacts(csv);

      if (parsed.length === 0) {
        setErrorMsg('לא נמצאו נתונים בגיליון');
        setStage('error');
        return;
      }

      setContacts(parsed);
      setSelected(new Array(parsed.length).fill(true));
      setStage('preview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'לא ניתן לגשת לגיליון. ודא שהוא מפורסם לאינטרנט (Publish to web)';
      setErrorMsg(msg);
      setStage('error');
    }
  }

  function importSelected() {
    let newCount = 0;
    let updatedCount = 0;

    contacts.forEach((contact, i) => {
      if (!selected[i]) return;

      const existing = contact.email
        ? state.contacts.find(c => c.email.toLowerCase() === contact.email.toLowerCase())
        : null;

      if (existing) {
        const updates: Record<string, unknown> = { id: existing.id };
        if (contact.name) updates.name = contact.name;
        if (contact.email) updates.email = contact.email;
        if (contact.phone) updates.phone = contact.phone;
        if (contact.company) updates.company = contact.company;
        if (contact.position) updates.position = contact.position;
        if (contact.city) updates.city = contact.city;
        if (contact.notes) updates.notes = contact.notes;
        if (contact.tags.length > 0) updates.tags = contact.tags;

        dispatch({ type: 'UPDATE_CONTACT', payload: updates as { id: string } });
        updatedCount++;
      } else {
        dispatch({
          type: 'CREATE_CONTACT',
          payload: {
            name: contact.name || 'ללא שם',
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            position: contact.position,
            city: contact.city,
            notes: contact.notes,
            tags: contact.tags,
            status: 'prospect',
            contactType: 'other',
            ownerId: state.currentUser.id,
          },
        });
        newCount++;
      }
    });

    localStorage.setItem('gsheets_contacts_url', url.trim());
    setResultNew(newCount);
    setResultUpdated(updatedCount);
    setStage('done');
  }

  function disconnect() {
    localStorage.removeItem('gsheets_contacts_url');
    setUrl('');
  }

  function toggleRow(index: number) {
    setSelected(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, width: '95vw' }}>

        {/* Config stage */}
        {stage === 'config' && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">סנכרון Google Sheets</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 6, borderRadius: 'var(--radius-full)', display: 'flex' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="gsheets-instructions">
                כדי לסנכרן, הגיליון צריך להיות מפורסם לאינטרנט<br />
                (File → Share → Publish to web)
              </div>
              <input
                className="gsheets-url-input"
                placeholder="הדבק קישור לגוגל שיטס..."
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              {hasSavedUrl && (
                <div className="gsheets-status-bar">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>link</span>
                  גיליון מחובר
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={startSync}>סנכרן עכשיו</button>
              {hasSavedUrl && (
                <button className="btn" onClick={disconnect} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>נתק</button>
              )}
              <button className="btn btn-ghost" onClick={onClose}>ביטול</button>
            </div>
          </>
        )}

        {/* Loading stage */}
        {stage === 'loading' && (
          <div className="gsheets-loading">
            <div className="gsheets-spinner" />
            <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>טוען נתונים מגוגל שיטס...</span>
          </div>
        )}

        {/* Preview stage */}
        {stage === 'preview' && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">נמצאו {contacts.length} אנשי קשר בגיליון</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 6, borderRadius: 'var(--radius-full)', display: 'flex' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '0 24px 16px', maxHeight: 360, overflowY: 'auto' }}>
              <table className="import-preview-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 6px', textAlign: 'center', width: 32 }}></th>
                    <th style={{ padding: '8px 6px', textAlign: 'right' }}>שם</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right' }}>אימייל</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right' }}>טלפון</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right' }}>חברה</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.slice(0, 10).map((c, i) => (
                    <tr key={i}>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <input type="checkbox" checked={selected[i]} onChange={() => toggleRow(i)} />
                      </td>
                      <td style={{ padding: '6px' }}>{c.name}</td>
                      <td style={{ padding: '6px', direction: 'ltr', textAlign: 'left' }}>{c.email}</td>
                      <td style={{ padding: '6px', direction: 'ltr', textAlign: 'left' }}>{c.phone}</td>
                      <td style={{ padding: '6px' }}>{c.company}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length > 10 && (
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 8, textAlign: 'center' }}>
                  +{contacts.length - 10} שורות נוספות
                </p>
              )}
              <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 12, textAlign: 'right' }}>
                אנשי קשר קיימים עם אותו אימייל יעודכנו, חדשים יתווספו
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={importSelected}>ייבא נבחרים</button>
              <button className="btn btn-ghost" onClick={onClose}>ביטול</button>
            </div>
          </>
        )}

        {/* Done stage */}
        {stage === 'done' && (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#059669' }}>check_circle</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>
              הסנכרון הושלם — יובאו {resultNew} חדשים, עודכנו {resultUpdated} קיימים
            </p>
            <button className="btn btn-primary" onClick={onClose}>סגור</button>
          </div>
        )}

        {/* Error stage */}
        {stage === 'error' && (
          <div className="gsheets-error">
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--error)' }}>error</span>
            <p className="gsheets-error-msg">{errorMsg}</p>
            <button className="btn btn-primary" onClick={() => setStage('config')}>נסה שוב</button>
          </div>
        )}
      </div>
    </div>
  );
}
