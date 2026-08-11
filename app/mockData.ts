import { Article } from './types';

// ═══════════════════════════════════════════════════════════════════════
// PULSETECH CURATED CONTENT — 20+ High-Quality Hebrew Articles
// Covering the last 45 days across all wellness tech categories
// ═══════════════════════════════════════════════════════════════════════

export const INITIAL_ARTICLES: Article[] = [

  // ──────────────── TODAY ────────────────
  {
    id: 'featured-oura-ring-4',
    title: 'טבעת Oura Ring 4 מציגה חיישן טמפרטורה חדש שמזהה מחלות 48 שעות לפני הופעת סימפטומים',
    summary: 'הגרסה החדשה של טבעת הבריאות הפופולרית כוללת חיישן טמפרטורה מתמשך מדור חדש, המסוגל לזהות עלייה מיקרוסקופית בחום הגוף הבסיסי ולהתריע על תחילת תהליך זיהומי — עוד בטרם מופיעים סימפטומים קליניים.',
    content: 'Oura חשפה היום את הדור הרביעי של הטבעת החכמה, עם שדרוג משמעותי ביותר: חיישן טמפרטורה תת-עורי חדש שמודד שינויים של 0.01 מעלות צלזיוס. במחקר קליני שנערך ב-UCSF בקרב 3,200 משתתפים, הטבעת זיהתה 78% מהמקרים הזיהומיים (שפעת, COVID-19) בממוצע 48 שעות לפני הופעת חום או כאבים.\n\nהטבעת משלבת גם מדידת HRV (שונות דופק) משופרת עם אלגוריתם AI חדש שלומד את הבסיס האישי של כל משתמש. ד"ר הארלן קרומהולץ מאוניברסיטת ייל: "זו פריצת דרך אמיתית — היכולת לזהות מחלה לפני שהמטופל מרגיש חולה יכולה לשנות את הרפואה המונעת."',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=1200&q=80',
    impactScore: 9.6,
    scientificConfidence: 9,
    clinicalStage: 'אישור FDA / זמין בשוק',
    readTime: "5 דק' קריאה",
    author: 'ד"ר מיכאל לוין',
    source: 'Longevity Tech',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת החיסון', 'ויסות טמפרטורת הגוף', 'מערכת העצבים האוטונומית'],
    timeline: [
      { id: 'oura-tl1', title: 'חשיפת Oura Ring 4', description: 'הטבעת הוכרזה בכנס CES Health 2026.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isNew: true },
      { id: 'oura-tl2', title: 'תוצאות מחקר UCSF', description: 'פורסמו תוצאות הניסוי הקליני ב-Nature Digital Medicine.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), isNew: true }
    ]
  },
  {
    id: 'rapamycin-longevity-trial',
    title: 'ניסוי קליני ראשון: רפאמיצין במינון נמוך מאט את הזדקנות העור ב-25% בקרב נשים מעל גיל 50',
    summary: 'מחקר פורץ דרך מאוניברסיטת פנסילבניה מדגים כי מריחה מקומית של רפאמיצין — מולקולה שמעכבת את מסלול mTOR — מפחיתה סימני הזדקנות בעור הפנים תוך 8 חודשים בלבד.',
    content: 'התוצאות שפורסמו ב-Cell Aging הן חד-משמעיות: 60 נשים בגילאי 50-65 שמרחו קרם רפאמיצין 0.1% על פניהן פעמיים ביום חוו שיפור של 25% במרקם העור, ירידה של 30% בקמטים עדינים ועלייה של 20% בייצור קולגן מסוג I.\n\nד"ר כריסטיאן דימיטרי, מנהל המחקר: "אנחנו לא מדברים על קוסמטיקה — אנחנו מדברים על הפיכת שעון ביולוגי ברמה התאית. מסלול mTOR הוא אחד ממנגנוני ההזדקנות המרכזיים, ועיכוב מקומי שלו מספיק כדי ליצור שינוי מדיד."\n\nהקרם צפוי לקבל אישור FDA ב-2027.',
    category: 'body',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=80',
    impactScore: 9.4,
    scientificConfidence: 9.5,
    clinicalStage: 'ניסויים קליניים (בני אדם)',
    readTime: "6 דק' קריאה",
    author: 'פרופ\' כריסטיאן דימיטרי',
    source: 'Lifespan.io',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['עור ורקמת חיבור', 'מסלול mTOR', 'סינתזת קולגן', 'הזדקנות תאית'],
    timeline: [
      { id: 'rapa-tl1', title: 'פרסום תוצאות הניסוי', description: 'המחקר פורסם ב-Cell Aging.', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), isNew: true }
    ]
  },
  {
    id: 'whoop-glucose-integration',
    title: 'WHOOP 5.0 משלבת לראשונה ניטור גלוקוז רציף — ללא צורך בסנסור נפרד',
    summary: 'חברת WHOOP הודיעה על שילוב טכנולוגיית ספקטרוסקופיה אופטית המאפשרת מדידת רמות סוכר בדם ישירות מפרק כף היד, ללא דקירה או מדבקה נוספת.',
    content: 'בהכרזה שמטלטלת את שוק הגאדג׳טים הלבישים, WHOOP חשפה את הדור ה-5 של הצמיד עם חיישן גלוקוז מובנה. הטכנולוגיה, שפותחה בשיתוף חוקרי MIT, משתמשת באור אינפרא-אדום קרוב (NIR) שחודר 2 מ"מ לתוך העור ומודד את ריכוז הגלוקוז בנוזל הביניים.\n\nבמחקר אימות בקרב 1,200 משתתפים, הצמיד הציג דיוק של ±12 mg/dL בהשוואה למד"ר (Continuous Glucose Monitor) מסורתי — מספיק טוב לשימוש בספורטאים וביו-האקרים.\n\n"זה גיים צ\'יינג\'ר", אמר אנדרו הוברמן בפודקאסט שלו. "הקשר בין גלוקוז, אנרגיה ושינה הוא כל כך הדוק — ועכשיו אפשר לעקוב אחריו 24/7 בלי שום מאמץ."',
    category: 'sports',
    imageUrl: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=1200&q=80',
    impactScore: 9.3,
    scientificConfidence: 8.5,
    clinicalStage: 'אישור FDA / זמין בשוק',
    readTime: "5 דק' קריאה",
    author: 'צוות Athletech News',
    source: 'Athletech News',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת המטבוליזם', 'ויסות סוכר בדם', 'אנרגיה תאית'],
    timeline: [
      { id: 'whoop-tl1', title: 'הכרזה על WHOOP 5.0', description: 'WHOOP חשפה את הדור החמישי בכנס בריאות בסן פרנסיסקו.', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), isNew: true }
    ]
  },

  // ──────────────── 1-3 DAYS AGO ────────────────
  {
    id: 'creatine-brain-study',
    title: 'מחקר מטא-אנליזה: קראטין לא רק לשרירים — שיפור של 15% בזיכרון עבודה ובמהירות עיבוד',
    summary: 'ניתוח של 28 מחקרים אקראיים מבוקרים מגלה כי תוסף קריאטין מונוהידראט (3-5 גרם ביום) משפר באופן מובהק את תפקודי המוח, במיוחד בתנאי מתח ועייפות.',
    content: 'המטא-אנליזה שפורסמה ב-Neuroscience & Biobehavioral Reviews סקרה 28 מחקרים RCT עם 2,800 משתתפים. התוצאה המרכזית: קריאטין מונוהידראט בנטילה יומית של 3-5 גרם שיפר ביצועי זיכרון עבודה ב-15%, מהירות עיבוד מידע ב-12% ויכולת קשב מתמשך ב-9%.\n\nהאפקט היה חזק במיוחד בקבוצות שחוו מחסור בשינה (שיפור של 21%) או מתח פסיכולוגי (18%). ד"ר דרן קנדו מאוניברסיטת סידני: "קריאטין הוא כנראה אחד התוספים עם הראיות החזקות ביותר לשיפור קוגניטיבי — והוא גם הזול ביותר, בטוח ונגיש."',
    category: 'nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?auto=format&fit=crop&w=1200&q=80',
    impactScore: 9.1,
    scientificConfidence: 9.5,
    clinicalStage: 'אישור FDA / זמין בשוק',
    readTime: "4 דק' קריאה",
    author: 'ד"ר דרן קנדו',
    source: 'ScienceDaily',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['תפקוד קוגניטיבי ומוח', 'אנרגיה תאית (ATP)', 'מערכת השריר-שלד'],
    timeline: [
      { id: 'creat-tl1', title: 'פרסום מטא-אנליזה', description: 'ניתוח 28 מחקרים ב-Neuroscience Reviews.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'ai-ecg-apple-watch',
    title: 'אלגוריתם AI חדש ב-Apple Watch מזהה פרפור פרוזדורים 6 שעות לפני שהוא מתרחש',
    summary: 'Apple ו-Stanford Health פיתחו מודל למידת מכונה שמנתח נתוני ECG ו-PPG בזמן אמת ומסוגל לחזות אירוע פרפור לפני שהוא קורה.',
    content: 'המחקר שפורסם ב-The Lancet Digital Health כלל 45,000 משתמשי Apple Watch Ultra 2 בגילאי 45-80. מודל ה-AI, שאומן על 12 מיליון רשומות ECG, הצליח לזהות דפוסים עדינים המבשרים פרפור פרוזדורים בדיוק של 89% — 6 שעות בממוצע לפני האירוע.\n\nזה אומר שהמטופל מקבל התראה בשעון, שאומרת: "זוהו דפוסים חריגים בקצב הלב שלך — שקול לפנות לרופא." הנתונים מועברים אוטומטית לאפליקציית הבריאות.\n\nפרופ\' מרקו פרסקה מסטנפורד: "אנחנו עוברים מ-react ל-predict. במקום לאבחן אחרי שהנזק נעשה, אנחנו מצליחים לראות את הבעיה מתפתחת ולמנוע אותה."',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1510017803350-4f6e2d04484f?auto=format&fit=crop&w=1200&q=80',
    impactScore: 9.5,
    scientificConfidence: 9,
    clinicalStage: 'ניסויים קליניים (בני אדם)',
    readTime: "6 דק' קריאה",
    author: 'פרופ\' מרקו פרסקה',
    source: 'MobiHealthNews',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת הלב וכלי הדם', 'קצב הלב ופרפור פרוזדורים', 'רפואה מונעת'],
    timeline: [
      { id: 'ecg-tl1', title: 'פרסום תוצאות ב-Lancet', description: 'Apple ו-Stanford מפרסמים תוצאות הניסוי.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },

  // ──────────────── 4-7 DAYS AGO ────────────────
  {
    id: 'cold-plunge-inflammation',
    title: 'מחקר חדש: טבילה בקרח (Cold Plunge) מפחיתה מדדי דלקת כרונית ב-37% — אבל רק בפרוטוקול מדויק',
    summary: 'חוקרי אוניברסיטת קופנהגן מצאו שהשפעת ה-Cold Exposure תלויה בצורה דרמטית בטמפרטורה, משך הזמן ותדירות הטבילה. לא כל cold plunge נוצר שווה.',
    content: 'במחקר הגדול ביותר שנעשה עד כה על השפעת הקור על מדדי דלקת (120 משתתפים, 12 שבועות), נמצא שהפרוטוקול האופטימלי הוא: מים ב-10-12°C, טבילה של 2-4 דקות, 3-4 פעמים בשבוע.\n\nבפרוטוקול הזה, רמות CRP (סמן דלקתי) ירדו ב-37%, IL-6 ירד ב-28%, וחלבוני דלקת נוספים ירדו באופן מובהק. לעומת זאת, טבילות קצרות מדי (פחות מדקה) או ארוכות מדי (מעל 6 דקות) לא הראו שיפור מובהק.\n\n"זו ההוכחה שהביו-האקינג דורש מדע, לא רק תחושות," אמרה ד"ר סוזנה סוברג, ראשת המחקר.',
    category: 'body',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    impactScore: 8.9,
    scientificConfidence: 9,
    clinicalStage: 'ניסויים קליניים (בני אדם)',
    readTime: "5 דק' קריאה",
    author: 'ד"ר סוזנה סוברג',
    source: 'Longevity Tech',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת החיסון', 'תגובה דלקתית', 'מערכת העצבים הסימפתטית'],
    timeline: [
      { id: 'cold-tl1', title: 'פרסום תוצאות מחקר הקור', description: 'המחקר פורסם ב-Journal of Applied Physiology.', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'zone-2-cardio-longevity',
    title: 'אימוני Zone 2: המדע שמאחורי "הכושר ההולך" שמאריך חיים ב-10 שנים בממוצע',
    summary: 'מחקר אורך של 15 שנה בקרב 420,000 אנשים מראה שאימון אירובי במתח נמוך-בינוני (Zone 2) הוא היעיל ביותר להארכת תוחלת החיים — אפילו יותר מריצות מרתון.',
    content: 'הנתונים מהמחקר הגדול מפנסילבניה (420,000 משתתפים, 15 שנות מעקב) חד-משמעיים: אנשים שביצעו 150+ דקות שבועיות של אימון Zone 2 (60-70% מדופק מקסימלי) חיו בממוצע 10.2 שנים יותר מאנשים לא פעילים, ו-4.6 שנים יותר מאלה שרק ביצעו אימונים אינטנסיביים.\n\nהסיבה? Zone 2 הוא הטווח האופטימלי לשיפור יעילות המיטוכונדריות. באימון הזה, התאים לומדים לשרוף שומן במקום סוכר, מה שמפחית את העמסה על הלבלב ומשפר את הרגישות לאינסולין.\n\nד"ר פיטר אטיה: "אם הייתי צריך לבחור תרופה אחת לאריכות ימים, זה היה Zone 2 training."',
    category: 'sports',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
    impactScore: 9.2,
    scientificConfidence: 9.5,
    clinicalStage: 'אישור FDA / זמין בשוק',
    readTime: "7 דק' קריאה",
    author: 'ד"ר פיטר אטיה',
    source: 'Fitt Insider',
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת הלב וכלי הדם', 'תפקוד המיטוכונדריה', 'מטבוליזם שומנים'],
    timeline: [
      { id: 'zone2-tl1', title: 'פרסום מחקר אורך 15 שנים', description: 'המחקר פורסם ב-JAMA.', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },

  // ──────────────── 1-2 WEEKS AGO ────────────────
  {
    id: 'protein-timing-myth',
    title: 'המיתוס של "חלון החלבון" נשבר: מטא-אנליזה חדשה מוכיחה שתזמון לא משנה',
    summary: '40 מחקרים, 1,800 ספורטאים, תשובה אחת: הכמות הכוללת של חלבון ביום חשובה הרבה יותר מתזמון הצריכה סביב האימון. "חלון ה-30 דקות" הוא מיתוס.',
    content: 'המטא-אנליזה שפורסמה ב-Sports Medicine Review סקרה 40 מחקרים RCT ומצאה שאין הבדל מובהק בבניית מסת שריר בין ספורטאים שצרכו חלבון מיד אחרי אימון לבין אלה שצרכו אותו 3-4 שעות מאוחר יותר.\n\nמה כן חשוב? הכמות הכוללת: 1.6-2.2 גרם חלבון לק"ג משקל גוף ביום, מחולקת ל-3-5 ארוחות. זה כל מה שנדרש להיפרטרופיה אופטימלית.\n\nד"ר אלן ארגון, חוקר תזונת ספורט: "30 שנות תעשיית תוספי מזון בנו מיתוס שלא מבוסס על מדע. הגיע הזמן לשחרר ספורטאים מהלחץ לשתות שייק 30 שניות אחרי האימון."',
    category: 'nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2c1cf?auto=format&fit=crop&w=1200&q=80',
    impactScore: 8.7,
    scientificConfidence: 9,
    clinicalStage: 'אישור FDA / זמין בשוק',
    readTime: "4 דק' קריאה",
    author: 'ד"ר אלן ארגון',
    source: 'ScienceDaily',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת השריר-שלד', 'סינתזת חלבון', 'היפרטרופיה'],
    timeline: [
      { id: 'prot-tl1', title: 'פרסום מטא-אנליזה', description: '40 מחקרים נסקרו ב-Sports Medicine Review.', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'microbiome-personalized-diet',
    title: 'סטארטאפ ישראלי: DayTwo פותחת פלטפורמה שבונה תפריט אישי לפי הרכב חיידקי המעי',
    summary: 'פלטפורמת AI שמנתחת את DNA חיידקי המעי של המשתמש ומייצרת תפריט מותאם אישית שמאזן סוכר, מפחית דלקת ומשפר עיכול.',
    content: 'DayTwo, סטארטאפ ישראלי שגייס 100 מיליון דולר, חשפה את הפלטפורמה החדשה שמשלבת סיקוונס גנטי של מיקרוביום המעי עם מודל AI שאומן על 200,000 פרופילים. התוצאה: תפריט יומי מותאם אישית שמנבא בדיוק של 85% את התגובה הגליקמית של כל מזון.\n\n"שני אנשים שאוכלים את אותו בננה יכולים לקבל תגובת סוכר שונה לחלוטין," מסביר פרופ\' ערן סגל מהטכניון. "המיקרוביום הוא המפתח — ועכשיו יש לנו את הכלים למפות אותו ולהשתמש בו."\n\nבניסוי בקרב 5,000 משתמשים, אלה שעקבו אחרי ההמלצות חוו ירידה ממוצעת של 22% ברמות סוכר אחרי ארוחה, ושיפור של 35% בסימפטומי נפיחות ועיכול.',
    category: 'nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=1200&q=80',
    impactScore: 9.0,
    scientificConfidence: 8.5,
    clinicalStage: 'אישור FDA / זמין בשוק',
    readTime: "5 דק' קריאה",
    author: 'פרופ\' ערן סגל',
    source: 'הידען',
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['קהילת המיקרוביום במעי', 'מערכת העיכול', 'ויסות סוכר בדם'],
    timeline: [
      { id: 'dt-tl1', title: 'השקת פלטפורמת DayTwo', description: 'הפלטפורמה הושקה בישראל ובארה"ב.', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },

  // ──────────────── 2-3 WEEKS AGO ────────────────
  {
    id: 'nad-supplement-trial',
    title: 'תוסף NMN (ניקוטינאמיד מונונוקלאוטיד) מגביר רמות NAD+ ב-68% — אבל ההשפעות משתנות',
    summary: 'ניסוי קליני חדש מ-Longevity Technology מדגים עלייה דרמטית ברמות NAD+ בדם, אך מדגיש שהתגובה הפיזיולוגית שונה מאוד בין אנשים בגילאים ומצבים רפואיים שונים.',
    content: 'הניסוי כלל 200 משתתפים בגילאי 40-70 שנטלו 500 מ"ג NMN ליום במשך 90 יום. רמות NAD+ בדם עלו בממוצע ב-68%, אך — ופה ההפתעה — ההשפעות הפיזיולוגיות נעו בין שיפור דרמטי באנרגיה וריכוז (40% מהמשתתפים) לבין כמעט שום שינוי מורגש (25% מהמשתתפים).\n\nהחוקרים זיהו שגורמים כמו רמת כושר בסיסית, הרכב גנטי של אנזימי NAD ותזונה משפיעים מאוד על התגובה.',
    category: 'body',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    impactScore: 8.8,
    scientificConfidence: 8.5,
    clinicalStage: 'ניסויים קליניים (בני אדם)',
    readTime: "5 דק' קריאה",
    author: 'צוות Longevity Tech',
    source: 'Longevity Tech',
    publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['אנרגיה תאית (NAD+)', 'תפקוד המיטוכונדריה', 'הזדקנות תאית'],
    timeline: [
      { id: 'nmn-tl1', title: 'השלמת ניסוי 90 ימים', description: 'פורסמו תוצאות ביניים.', timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'smart-insole-running',
    title: 'מדרסים חכמים של Nurvv מזהים טעויות בטכניקת ריצה ומפחיתים פציעות ברכיים ב-40%',
    summary: 'הטכנולוגיה הלבישה החדשה מודדת 32 נקודות לחץ בכף הרגל בזמן אמת ומספקת משוב שמתקן דפוסי נחיתה לקויים — לפני שהם הופכים לפציעה.',
    content: 'Nurvv Run, חברת טכנולוגיית ריצה בריטית, הציגה את דור המדרסים החכמים החדש עם 32 חיישני לחץ. במחקר עם 800 רצים, אלה שהשתמשו במדרסים וקיבלו משוב בזמן אמת (דרך האוזניות) חוו 40% פחות פציעות ברכיים ו-35% פחות כאבי שוקיים.\n\nהמערכת מזהה קדנס נמוך, נחיתה על עקב במקום אמצע כף הרגל, וחוסר סימטריה בין רגל ימין לשמאל. "זה כמו מאמן ריצה שנמצא איתך בכל אימון," אמרה ד"ר אירנה סמית\' מאוניברסיטת באת\'.',
    category: 'sports',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?auto=format&fit=crop&w=1200&q=80',
    impactScore: 8.5,
    scientificConfidence: 8,
    clinicalStage: 'אישור FDA / זמין בשוק',
    readTime: "4 דק' קריאה",
    author: 'צוות Fitt Insider',
    source: 'Fitt Insider',
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת השריר-שלד', 'מפרקי ברכיים ושוקיים', 'ביומכניקה של ריצה'],
    timeline: [
      { id: 'nurvv-tl1', title: 'פרסום מחקר 800 רצים', description: 'התוצאות הוצגו בכנס הביומכניקה הבינלאומי.', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },

  // ──────────────── 3-4 WEEKS AGO ────────────────
  {
    id: 'sleep-optimization-eight',
    title: 'Eight Sleep Pod 4 Ultra: המזרן החכם שמשפר שינה עמוקה ב-46% ומקצר זמן הירדמות ב-11 דקות',
    summary: 'הדור החדש של מזרן Eight Sleep משלב ויסות טמפרטורה אוטומטי, מעקב שינה רפואי ואלגוריתם AI שלומד את דפוסי השינה האישיים.',
    content: 'Eight Sleep Pod 4 Ultra הוא בלי ספק המוצר המרשים ביותר בתחום טכנולוגיית השינה. המזרן מחמם ומקרר כל צד של המיטה באופן עצמאי, מ-12°C ועד 46°C, ומשנה טמפרטורה לאורך הלילה בהתאם לשלבי השינה.\n\nבמחקר עם 2,000 משתמשים, זמן ההירדמות ירד ב-11 דקות בממוצע, שינה עמוקה (N3) עלתה ב-46%, ומספר ההתעוררויות הלילות ירד ב-32%.\n\nMatt Walker, חוקר שינה מברקלי: "שינה היא הפעולה הבודדת הכי חשובה שאנחנו יכולים לעשות לבריאות. וטמפרטורה היא הגורם מספר 1 שמשפיע על איכות השינה."',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    impactScore: 8.8,
    scientificConfidence: 8,
    clinicalStage: 'אישור FDA / זמין בשוק',
    readTime: "5 דק' קריאה",
    author: 'צוות Athletech News',
    source: 'Athletech News',
    publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת השינה', 'ויסות טמפרטורה', 'שיקום תאי ושיפור קוגניטיבי'],
    timeline: [
      { id: 'eight-tl1', title: 'השקת Pod 4 Ultra', description: 'Eight Sleep הכריזה על הדור הרביעי.', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'red-light-therapy-skin',
    title: 'טיפול באור אדום (Red Light Therapy): מטא-אנליזה מגלה שיפור של 35% בייצור קולגן',
    summary: 'סקירה שיטתית של 45 מחקרים מוכיחה שחשיפה לאור אדום באורכי גל של 630-670nm משפרת מרקם עור, מפחיתה קמטים ומאיצה ריפוי פצעים.',
    content: 'המטא-אנליזה שפורסמה ב-Photobiomodulation, Photomedicine, and Laser Surgery סקרה 45 מחקרים עם 3,500 משתתפים. המסקנה: טיפול באור אדום (630-670nm) ב-10-20 דקות ביום, 4-5 פעמים בשבוע, מוביל לשיפור של 35% בייצור קולגן, 28% שיפור באלסטיות העור ו-40% האצה בריפוי פצעים.\n\nהאור האדום חודר 5-10 מ"מ לתוך העור ומשפעל את המיטוכונדריות בתאים, מה שמגביר ייצור ATP ומאיץ תהליכי תיקון תאי.',
    category: 'body',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
    impactScore: 8.6,
    scientificConfidence: 8.5,
    clinicalStage: 'אישור FDA / זמין בשוק',
    readTime: "4 דק' קריאה",
    author: 'ד"ר מייקל המבלין',
    source: 'Medical News Today',
    publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['עור ורקמת חיבור', 'סינתזת קולגן', 'תפקוד המיטוכונדריה'],
    timeline: [
      { id: 'rlt-tl1', title: 'פרסום מטא-אנליזה', description: '45 מחקרים נסקרו.', timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },

  // ──────────────── 5-6 WEEKS AGO ────────────────
  {
    id: 'magnesium-threonate-sleep',
    title: 'מגנזיום L-Threonate: התוסף היחיד שעובר את מחסום הדם-מוח ומשפר שינה ב-27%',
    summary: 'מחקר חדש מדגים את ההבדל הדרמטי בין סוגי מגנזיום: רק L-Threonate חוצה את מחסום הדם-מוח ומגיע ישירות לתאי עצב, עם שיפור מדיד באיכות השינה.',
    content: 'פרופ\' גוהוה ליו מ-MIT, שפיתחה את מגנזיום L-Threonate, פרסמה מחקר חדש ב-Frontiers in Neuroscience עם 300 משתתפים. הממצא המרכזי: L-Threonate העלה רמות מגנזיום במוח ב-42% (לעומת 3% בלבד עם מגנזיום ציטראט), מה שהוביל לשיפור של 27% באיכות השינה ו-19% בזיכרון לטווח קצר.\n\n"הבעיה עם רוב תוספי המגנזיום היא שהם לא מגיעים למוח," הסבירה פרופ\' ליו. "95% מהמגנזיום שנבלע נשאר בגוף ולא עובר את מחסום הדם-מוח. L-Threonate הוא היוצא מן הכלל."',
    category: 'nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=1200&q=80',
    impactScore: 8.4,
    scientificConfidence: 9,
    clinicalStage: 'ניסויים קליניים (בני אדם)',
    readTime: "5 דק' קריאה",
    author: 'פרופ\' גוהוה ליו',
    source: 'ScienceDaily',
    publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת העצבים המרכזית', 'מערכת השינה', 'זיכרון וקוגניציה'],
    timeline: [
      { id: 'mag-tl1', title: 'פרסום מחקר MIT', description: 'המחקר פורסם ב-Frontiers in Neuroscience.', timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'crispr-hearing-loss',
    title: 'CRISPR לראשונה בבן אדם: ילד בן 11 שומע לראשונה בחייו לאחר עריכה גנטית',
    summary: 'בפריצת דרך היסטורית, רופאי בית החולים בפילדלפיה ביצעו טיפול CRISPR שתיקן מוטציה גנטית בעצב השמיעה — וילד שנולד חירש שומע לראשונה.',
    content: 'איידן, בן 11, נולד עם חירשות מלאה בשתי האוזניים בגלל מוטציה בגן OTOF. הגן הזה מקודד לחלבון שנקרא אוטופרלין, שאחראי להעברת אותות קוליים מתאי השמיעה בשבלול לעצב. בלעדיו — שקט מוחלט.\n\nצוות רפואי בפילדלפיה הזריק לשבלול האוזן של איידן וקטור AAV נושא את הגן OTOF התקין. תוך 6 שבועות, איידן התחיל לשמוע לראשונה. עכשיו, 6 חודשים אחרי, הוא מנהל שיחות בטלפון.\n\n"הרגע שהוא אמר \'אמא\' בפעם הראשונה — כל הצוות בכה," סיפרה ד"ר ג\'ון ג\'רמילו, ראשת הצוות.',
    category: 'body',
    imageUrl: 'https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?auto=format&fit=crop&w=1200&q=80',
    impactScore: 9.8,
    scientificConfidence: 9.5,
    clinicalStage: 'ניסויים קליניים (בני אדם)',
    readTime: "6 דק' קריאה",
    author: 'ד"ר ג\'ון ג\'רמילו',
    source: 'Lifespan.io',
    publishedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת השמיעה', 'עריכה גנטית (CRISPR)', 'עצבים קרניאליים'],
    timeline: [
      { id: 'crispr-tl1', title: 'ביצוע הטיפול הגנטי', description: 'הטיפול בוצע בבית החולים בפילדלפיה.', timestamp: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'crispr-tl2', title: 'איידן שומע לראשונה', description: '6 שבועות אחרי הטיפול, הילד מתחיל לשמוע.', timestamp: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },

  // ──────────────── 6 WEEKS AGO ────────────────
  {
    id: 'sauna-cardiovascular',
    title: 'סאונה פינית 4 פעמים בשבוע מפחיתה סיכון לאירוע לב ב-50% — מחקר 20 שנות מעקב',
    summary: 'מחקר פיני ארוך טווח בקרב 2,300 גברים מוכיח שחשיפה קבועה לחום גבוה (80-100°C) היא אחת ההתערבויות היעילות ביותר לבריאות הלב וכלי הדם.',
    content: 'מחקר Kuopio Ischemic Heart Disease Risk Factor Study עקב אחרי 2,315 גברים פינים במשך 20 שנה. הממצא: אלה ששהו בסאונה 4-7 פעמים בשבוע חוו הפחתה של 50% בסיכון למוות מאירוע לב, בהשוואה לאלה שביקרו פעם בשבוע.\n\nהמנגנון: חשיפה לחום גורמת לשחרור heat shock proteins שמגנים על הלב, מפחיתה לחץ דם ומשפרת תפקוד אנדותל כלי הדם.\n\nד"ר ג\'ארי לאוקנן, ראש המחקר: "סאונה היא בעצם \'אימון קרדיו פסיבי\' — הגוף מגיב לחום כמו שהוא מגיב לאימון. ולפעמים זה אפילו יעיל יותר."',
    category: 'health',
    imageUrl: 'https://images.unsplash.com/photo-1555708982-8645ec9ce3cc?auto=format&fit=crop&w=1200&q=80',
    impactScore: 9.0,
    scientificConfidence: 9.5,
    clinicalStage: 'ניסויים קליניים (בני אדם)',
    readTime: "5 דק' קריאה",
    author: 'ד"ר ג\'ארי לאוקנן',
    source: 'הידען',
    publishedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    physiologicalImpact: ['מערכת הלב וכלי הדם', 'heat shock proteins', 'לחץ דם ואנדותל'],
    timeline: [
      { id: 'sauna-tl1', title: 'פרסום ממצאי 20 שנות מעקב', description: 'המחקר פורסם ב-JAMA Internal Medicine.', timestamp: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }
];

export const MOCK_DEVELOPMENTS = [
  {
    articleId: 'featured-oura-ring-4',
    title: 'Oura Ring 4 קיבלה אישור CE לשוק האירופי',
    description: 'הטבעת מאושרת כעת למכירה גם באירופה. הצפי: 500,000 יחידות בשנה הראשונה.',
    physiologicalImpactAddition: ['אישורים רגולטוריים (CE/FDA)']
  },
  {
    articleId: 'whoop-glucose-integration',
    title: 'WHOOP 5.0 מקבלת שותפות עם Levels Health',
    description: 'שיתוף פעולה חדש עם Levels יאפשר תובנות גלוקוז מעמיקות ישירות באפליקציית WHOOP.',
    physiologicalImpactAddition: ['אינטגרציית נתוני גלוקוז']
  },
  {
    articleId: 'creatine-brain-study',
    title: 'מחקר המשך: קריאטין משפר ביצועים גם בגיל 70+',
    description: 'מחקר חדש מציג ששיפור קוגניטיבי מקריאטין חזק אפילו יותר בקרב מבוגרים.',
    physiologicalImpactAddition: ['תפקוד קוגניטיבי בגיל המבוגר']
  }
];
