'use client';
import { useState } from 'react';
import { Article, ArticleCategory, TimelineEvent } from '../types';
import { PlusCircle, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  articles: Article[];
  onAddArticle: (article: Article) => void;
  onAddUpdate: (articleId: string, event: TimelineEvent) => void;
  onNavigateToFeed: () => void;
}

export default function NewsSubmitter({
  articles,
  onAddArticle,
  onAddUpdate,
  onNavigateToFeed,
}: Props) {
  const [formType, setFormType] = useState<'new' | 'update'>('new');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [author, setAuthor] = useState('');

  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'idle' | 'success' | 'failed'>('idle');
  const [scanMessage, setScanMessage] = useState('');

  const runAIScanner = (text: string): Promise<boolean> => {
    return new Promise(resolve => {
      const keywords = [
        'שריר', 'סוכר', 'שבב', 'לב', 'ריצה', 'תזונה', 'בריאות', 'מחלה', 'רפוא', 
        'גוף', 'מוח', 'שומן', 'כושר', 'ספורט', 'אוכל', 'אימון', 'תאים', 'גנטי',
        'הזדקנות', 'דם', 'אנרגיה', 'עיכול', 'מיקרוביום', 'לייזר', 'חיישן', 'wearable'
      ];
      
      const lowerText = text.toLowerCase();
      const hasMatch = keywords.some(k => lowerText.includes(k));

      setTimeout(() => {
        resolve(hasMatch);
      }, 1200);
    });
  };

  const handleNewArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setScanning(true);
    setScanResult('idle');
    setScanMessage('מנוע AI סורק את הידיעה ומנתח זיקה פיזיולוגית וטכנולוגית...');

    const isApproved = await runAIScanner(title + ' ' + content);

    if (!isApproved) {
      setScanning(false);
      setScanResult('failed');
      setScanMessage('ההגשה נדחתה על ידי מנהל התוכן: הידיעה אינה מראה זיקה ישירה לפיתוחי טכנולוגיה המשפיעים על הבריאות, הספורט, התזונה או גוף האדם.');
      return;
    }

    let category: ArticleCategory = 'health';
    const text = (title + ' ' + content).toLowerCase();
    if (text.includes('תזונה') || text.includes('אוכל') || text.includes('סוכר') || text.includes('מעי') || text.includes('מיקרוביום')) {
      category = 'nutrition';
    } else if (text.includes('ספורט') || text.includes('ריצה') || text.includes('כושר') || text.includes('אימון') || text.includes('שריר')) {
      category = 'sports';
    } else if (text.includes('מוח') || text.includes('גנטי') || text.includes('תאים') || text.includes('הזדקנות') || text.includes('שבב')) {
      category = 'body';
    }

    const randomImpact = parseFloat((Math.random() * 2 + 7.5).toFixed(1));
    const randomConfidence = Math.floor(Math.random() * 3 + 7);

    const newArticle: Article = {
      id: crypto.randomUUID(),
      title,
      summary: content.slice(0, 150) + '...',
      content,
      category,
      impactScore: randomImpact,
      scientificConfidence: randomConfidence,
      clinicalStage: 'מחקר תיאורטי',
      readTime: "4 דק' קריאה",
      author: author.trim() || 'מערכת פולס-טק',
      source: source.trim() || 'דיווח קוראים',
      publishedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      physiologicalImpact: category === 'nutrition' 
        ? ['מערכת המטבוליזם', 'מערכת העיכול'] 
        : category === 'sports' 
        ? ['מערכת השריר-שלד', 'מערכת הנשימה והלב']
        : category === 'body'
        ? ['מערכת העצבים המרכזית', 'הזדקנות תאית']
        : ['מערכת הבריאות הכללית'],
      timeline: [
        {
          id: crypto.randomUUID(),
          title: 'הכרזה רשמית ודיווח ראשוני',
          description: title,
          timestamp: new Date().toISOString()
        }
      ]
    };

    onAddArticle(newArticle);
    setScanning(false);
    setScanResult('success');
    setScanMessage(`הידיעה נסרקה בהצלחה! סווגה כ-${
      category === 'health' ? 'בריאות דיגיטלית' : category === 'sports' ? 'טכנולוגיית ספורט' : category === 'nutrition' ? 'תזונה ומטבוליזם' : 'גוף האדם'
    } וקיבלה ציון השפעה של ${randomImpact}. מעביר אותך לפיד...`);

    setTimeout(() => {
      onNavigateToFeed();
      setTitle('');
      setContent('');
      setSource('');
      setAuthor('');
      setScanResult('idle');
    }, 2000);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticleId || !updateTitle.trim() || !updateDescription.trim()) return;

    setScanning(true);
    setScanResult('idle');
    setScanMessage('מנתח את העדכון הטכנולוגי והתאמתו לציר הזמן של המחקר...');

    const isApproved = await runAIScanner(updateTitle + ' ' + updateDescription);

    if (!isApproved) {
      setScanning(false);
      setScanResult('failed');
      setScanMessage('העדכון נדחה: הטקסט שהוזן אינו מכיל התפתחות רלוונטית הממשיכה את המחקר המקורי.');
      return;
    }

    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      title: updateTitle,
      description: updateDescription,
      timestamp: new Date().toISOString(),
      isNew: true
    };

    onAddUpdate(selectedArticleId, newEvent);
    setScanning(false);
    setScanResult('success');
    setScanMessage('העדכון התקבל בהצלחה! הכתבה הוקפצה לראש הפיד הכללי. מעביר לפיד...');

    setTimeout(() => {
      onNavigateToFeed();
      setSelectedArticleId('');
      setUpdateTitle('');
      setUpdateDescription('');
      setScanResult('idle');
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50 rounded-none" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-none border border-slate-200 shadow-sm p-6 lg:p-8">
        
        {/* Header */}
        <div className="mb-6 border-b border-slate-200 pb-5">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PlusCircle className="text-blue-600" />
            <span>הגשת ידיעה חדשה או עדכון</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            מנוע ה-AI שלנו יסרוק את התוכן שהזנת, יאשר את הרלוונטיות שלו, ויקטלג אותו לציר הזמן.
          </p>
        </div>

        {/* Toggle Form Type */}
        <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-none mb-6">
          <button
            type="button"
            onClick={() => { setFormType('new'); setScanResult('idle'); }}
            className={`flex-1 py-2.5 rounded-none text-xs font-bold transition-all ${
              formType === 'new'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            פרסום כתבה ביו-טק חדשה
          </button>
          <button
            type="button"
            onClick={() => { setFormType('update'); setScanResult('idle'); }}
            className={`flex-1 py-2.5 rounded-none text-xs font-bold transition-all ${
              formType === 'update'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            דיווח על התפתחות בכתבה קיימת
          </button>
        </div>

        {/* Simulated AI Checker Status */}
        {scanning && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-none flex items-center gap-3 animate-pulse">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-xs font-semibold">{scanMessage}</span>
          </div>
        )}

        {scanResult === 'success' && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-none flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-600" />
            <span className="text-xs font-semibold">{scanMessage}</span>
          </div>
        )}

        {scanResult === 'failed' && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-none flex items-center gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <span className="text-xs font-semibold">{scanMessage}</span>
          </div>
        )}

        {/* FORM 1: NEW ARTICLE */}
        {formType === 'new' && (
          <form onSubmit={handleNewArticleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">כותרת הידיעה *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="לדוגמה: נעלי ריצה חכמות המזהות שברי מאמץ לפני הופעת כאב"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-3 outline-none focus:bg-white focus:border-slate-400 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">תוכן הידיעה המלא *</label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="תאר את הפיתוח הטכנולוגי, כיצד הוא פועל, ואילו מערכות בגוף האדם הוא מנטר או משפר..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-3 outline-none focus:bg-white focus:border-slate-400 text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">מקור הידיעה</label>
                <input
                  type="text"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="לדוגמה: MIT Technology Review"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-3 outline-none focus:bg-white text-slate-900"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">שם הכותב/חוקר</label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="לדוגמה: פרופ׳ יסמין כהן"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-3 outline-none focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={scanning}
                className="px-6 py-3 bg-slate-900 text-white rounded-none text-xs font-bold hover:bg-blue-600 disabled:bg-slate-300 transition-colors shadow-sm"
              >
                סרוק והעלה לפיד במעקב
              </button>
            </div>
          </form>
        )}

        {/* FORM 2: UPDATE EXISTING ARTICLE */}
        {formType === 'update' && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">בחר כתבה קיימת לעדכון *</label>
              <select
                required
                value={selectedArticleId}
                onChange={e => setSelectedArticleId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-3 outline-none focus:bg-white text-slate-900 font-medium"
              >
                <option value="">-- בחר כתבה מהמאגר --</option>
                {articles.map(art => (
                  <option key={art.id} value={art.id}>
                    [{art.category === 'health' ? 'בריאות' : art.category === 'sports' ? 'ספורט' : art.category === 'nutrition' ? 'תזונה' : 'גוף האדם'}] {art.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">כותרת ההתפתחות (העדכון החם) *</label>
              <input
                type="text"
                required
                value={updateTitle}
                onChange={e => setUpdateTitle(e.target.value)}
                placeholder="לדוגמה: התקבל אישור פטנט או תוצאות ניסוי שלב 2"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-3 outline-none focus:bg-white text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">תיאור ההתפתחות והשפעתה *</label>
              <textarea
                required
                rows={4}
                value={updateDescription}
                onChange={e => setUpdateDescription(e.target.value)}
                placeholder="פרט מה השתנה במחקר, אילו תוצאות חדשות התקבלו ומה המשמעות להמשך..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-none p-3 outline-none focus:bg-white text-slate-900 font-medium"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={scanning || !selectedArticleId}
                className="px-6 py-3 bg-slate-900 text-white rounded-none text-xs font-bold hover:bg-blue-600 disabled:bg-slate-300 transition-colors shadow-sm"
              >
                סרוק והקפץ כתבה לראש הפיד
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
