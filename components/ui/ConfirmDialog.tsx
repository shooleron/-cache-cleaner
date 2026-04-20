'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

// ── Standalone dialog component ──────────────────────────────────
export function ConfirmDialog({ title, message, confirmLabel = 'אישור', cancelLabel = 'ביטול', danger = true, onConfirm, onCancel }: ConfirmOptions & { onConfirm: () => void; onCancel: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onConfirm, onCancel]);

  return (
    <div className="confirm-backdrop" onClick={handleBackdrop}>
      <div className="confirm-dialog" ref={dialogRef} dir="rtl">
        <div className="confirm-icon-wrap" style={{ background: danger ? '#fee2e2' : '#e0f2fe' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: danger ? '#dc2626' : '#0284c7' }}>
            {danger ? 'warning' : 'help'}
          </span>
        </div>
        {title && <h3 className="confirm-title">{title}</h3>}
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={`confirm-btn-ok ${danger ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── useConfirm hook ───────────────────────────────────────────────
// Returns [confirm fn, dialog node to render]
export function useConfirm(): [(opts: ConfirmOptions) => Promise<boolean>, React.ReactNode] {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ ...opts, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  const dialog = state ? (
    <ConfirmDialog
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      danger={state.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return [confirm, dialog];
}
