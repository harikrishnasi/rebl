export default function CoordinateGrid() {
  const vLines = Array.from({ length: 32 }, (_, i) => i * 60)
  const hLines = Array.from({ length: 18 }, (_, i) => i * 60)
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
    >
      {vLines.map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="1080" stroke="#1C1C2E" strokeWidth="1" opacity="0.35" />)}
      {hLines.map(y => <line key={`h${y}`} x1="0" y1={y} x2="1920" y2={y} stroke="#1C1C2E" strokeWidth="1" opacity="0.35" />)}
    </svg>
  )
}
