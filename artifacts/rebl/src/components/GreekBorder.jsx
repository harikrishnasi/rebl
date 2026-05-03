let _id = 0
export default function GreekBorder({ color = '#A6A6A6', opacity = 0.2 }) {
  const id = `gk${++_id}`
  return (
    <div style={{ overflow: 'hidden', height: 20, width: '100%', opacity }}>
      <svg width="100%" height="20" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={id} x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0,10 H 5 V 0 H 35 V 20 H 15 V 10 H 40" fill="none" stroke={color} strokeWidth="1.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="20" fill={`url(#${id})`} />
      </svg>
    </div>
  )
}
