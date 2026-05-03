export default function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    cx: (((i * 137.508) % 100)).toFixed(2),
    cy: (((i * 97.3) % 100)).toFixed(2),
    r: (0.5 + (i % 4) * 0.4).toFixed(1),
    opacity: (0.1 + (i % 5) * 0.08).toFixed(2),
  }))
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.opacity} />
      ))}
    </svg>
  )
}
