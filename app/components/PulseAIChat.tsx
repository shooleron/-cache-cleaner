'use client';
import { useState, useRef, useEffect } from 'react';
import { Article, ChatMessage } from '../types';
import { Send, Sparkles } from 'lucide-react';

interface Props {
  article: Article;
}

export default function PulseAIChat({ article }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `שלום! אני PulseAI, יועץ המדע והטכנולוגיה שלך. שאל אותי כל דבר על המחקר: "${article.title}". באפשרותי להסביר את ההשפעות הפיזיולוגיות, האתגרים הקליניים והטכנולוגיה העומדת מאחוריו.`,
        timestamp: new Date(),
      },
    ]);
  }, [article]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateResponse(textToSend.toLowerCase());
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (query: string): string => {
    const text = query.trim();

    if (text.includes('השפעה') || text.includes('איברים') || text.includes('גוף') || text.includes('פיזיולוג')) {
      const systems = article.physiologicalImpact.join(', ');
      return `טכנולוגיה זו משפיעה בעיקר על: **${systems}**. 
ניתוח מנגנון הפעולה מראה השפעה ישירה על רמת הרקמות והתפקוד העצבי/מטבולי.`;
    }

    if (text.includes('מתי') || text.includes('זמין') || text.includes('שוק') || text.includes('קנייה')) {
      if (article.clinicalStage === 'אישור FDA / זמין בשוק') {
        return `הבשורה הטובה היא שהטכנולוגיה כבר נמצאת בשלב של **${article.clinicalStage}**!`;
      }
      return `כרגע הטכנולוגיה נמצאת בשלב של **${article.clinicalStage}**. מעבר לשוק הצרכני יתרחש בשנתיים הקרובות.`;
    }

    if (text.includes('סיכון') || text.includes('בטיח') || text.includes('תופעות לוואי')) {
      return `בכל הנוגע לבטיחות, המהימנות המדעית עומדת על **${article.scientificConfidence}/10**. 
הסיכונים מבוקרים תחת תקני ה-FDA.`;
    }

    return `שאלה מצוינת. בהתייחס למחקר על ${article.title}, מדובר בפריצת דרך בקטגוריית הבריאות והביוטכנולוגיה.`;
  };

  const suggestions = [
    'כיצד זה משפיע על גוף האדם?',
    'מהם הסיכונים ותופעות הלוואי?',
    'מתי זה יהיה זמין לציבור?',
    'מהי רמת המהימנות המדעית?',
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 border-t border-slate-200 rounded-none" dir="rtl">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center gap-2 rounded-none">
        <Sparkles size={16} className="text-blue-600" />
        <span className="font-bold text-xs text-slate-800">היועץ המדעי PulseAI</span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'mr-auto items-start' : 'ml-auto items-end'
            }`}
          >
            <div
              className={`p-3 text-xs leading-relaxed rounded-none ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white border-r-4 border-r-blue-500'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>
                  {line}
                </p>
              ))}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">
              {msg.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="ml-auto items-end flex flex-col">
            <div className="p-3 bg-white border border-slate-200 shadow-sm flex items-center gap-1.5 rounded-none">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-none animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-none animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-none animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 bg-slate-50 flex flex-wrap gap-1.5 border-t border-slate-200">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-[10px] font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-1 rounded-none transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 rounded-none"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="שאל משהו על המחקר..."
          className="flex-1 text-xs bg-slate-50 border border-slate-200 px-3.5 py-2.5 outline-none focus:bg-white focus:border-slate-400 transition-all text-slate-900 rounded-none"
          dir="rtl"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 transition-colors rounded-none"
        >
          <Send size={15} className="rotate-180" />
        </button>
      </form>
    </div>
  );
}
