'use client';

interface Props {
  totalArticles: number;
}

export default function MetricStrip({ totalArticles }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#DEDAD1] bg-[#FAFAF7]" dir="rtl">
      <div className="p-6 md:p-8 border-l border-[#DEDAD1] flex flex-col justify-between">
        <div className="text-[12px] text-[#84807A] font-mono mb-2">קוראים פעילים</div>
        <div className="text-3xl md:text-4xl font-extrabold text-[#14171C] tracking-tight flex items-baseline gap-1">
          42<small className="text-sm font-medium text-[#84807A]">K</small>
        </div>
        <div className="text-[12px] text-[#7FD8A4] font-mono mt-2">▲ 8% מהשבוע שעבר</div>
      </div>

      <div className="p-6 md:p-8 border-l border-[#DEDAD1] flex flex-col justify-between">
        <div className="text-[12px] text-[#84807A] font-mono mb-2">מכשירים שנבדקו החודש</div>
        <div className="text-3xl md:text-4xl font-extrabold text-[#14171C] tracking-tight flex items-baseline gap-1">
          17
        </div>
        <div className="text-[12px] text-[#84807A] font-mono mt-2">3 חדשים בשוק</div>
      </div>

      <div className="p-6 md:p-8 border-l border-[#DEDAD1] flex flex-col justify-between">
        <div className="text-[12px] text-[#84807A] font-mono mb-2">מאמרים בארכיון</div>
        <div className="text-3xl md:text-4xl font-extrabold text-[#14171C] tracking-tight flex items-baseline gap-1">
          {totalArticles || 386}
        </div>
        <div className="text-[12px] text-[#84807A] font-mono mt-2">מתעדכן יומית</div>
      </div>

      <div className="p-6 md:p-8 flex flex-col justify-between">
        <div className="text-[12px] text-[#84807A] font-mono mb-2">מדד אמון קוראים</div>
        <div className="text-3xl md:text-4xl font-extrabold text-[#14171C] tracking-tight flex items-baseline gap-1">
          4.9<small className="text-sm font-medium text-[#84807A]">/5</small>
        </div>
        <div className="text-[12px] text-[#7FD8A4] font-mono mt-2">▲ בהתמדה</div>
      </div>
    </div>
  );
}
