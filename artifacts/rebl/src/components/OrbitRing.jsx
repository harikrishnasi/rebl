export default function OrbitRing({ size = 600, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 600 600"
      style={{ pointerEvents: 'none', transform: 'rotate(20deg)', ...style }}
    >
      <ellipse cx="300" cy="300" rx="280" ry="200" fill="none" stroke="#A8B2C41A" strokeWidth="0.5" />
      <ellipse cx="300" cy="300" rx="200" ry="140" fill="none" stroke="#A8B2C412" strokeWidth="0.5" />
      <ellipse cx="300" cy="300" rx="120" ry="80" fill="none" stroke="#A8B2C40A" strokeWidth="0.5" />
      <circle cx="580" cy="300" r="3" fill="#A8B2C430" />
      <circle cx="160" cy="172" r="2" fill="#A8B2C425" />
      <circle cx="300" cy="100" r="1.5" fill="#A8B2C420" />
    </svg>
  )
}
