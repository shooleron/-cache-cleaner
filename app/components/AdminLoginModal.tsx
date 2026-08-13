'use client';
import { useState } from 'react';
import { Lock, User, Key, ShieldCheck, X, ArrowLeft } from 'lucide-react';
import { AdminUser } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: Props) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('admin');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password && username !== 'admin') {
      setError('נא להזין סיסמה תקפה');
      return;
    }
    setError('');
    onLoginSuccess({
      username: username || 'מנהל מערכת',
      role,
      isAuthenticated: true,
    });
    onClose();
  };

  const handleQuickLogin = () => {
    onLoginSuccess({
      username: 'מנהל ראשי (Admin)',
      role: 'admin',
      isAuthenticated: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14171C]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up" dir="rtl">
      <div className="max-w-[460px] w-full bg-[#FAFAF7] border border-[#DEDAD1] p-8 shadow-2xl relative select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DEDAD1] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#14171C] text-[#EF4423] flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#14171C]">אזור התחברות למערכת</h2>
              <span className="text-xs font-mono text-[#84807A]">מערכת ניהול תוכן CMS</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#84807A] hover:bg-[#F0EEE9] hover:text-[#14171C] transition-colors border border-[#DEDAD1]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Demo Login Banner */}
        <div className="bg-[#F0EEE9] border border-[#DEDAD1] p-4 mb-6 font-mono text-xs text-[#14171C]">
          <div className="flex items-center gap-2 font-bold mb-1 text-[#1F5C52]">
            <ShieldCheck size={14} />
            <span>התחברות מהירה למערכת</span>
          </div>
          <p className="text-[#555] mb-3 leading-relaxed">
            לחץ על הכפתור למטה לכניסה מיידית למאחורי הקלעים וניהול כל התכנים.
          </p>
          <button
            type="button"
            onClick={handleQuickLogin}
            className="w-full py-2.5 bg-[#14171C] text-[#FAFAF7] hover:bg-[#EF4423] font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span>כניסה כעורך מורשה</span>
            <ArrowLeft size={14} />
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-[#DEDAD1]"></div>
          <span className="flex-shrink mx-4 text-xs font-mono text-[#84807A]">או התחבר עם סיסמה</span>
          <div className="flex-grow border-t border-[#DEDAD1]"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#EF4423]/10 border border-[#EF4423] text-[#EF4423] font-mono text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-[#14171C] mb-1.5">
              שם משתמש
            </label>
            <div className="relative">
              <User size={16} className="absolute right-3 top-3 text-[#84807A]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#DEDAD1] pr-10 pl-3 py-2.5 text-sm font-mono outline-none focus:border-[#14171C]"
                placeholder="הזן שם משתמש"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#14171C] mb-1.5">
              סיסמה
            </label>
            <div className="relative">
              <Key size={16} className="absolute right-3 top-3 text-[#84807A]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#DEDAD1] pr-10 pl-3 py-2.5 text-sm font-mono outline-none focus:border-[#14171C]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#14171C] mb-1.5">
              תפקיד במערכת
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'editor')}
              className="w-full bg-[#FAFAF7] border border-[#DEDAD1] px-3 py-2.5 text-sm font-mono outline-none focus:border-[#14171C]"
            >
              <option value="admin">מנהל מערכת (הרשאות מלאות)</option>
              <option value="editor">עורך תוכן (עריכה בלבד)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#EF4423] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#14171C] transition-colors mt-2"
          >
            התחבר למערכת הניהול
          </button>
        </form>

      </div>
    </div>
  );
}
