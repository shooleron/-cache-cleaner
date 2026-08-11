'use client';
import { useState } from 'react';
import { TrendingUp, Award, Activity, Heart, Sparkles } from 'lucide-react';
import { Article } from '../types';

interface Props {
  articles: Article[];
}

export default function TrendAnalyzer({ articles }: Props) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const totalArticles = articles.length;
  const totalDevelopments = articles.reduce((sum, a) => sum + a.timeline.length, 0);
  const avgImpact = (articles.reduce((sum, a) => sum + a.impactScore, 0) / totalArticles).toFixed(1);

  const fundingData = [
    { category: 'body', name: 'גוף האדם ואריכות ימים', amount: 480, color: '#4f46e5', count: articles.filter(a => a.category === 'body').length },
    { category: 'health', name: 'בריאות דיגיטלית', amount: 410, color: '#0d9488', count: articles.filter(a => a.category === 'health').length },
    { category: 'nutrition', name: 'תזונה ומטבוליזם', amount: 290, color: '#d97706', count: articles.filter(a => a.category === 'nutrition').length },
    { category: 'sports', name: 'טכנולוגיית ספורט', amount: 230, color: '#059669', count: articles.filter(a => a.category === 'sports').length },
  ];

  const bodySystems = [
    { name: 'מערכת העצבים', count: 4, percentage: 35, color: 'bg-indigo-600' },
    { name: 'שריר-שלד', count: 3, percentage: 25, color: 'bg-emerald-600' },
    { name: 'מערכת העיכול והמיקרוביום', count: 2, percentage: 20, color: 'bg-teal-600' },
    { name: 'לב וכלי דם', count: 2, percentage: 20, color: 'bg-rose-600' },
  ];

  const maxFunding = Math.max(...fundingData.map(d => d.amount));

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50 rounded-none" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">מנתח מגמות ונתוני ביו-טק</h2>
            <p className="text-xs text-slate-500 mt-1">סקירה אנליטית של ההשקעות, ההתפתחויות וההשפעות הפיזיולוגיות</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-none px-3.5 py-2 self-start shadow-sm">
            <span className="w-2.5 h-2.5 rounded-none bg-emerald-500 animate-signal" />
            <span className="text-xs font-bold text-slate-700">עדכון נתונים חי</span>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-bold">סך הכל כתבות במעקב</span>
              <span className="text-2xl font-bold text-slate-900">{totalArticles}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-bold">התפתחויות ועדכונים רשומים</span>
              <span className="text-2xl font-bold text-slate-900">{totalDevelopments}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
              <Award size={24} />
            </div>
            <div>
              <span className="block text-xs text-slate-500 font-bold">ממוצע מדד השפעה (Impact)</span>
              <span className="text-2xl font-bold text-slate-900">{avgImpact}/10</span>
            </div>
          </div>
        </div>

        {/* Charts section split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 md:p-8 rounded-none border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                <span>השקעות הון-סיכון גלובליות לשנת 2026 (במיליוני $)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-6">רחף מעל העמודות לצפייה במספר הכתבות במאגר</p>

              <div className="space-y-4">
                {fundingData.map((d, index) => {
                  const percentage = (d.amount / maxFunding) * 100;
                  return (
                    <div
                      key={d.category}
                      className="space-y-1.5"
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800">{d.name}</span>
                        <span className="text-slate-500">${d.amount}M</span>
                      </div>
                      <div className="relative w-full h-7 bg-slate-100 rounded-none border border-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-none transition-all duration-300 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: d.color,
                            opacity: hoveredBar === null || hoveredBar === index ? 1 : 0.6,
                          }}
                        />
                        {hoveredBar === index && (
                          <div className="absolute inset-0 flex items-center justify-end px-3">
                            <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-none border border-slate-800 shadow-sm">
                              {d.count} כתבות פעילות
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>מקור: CB Insights & BioTech reports</span>
              <span className="text-slate-900 font-bold">סה"כ: $1.41B</span>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-none border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
              <Heart size={16} className="text-rose-600" />
              <span>פילוח לפי מערכות פיזיולוגיות בגוף האדם</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">מערכות גוף הזוכות להכי הרבה פיתוחים ועדכוני מעקב</p>

            <div className="space-y-3.5">
              {bodySystems.map((s, idx) => (
                <div
                  key={s.name}
                  className={`flex items-center justify-between p-3 border transition-all rounded-none ${
                    hoveredSlice === idx 
                      ? 'bg-slate-100 border-slate-400' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                  onMouseEnter={() => setHoveredSlice(idx)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-none ${s.color}`} />
                    <span className="text-xs font-bold text-slate-800">{s.name}</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-900">{s.percentage}%</span>
                    <span className="block text-[10px] text-slate-500">{s.count} פיתוחים מובילים</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
