export default function StarField() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    cx: Math.round((i * 137.508 * 17.3) % 1920),
    cy: Math.round((i * 97.31 * 11.7) % 1080),
    r: Number((0.4 + (i % 3) * 0.45).toFixed(1)),
    op: Number((0.08 + (i % 6) * 0.06).toFixed(2)),
  }))
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.op} />
      ))}
    </svg>
  )
}
