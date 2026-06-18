'use client';
import { useState } from 'react';
import {
  UserPreferences,
  UserRole,
  ROLE_CONFIG,
} from '@/lib/personalization';
import { TrendCategory } from '@/lib/types';

const CATEGORIES: { value: TrendCategory; label: string; emoji: string }[] = [
  { value: 'ai',        label: 'AI',          emoji: '🤖' },
  { value: 'tech',      label: 'Tech',         emoji: '💻' },
  { value: 'marketing', label: 'Marketing',    emoji: '📣' },
  { value: 'business',  label: 'Business',     emoji: '💼' },
  { value: 'culture',   label: 'Culture',      emoji: '🌍' },
  { value: 'science',   label: 'Science',      emoji: '🔬' },
  { value: 'design',    label: 'Design',       emoji: '🎨' },
  { value: 'crypto',    label: 'Crypto',       emoji: '₿' },
];

const KEYWORD_SUGGESTIONS: Record<UserRole, string[]> = {
  marketer:         ['viral', 'SEO', 'influencer', 'brand awareness', 'Gen Z', 'TikTok', 'email', 'conversion'],
  founder:          ['product-market fit', 'SaaS', 'B2B', 'ARR', 'churn', 'runway', 'pitch deck'],
  'brand-manager':  ['brand identity', 'PR', 'crisis', 'campaign', 'sponsorship', 'community'],
  designer:         ['design system', 'Figma', 'typography', 'motion', 'accessibility', 'color'],
  developer:        ['open source', 'TypeScript', 'performance', 'LLM', 'API', 'DevOps'],
  investor:         ['Series A', 'valuation', 'exit', 'M&A', 'IPO', 'market size'],
  'content-creator':['short-form', 'algorithm', 'subscribers', 'monetize', 'sponsorship', 'hooks'],
};

interface Props {
  initial: UserPreferences | null;
  onSave: (prefs: UserPreferences) => void;
  onClose: () => void;
}

export default function PersonalizeModal({ initial, onSave, onClose }: Props) {
  const [role, setRole] = useState<UserRole>(initial?.role ?? 'marketer');
  const [categories, setCategories] = useState<TrendCategory[]>(
    initial?.categories ?? ROLE_CONFIG['marketer'].defaultCategories
  );
  const [keywords, setKeywords] = useState<string[]>(
    initial?.keywords ?? ROLE_CONFIG['marketer'].defaultKeywords
  );
  const [customKw, setCustomKw] = useState('');

  function selectRole(r: UserRole) {
    setRole(r);
    // Auto-fill defaults when switching role (only if not customized)
    const cfg = ROLE_CONFIG[r];
    setCategories(cfg.defaultCategories);
    setKeywords(cfg.defaultKeywords);
  }

  function toggleCategory(cat: TrendCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleKeyword(kw: string) {
    setKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  }

  function addCustom() {
    const kw = customKw.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
    }
    setCustomKw('');
  }

  function handleSave() {
    onSave({ role, categories, keywords, sources: [] });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(15,15,26,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative rounded-[22px] overflow-hidden w-full"
        style={{
          maxWidth: 560,
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          boxShadow: '0 24px 80px rgba(15,15,26,0.2)',
          margin: '0 16px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Personalize Your Feed</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                Trends relevant to you rise to the top
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-lg"
              style={{ background: 'var(--bg)', color: 'var(--muted)', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Role */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6366f1' }}>
              I am a...
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ROLE_CONFIG) as UserRole[]).map((r) => {
                const cfg = ROLE_CONFIG[r];
                const active = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => selectRole(r)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                    style={{
                      background: active ? 'rgba(99,102,241,0.1)' : 'var(--bg)',
                      border: `1.5px solid ${active ? '#6366f1' : 'var(--border)'}`,
                      color: active ? '#6366f1' : 'var(--text)',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{cfg.emoji}</span>
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6366f1' }}>
              Topics I care about
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: active ? '#6366f1' : 'var(--bg)',
                      border: `1.5px solid ${active ? '#6366f1' : 'var(--border)'}`,
                      color: active ? '#fff' : 'var(--text)',
                      cursor: 'pointer',
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6366f1' }}>
              Keywords I follow
            </p>
            <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
              Trends mentioning these keywords are ranked higher
            </p>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {KEYWORD_SUGGESTIONS[role].map((kw) => {
                const active = keywords.includes(kw);
                return (
                  <button
                    key={kw}
                    onClick={() => toggleKeyword(kw)}
                    className="px-2.5 py-1 rounded-lg text-xs transition-all"
                    style={{
                      background: active ? 'rgba(99,102,241,0.12)' : 'var(--bg)',
                      border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                      color: active ? '#6366f1' : 'var(--muted)',
                      cursor: 'pointer',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {active ? '✓ ' : '+ '}{kw}
                  </button>
                );
              })}
            </div>

            {/* Selected custom keywords */}
            {keywords.filter((k) => !KEYWORD_SUGGESTIONS[role].includes(k)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {keywords
                  .filter((k) => !KEYWORD_SUGGESTIONS[role].includes(k))
                  .map((kw) => (
                    <span
                      key={kw}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.4)' }}
                    >
                      {kw}
                      <button
                        onClick={() => toggleKeyword(kw)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: 0, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {/* Custom input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customKw}
                onChange={(e) => setCustomKw(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                placeholder="Add your own keyword..."
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
              <button
                onClick={addCustom}
                disabled={!customKw.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{
                  background: customKw.trim() ? '#6366f1' : 'var(--border)',
                  color: customKw.trim() ? '#fff' : 'var(--muted)',
                  border: 'none',
                  cursor: customKw.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Saved locally on this device
          </span>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Apply Preferences →
          </button>
        </div>
      </div>
    </div>
  );
}
