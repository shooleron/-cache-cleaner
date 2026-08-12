'use client';

export default function MarketTrackerBanner() {
  return (
    <section className="bg-[#14171C] text-[#FAFAF7] p-8 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center border-t border-b border-[#DEDAD1]" dir="rtl">
      <div>
        <span className="font-mono text-xs text-[#7FD8A4] tracking-[1.5px] uppercase block mb-4">
          מעקב שוק טכנולוגי
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4">
          עולם הלבישים הבריאותיים גדל פי שלושה בשלוש שנים
        </h2>
        <p className="text-[#bdbdb8] text-base leading-relaxed">
          אנחנו עוקבים אחרי כל השקה, כל עדכון גרסה וכל מחקר קליני שיוצא בתחום הוואלנס-טק, כדי שתדעו מה באמת שווה את ההשקעה ומה רק שיווק.
        </p>
      </div>

      <div className="flex flex-col border border-[#333]">
        <div className="p-5 border-b border-[#333] flex justify-between items-center">
          <span className="text-xs text-[#9a9a94] font-mono">שוק גלובלי 2026</span>
          <span className="text-xl font-bold font-mono text-[#EF4423]">62B$</span>
        </div>
        <div className="p-5 border-b border-[#333] flex justify-between items-center">
          <span className="text-xs text-[#9a9a94] font-mono">צמיחה שנתית</span>
          <span className="text-xl font-bold font-mono text-[#7FD8A4]">+19%</span>
        </div>
        <div className="p-5 flex justify-between items-center">
          <span className="text-xs text-[#9a9a94] font-mono">מכשירים חדשים בשנה</span>
          <span className="text-xl font-bold font-mono text-[#EF4423]">140+</span>
        </div>
      </div>
    </section>
  );
}
