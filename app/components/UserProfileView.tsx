'use client';
import { UserProfile } from '../types';
import { Sparkles, Check } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const AVAILABLE_INTERESTS = [
  { id: 'longevity', label: 'אריכות ימים ומניעת הזדקנות', category: 'body' },
  { id: 'wearables', label: 'חיישנים ומכשור לביש', keyword: 'שבב' },
  { id: 'biohacking', label: 'ביו-האקינג ושיפור קוגניטיבי', category: 'body' },
  { id: 'nutrition', label: 'תזונה מטבולית ומדע המזון', category: 'nutrition' },
  { id: 'preventive', label: 'רפואה מונעת ואבחון ביתי', category: 'health' },
  { id: 'fitness', label: 'שיקום שרירים ופיזיולוגיית ספורט', category: 'sports' },
];

export default function UserProfileView({ profile, onUpdateProfile }: Props) {
  const toggleInterest = (interestLabel: string) => {
    const isSelected = profile.interests.includes(interestLabel);
    let newInterests: string[];
    if (isSelected) {
      newInterests = profile.interests.filter(i => i !== interestLabel);
    } else {
      newInterests = [...profile.interests, interestLabel];
    }
    onUpdateProfile({ ...profile, interests: newInterests });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50 rounded-none" dir="rtl">
      <div className="max-w-xl mx-auto bg-white rounded-none border border-slate-200 shadow-sm p-6 lg:p-8">
        
        {/* Header section */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-200">
          <div className="w-14 h-14 bg-slate-900 flex items-center justify-center text-white text-xl font-bold shadow-sm rounded-none border-b-4 border-b-blue-500">
            YA
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">פרופיל בריאות מותאם אישית</h2>
            <p className="text-xs text-slate-500">הגדר את תחומי העניין שלך כדי לקבל דירוג התאמה לכל ידיעה מדעית</p>
          </div>
        </div>

        {/* User Info Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">שם המשתמש</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => onUpdateProfile({ ...profile, name: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-3 outline-none focus:bg-white text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">תדירות קבלת סיכומים בדוא"ל</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateProfile({ ...profile, frequency: 'daily' })}
                className={`py-2.5 px-4 rounded-none text-xs font-bold border transition-all ${
                  profile.frequency === 'daily'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                סיכום יומי (הכי פופולרי)
              </button>
              <button
                type="button"
                onClick={() => onUpdateProfile({ ...profile, frequency: 'weekly' })}
                className={`py-2.5 px-4 rounded-none text-xs font-bold border transition-all ${
                  profile.frequency === 'weekly'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                סיכום שבועי מרוכז
              </button>
            </div>
          </div>

          {/* Interest Chips Multi-Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">תחומי עניין ומחקרי יעד *</label>
            <div className="grid grid-cols-1 gap-2.5">
              {AVAILABLE_INTERESTS.map(interest => {
                const isSelected = profile.interests.includes(interest.label);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.label)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-none border text-right transition-all ${
                      isSelected
                        ? 'bg-slate-50 border-slate-900 border-r-4 border-r-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900">{interest.label}</span>
                    <div className={`w-5 h-5 rounded-none border flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-300'
                    }`}>
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Explanation Card */}
        <div className="mt-8 p-4 bg-slate-50 rounded-none border border-slate-200 flex gap-3">
          <Sparkles className="text-blue-600 shrink-0 mt-0.5" size={16} />
          <div>
            <span className="block text-xs font-bold text-slate-800 mb-0.5">כיצד זה משפיע על הפיד?</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              מערכת PulseAI מנתחת את הקטגוריות והמילים המובילות בכל כתבה ומחשבת אחוז התאמה לפרופיל שלך. 
              כתבות מומלצות יסומנו בתווית "התאמה לפרופיל" כדי לעזור לך להתמקד במה שמעניין אותך ביותר.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
