'use client';

import { useState, useEffect } from 'react';

interface TargetInfo {
  id: string;
  label: string;
  size: string;
}

interface CleanResult {
  id: string;
  success: boolean;
  message: string;
}

const ICONS: Record<string, string> = {
  userCaches: '📦',
  userLogs: '📋',
  trash: '🗑️',
  npm: '📦',
  dns: '🌐',
};

export default function CacheCleaner() {
  const [targets, setTargets] = useState<TargetInfo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [results, setResults] = useState<CleanResult[]>([]);
  const [log, setLog] = useState<string[]>([]);

  const scan = async () => {
    setScanning(true);
    setResults([]);
    setLog([]);
    try {
      const res = await fetch('/api/cache');
      const data = await res.json();
      setTargets(data.targets);
      setSelected(new Set(data.targets.map((t: TargetInfo) => t.id)));
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    scan();
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clean = async () => {
    if (selected.size === 0) return;
    setCleaning(true);
    setResults([]);
    setLog([`Starting cleanup of ${selected.size} item(s)...`]);

    try {
      const res = await fetch('/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      setResults(data.results);
      setLog((prev) => [
        ...prev,
        ...data.results.map((r: CleanResult) => `${r.success ? '✅' : '❌'} ${r.message}`),
        'Done! Rescanning...',
      ]);
      await scan();
      setLog((prev) => [...prev, 'Rescan complete.']);
    } finally {
      setCleaning(false);
    }
  };

  const allSelected = targets.length > 0 && selected.size === targets.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(targets.map((t) => t.id)));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.headerIcon}>🧹</span>
          <h1 style={styles.title}>Cache Cleaner</h1>
          <p style={styles.subtitle}>בחר את הקטגוריות שברצונך לנקות</p>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>קטגוריות קאש</span>
            <button style={styles.selectAll} onClick={toggleAll}>
              {allSelected ? 'בטל הכל' : 'בחר הכל'}
            </button>
          </div>

          {scanning && targets.length === 0 ? (
            <div style={styles.loading}>סורק...</div>
          ) : (
            <div style={styles.list}>
              {targets.map((t) => {
                const isSelected = selected.has(t.id);
                return (
                  <label key={t.id} style={{ ...styles.item, ...(isSelected ? styles.itemSelected : {}) }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(t.id)}
                      style={styles.checkbox}
                    />
                    <span style={styles.itemIcon}>{ICONS[t.id] || '📁'}</span>
                    <span style={styles.itemLabel}>{t.label}</span>
                    <span style={styles.itemSize}>{t.size}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div style={styles.actions}>
          <button
            style={styles.scanBtn}
            onClick={scan}
            disabled={scanning || cleaning}
          >
            {scanning ? 'סורק...' : '🔍 סרוק מחדש'}
          </button>

          <button
            style={{
              ...styles.cleanBtn,
              ...(selected.size === 0 || cleaning ? styles.cleanBtnDisabled : {}),
            }}
            onClick={clean}
            disabled={selected.size === 0 || cleaning || scanning}
          >
            {cleaning ? 'מנקה...' : `🧹 נקה (${selected.size})`}
          </button>
        </div>

        {log.length > 0 && (
          <div style={styles.logBox}>
            {log.map((line, i) => (
              <div key={i} style={styles.logLine}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '24px',
    direction: 'rtl',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  headerIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '12px',
  },
  title: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    margin: 0,
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  selectAll: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  loading: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    padding: '32px',
    fontSize: '14px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.15s ease',
  },
  itemSelected: {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.35)',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#6366f1',
    cursor: 'pointer',
    flexShrink: 0,
  },
  itemIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  itemLabel: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '500',
    flex: 1,
  },
  itemSize: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  scanBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cleanBtn: {
    flex: 2,
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
  },
  cleanBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  logBox: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  logLine: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontFamily: 'monospace',
    lineHeight: '1.8',
  },
};
