interface AltLogoProps {
  height?: number;
  style?: React.CSSProperties;
}

export default function AltLogo({ height = 28, style }: AltLogoProps) {
  const r = 7; // corner radius for inner shapes

  return (
    <svg
      viewBox="0 0 226 108"
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      style={style}
    >
      <defs>
        {/* Mask to punch the counter hole out of A */}
        <mask id="a-hole">
          <rect width="100%" height="100%" fill="white" />
          <rect x="42" y="42" width="32" height="38" rx={r} fill="black" />
        </mask>
        {/* Mask to punch inner corners of L */}
        <mask id="l-corner">
          <rect width="100%" height="100%" fill="white" />
          <rect x="114" y="76" width={r + 2} height={r + 2} fill="black" />
        </mask>
        {/* Mask to punch inner corners of T */}
        <mask id="t-corners">
          <rect width="100%" height="100%" fill="white" />
          <rect x="152" y="20" width={r + 2} height={r + 2} fill="black" />
          <rect x="193" y="20" width={r + 2} height={r + 2} fill="black" />
        </mask>
      </defs>

      {/* ── A ── diagonal-left trapezoid + counter hole */}
      <g mask="url(#a-hole)">
        <path
          d="M 8 104 L 38 6 H 88 Q 96 6 96 14 V 104 Q 96 108 88 108 H 16 Q 8 108 8 104 Z"
          style={{ borderRadius: `${r}px` }}
        />
      </g>

      {/* ── L ── vertical bar + horizontal bar */}
      <g mask="url(#l-corner)">
        <rect x="104" y="6" width="22" height="102" rx={r} />
        <rect x="104" y="82" width="68" height="20" rx={r} />
      </g>

      {/* ── T ── top bar + vertical stem */}
      <g mask="url(#t-corners)">
        <rect x="152" y="6" width="64" height="22" rx={r} />
        <rect x="184" y="6" width="20" height="96" rx={r} />
      </g>

      {/* ── . ── dot */}
      <rect x="224" y="84" width="20" height="20" rx={r} />
    </svg>
  );
}
