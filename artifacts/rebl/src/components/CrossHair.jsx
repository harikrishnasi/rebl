export default function CrossHair({ size = 16, color = '#A8B2C4', style = {} }) {
  const c = size / 2
  const gap = size * 0.15
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, ...style }}>
      <line x1={c - gap - 4} y1={c} x2={c - gap} y2={c} stroke={color} strokeWidth="1" />
      <line x1={c + gap} y1={c} x2={c + gap + 4} y2={c} stroke={color} strokeWidth="1" />
      <line x1={c} y1={c - gap - 4} x2={c} y2={c - gap} stroke={color} strokeWidth="1" />
      <line x1={c} y1={c + gap} x2={c} y2={c + gap + 4} stroke={color} strokeWidth="1" />
      <circle cx={c} cy={c} r={gap * 0.7} fill="none" stroke={color} strokeWidth="0.8" />
    </svg>
  )
}
