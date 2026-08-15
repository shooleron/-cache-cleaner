export type GlossaryKind = 'term' | 'brand' | 'person' | 'institution';

export interface GlossaryEntry {
  slug: string;
  kind: GlossaryKind;
  name: string;
  englishName?: string;
  aliases: string[];
  shortDefinition: string;
  explanation: string[];
  whyItMatters: string;
  related: string[];
  sources: { label: string; url: string }[];
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    slug: 'hrv', kind: 'term', name: 'שונות קצב הלב', englishName: 'Heart Rate Variability (HRV)',
    aliases: ['HRV', 'שונות קצב לב'],
    shortDefinition: 'ההבדלים הזעירים בזמן שבין פעימת לב אחת לבאה אחריה, המשמשים מדד עקיף להתאוששות ולפעילות מערכת העצבים האוטונומית.',
    explanation: ['HRV אינו קצב הלב עצמו. הוא מודד עד כמה המרווחים בין הפעימות משתנים.', 'את המדד כדאי להשוות בעיקר לעצמכם לאורך זמן, משום שהטווח התקין משתנה מאוד בין אנשים ובין מכשירים.'],
    whyItMatters: 'מגמה מתמשכת יכולה לסייע להבין כיצד שינה, עומס אימונים, מתח ומחלה משפיעים על ההתאוששות.',
    related: ['vo2-max', 'zone-2', 'whoop'],
    sources: [{ label: 'Harvard Health', url: 'https://www.health.harvard.edu/heart-health/what-is-heart-rate-variability' }],
  },
  {
    slug: 'vo2-max', kind: 'term', name: 'צריכת חמצן מרבית', englishName: 'VO₂ Max',
    aliases: ['VO2 Max', 'VO₂ Max', 'VOmax'],
    shortDefinition: 'כמות החמצן המרבית שהגוף מסוגל לקלוט ולנצל בזמן מאמץ עצים, ביחס למשקל הגוף.',
    explanation: ['VO₂ Max נמדד באופן המדויק ביותר בבדיקת מאמץ עם ניתוח גזי נשימה.', 'שעונים חכמים מספקים הערכה המבוססת על דופק, קצב ותנועה — לא מדידה ישירה.'],
    whyItMatters: 'זהו מדד מרכזי לכושר אירובי וליכולת של הלב, הריאות והשרירים לעבוד יחד.',
    related: ['hrv', 'zone-2', 'garmin'],
    sources: [{ label: 'Cleveland Clinic', url: 'https://my.clevelandclinic.org/health/diagnostics/17281-cardiopulmonary-exercise-test-cpet' }],
  },
  {
    slug: 'zone-2', kind: 'term', name: 'אימון אזור 2', englishName: 'Zone 2 Training',
    aliases: ['Zone 2', 'אזור 2', 'זון 2'],
    shortDefinition: 'אימון אירובי בעצימות קלה־בינונית שבה ניתן בדרך כלל לדבר במשפטים, תוך עבודה ממושכת ויציבה.',
    explanation: ['הגדרה לפי אחוז קבוע מהדופק המרבי אינה מדויקת לכל אדם.', 'בדיקת סף לקטט או סף נשימתי מספקת התאמה אישית טובה יותר.'],
    whyItMatters: 'האימון מסייע לבניית בסיס אירובי, יעילות מטבולית וסבולת בלי עומס גבוה בכל אימון.',
    related: ['vo2-max', 'hrv'],
    sources: [{ label: 'American College of Sports Medicine', url: 'https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines' }],
  },
  {
    slug: 'cgm', kind: 'term', name: 'ניטור גלוקוז רציף', englishName: 'Continuous Glucose Monitoring (CGM)',
    aliases: ['CGM', 'סנסור גלוקוז', 'ניטור סוכר רציף'],
    shortDefinition: 'חיישן שמודד לאורך היום את רמת הגלוקוז בנוזל הבין־תאי ומציג מגמות ושינויים.',
    explanation: ['החיישן אינו מודד ישירות את רמת הסוכר בדם ולכן עשוי להיות פער קצר בזמן.', 'הפרשנות משתנה בין אנשים ותלויה בארוחות, פעילות, שינה ומצב רפואי.'],
    whyItMatters: 'הוא מאפשר לראות דפוסים שלא תמיד מתגלים במדידה נקודתית.',
    related: ['whoop'],
    sources: [{ label: 'U.S. FDA', url: 'https://www.fda.gov/medical-devices/diabetes-management-devices/continuous-glucose-monitoring-devices' }],
  },
  {
    slug: 'nad-plus', kind: 'term', name: 'NAD+', englishName: 'Nicotinamide Adenine Dinucleotide',
    aliases: ['NAD+', 'NAD'],
    shortDefinition: 'קואנזים המצוי בתאים ומשתתף בהפקת אנרגיה, תיקון DNA ותהליכים מטבוליים.',
    explanation: ['רמות NAD+ משתנות עם הגיל ועם מצב מטבולי.', 'העניין המחקרי בתוספים שמעלים NAD+ גדול, אך התועלת הקלינית ארוכת הטווח בבני אדם עדיין אינה מוכחת במלואה.'],
    whyItMatters: 'הוא נמצא בצומת שבין מטבוליזם, תפקוד תאי וחקר ההזדקנות.',
    related: [],
    sources: [{ label: 'Nature Reviews Molecular Cell Biology', url: 'https://www.nature.com/articles/s41580-020-00313-x' }],
  },
  {
    slug: 'garmin', kind: 'brand', name: 'גרמין', englishName: 'Garmin', aliases: ['Garmin', 'גרמין'],
    shortDefinition: 'חברת טכנולוגיה המפתחת שעוני ספורט, מחשבי רכיבה, חיישנים ומוצרי ניווט.',
    explanation: ['במוצרי הבריאות והספורט שלה מוצגים מדדים כגון דופק, HRV, עומס אימונים, שינה והערכת VO₂ Max.'],
    whyItMatters: 'המותג הוא אחד המקורות הנפוצים ביותר לנתוני אימון ובריאות צרכניים.', related: ['hrv', 'vo2-max'],
    sources: [{ label: 'Garmin Health', url: 'https://www.garmin.com/en-US/garmin-technology/health-science/' }],
  },
  {
    slug: 'whoop', kind: 'brand', name: 'WHOOP', englishName: 'WHOOP', aliases: ['WHOOP', 'וופ'],
    shortDefinition: 'צמיד ללא מסך המתמקד בעומס, שינה והתאוששות ומציג המלצות דרך אפליקציה.',
    explanation: ['המערכת משתמשת בדופק, HRV, קצב נשימה, שינה ומדדים נוספים ליצירת ציוני עומס והתאוששות.'],
    whyItMatters: 'WHOOP הפכה את מדדי ההתאוששות לחלק מרכזי בתרבות האימון והוולנס.', related: ['hrv', 'cgm'],
    sources: [{ label: 'WHOOP Research', url: 'https://www.whoop.com/us/en/thelocker/' }],
  },
  {
    slug: 'oura', kind: 'brand', name: 'אורה', englishName: 'Oura', aliases: ['Oura', 'Oura Ring', 'אורה רינג'],
    shortDefinition: 'טבעת חכמה למדידת שינה, פעילות, דופק, טמפרטורה ומדדי התאוששות.',
    explanation: ['הטבעת אוספת מדדים מהאצבע ומציגה ציוני שינה, פעילות ומוכנות.'],
    whyItMatters: 'היא תרמה להפיכת טבעות חכמות לקטגוריה מרכזית בשוק המכשור הלביש.', related: ['hrv'],
    sources: [{ label: 'Oura Science', url: 'https://ouraring.com/science' }],
  },
];

export const getGlossaryEntry = (slug: string) => GLOSSARY.find((entry) => entry.slug === slug);
