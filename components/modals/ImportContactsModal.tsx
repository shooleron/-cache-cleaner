'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { parseContactsFile, ParsedContact } from '@/lib/importExcel';
import { ContactStatus } from '@/lib/types';

function mapStatus(raw: string): ContactStatus {
  const s = raw.toLowerCase();
  if (s.includes('לקוח')) return 'customer';
  if (s.includes('ליד') || s.includes('מתעניין')) return 'prospect';
  if (s.includes('פעיל')) return 'active';
  return 'prospect';
}

interface Props {
  onClose: () => void;
}

export function ImportContactsModal({ onClose }: Props) {
  const { state, dispatch } = useStore();
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [dragover, setDragover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const parsed = await parseContactsFile(file);
      if (parsed.length === 0) {
        setError('לא נמצאו אנשי קשר בקובץ');
        setLoading(false);
        return;
      }
      setContacts(parsed);
      setSelected(new Array(parsed.length).fill(true));
      setStage(2);
    } catch (e) {
      setError('שגיאה בקריאת הקובץ. ודא שהקובץ בפורמט Excel או CSV.');
    }
    setLoading(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const toggleRow = (idx: number) => {
    setSelected(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const toggleAll = () => {
    const allChecked = selected.every(Boolean);
    setSelected(new Array(contacts.length).fill(!allChecked));
  };

  const doImport = () => {
    let count = 0;
    contacts.forEach((c, i) => {
      if (!selected[i]) return;
      dispatch({
        type: 'CREATE_CONTACT',
        payload: {
          name: c.name || c.email,
          email: c.email,
          phone: c.phone,
          company: c.company,
          position: c.position,
          city: c.city || undefined,
          website: c.website || undefined,
          notes: c.notes,
          status: mapStatus(c.status),
          contactType: 'other',
          tags: c.tags,
          ownerId: state.currentUser.id,
        },
      });
      count++;
    });
    setImportedCount(count);
    setStage(3);
  };

  const selectedCount = selected.filter(Boolean).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="import-modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="import-modal-header">
          <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>ייבוא אנשי קשר</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 6, borderRadius: 'var(--radius-full)', display: 'flex' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="import-modal-body">
          {/* Stage 1: Upload */}
          {stage === 1 && (
            <>
              <div
                className={`import-dropzone ${dragover ? 'dragover' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragover(true); }}
                onDragLeave={() => setDragover(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)' }}>upload_file</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)' }}>גרור קובץ לכאן או לחץ לבחירה</span>
                <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>Excel (.xlsx, .xls) או CSV</span>
                {loading && <span style={{ fontSize: 13, color: 'var(--primary)' }}>טוען...</span>}
                {error && <span style={{ fontSize: 13, color: 'var(--error)' }}>{error}</span>}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={onFileChange}
              />
            </>
          )}

          {/* Stage 2: Preview */}
          {stage === 2 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>
                  נמצאו {contacts.length} אנשי קשר
                </span>
                <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                  {selectedCount} נבחרו לייבוא
                </span>
              </div>
              <table className="import-preview-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input type="checkbox" checked={selected.every(Boolean)} onChange={toggleAll} />
                    </th>
                    <th>שם</th>
                    <th>אימייל</th>
                    <th>טלפון</th>
                    <th>חברה</th>
                    <th>עיר</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.slice(0, 10).map((c, i) => (
                    <tr key={i}>
                      <td><input type="checkbox" checked={selected[i]} onChange={() => toggleRow(i)} /></td>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.company}</td>
                      <td>{c.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length > 10 && (
                <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 8, textAlign: 'center' }}>
                  ועוד {contacts.length - 10} שורות נוספות...
                </p>
              )}
            </>
          )}

          {/* Stage 3: Done */}
          {stage === 3 && (
            <div className="import-success">
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#059669' }}>check_circle</span>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--on-surface)' }}>
                יובאו {importedCount} אנשי קשר בהצלחה
              </span>
              <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                אנשי הקשר נוספו לרשימה שלך
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="import-actions">
          {stage === 2 && (
            <>
              <button className="btn btn-primary" onClick={doImport} disabled={selectedCount === 0}>
                ייבא {selectedCount} נבחרים
              </button>
              <button className="btn btn-ghost" onClick={onClose}>ביטול</button>
            </>
          )}
          {stage === 3 && (
            <button className="btn btn-primary" onClick={onClose}>סגור</button>
          )}
        </div>
      </div>
    </div>
  );
}
