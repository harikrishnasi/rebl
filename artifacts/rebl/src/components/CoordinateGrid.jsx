export default function CoordinateGrid() {
  const lines = []
  for (let i = 0; i <= 30; i++) {
    lines.push(<line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="1200" stroke="#1C1C2E" strokeWidth="1" opacity="0.6" />)
    lines.push(<line key={`h${i}`} x1="0" y1={i * 40} x2="1200" y2={i * 40} stroke="#1C1C2E" strokeWidth="1" opacity="0.6" />)
  }
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 1200 1200"
      preserveAspectRatio="xMidYMid slice"
    >
      {lines}
    </svg>
  )
}
