'use client';

export default function VitalsTicker() {
  const tickerData = [
    { label: 'דופק מנוחה ממוצע', val: '58 bpm', delta: '▼ 2', type: 'down' },
    { label: 'VO2 Max חדש בשוק', val: 'Garmin HRM 600', delta: '▲', type: 'up' },
    { label: 'שעות שינה עומק', val: '1:42 hr', delta: '▲ 6%', type: 'up' },
    { label: 'מדד HRV קהילתי', val: '61ms', delta: '▲ 3', type: 'up' },
    { label: 'מכירות שעונים חכמים', val: '+14% Q3', delta: '▲', type: 'up' },
    { label: 'סנסורי גלוקוז CGM', val: '4.2M פעילים', delta: '▲ 18%', type: 'up' },
    { label: 'מדד עומס אימונים', val: '72/100', delta: '▼ 4', type: 'down' },
  ];

  // Repeat items for continuous infinite scroll loop
  const items = [...tickerData, ...tickerData, ...tickerData];

  return (
    <div className="ticker-wrap select-none" dir="rtl">
      <div className="ticker">
        {items.map((item, idx) => (
          <span key={idx} className="tick-item">
            <b>{item.label}</b>
            <span className="text-white font-medium">{item.val}</span>
            <span className={item.type === 'up' ? 'tick-up' : 'tick-down'}>
              {item.delta}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
