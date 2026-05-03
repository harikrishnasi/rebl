import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatINR } from '@/lib/utils'

const T = {
  bg: '#000000', card: '#0D0D0D', border: '#1A1A1A',
  borderVis: '#2D2D2D', white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const MONO = '"Space Mono", monospace'
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

const TABS = [
  { key: '1H', label: '1H', ms: 60 * 60 * 1000 },
  { key: '24H', label: '24H', ms: 24 * 60 * 60 * 1000 },
  { key: 'ALL', label: 'SINCE LAUNCH', ms: Infinity },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: T.card, border: `1px solid ${T.borderVis}`, padding: '10px 14px' }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, letterSpacing: '0.1em', marginBottom: 4 }}>
        {new Date(label).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 14, color: T.white }}>{formatINR(payload[0].value)}</div>
    </div>
  )
}

export default function PriceChart({ product, onClose }) {
  const [tab, setTab] = useState('24H')
  const { pricing } = product

  const getData = () => {
    if (!pricing?.full?.length) return []
    const now = Date.now()
    const tabDef = TABS.find(t => t.key === tab)
    if (tabDef.ms === Infinity) return pricing.full
    const cutoff = now - tabDef.ms
    const filtered = pricing.full.filter(d => d.t >= cutoff)
    return filtered.length > 1 ? filtered : pricing.full.slice(-12)
  }

  const data = getData()
  const first = data[0]?.p ?? product.price
  const last = data[data.length - 1]?.p ?? product.price
  const change = last - first
  const changePct = first > 0 ? ((change / first) * 100).toFixed(1) : '0.0'
  const isUp = change >= 0

  const yMin = pricing ? Math.floor((pricing.floor - (pricing.ceiling - pricing.floor) * 0.08) / 500) * 500 : product.price * 0.88
  const yMax = pricing ? Math.ceil((pricing.ceiling + (pricing.ceiling - pricing.floor) * 0.08) / 500) * 500 : product.price * 1.12

  const pct = pricing
    ? ((product.price - pricing.floor) / (pricing.ceiling - pricing.floor)) * 100
    : 50

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ width: '92%', maxWidth: 800, background: T.card, border: `1px solid ${T.borderVis}`, padding: '40px 40px 32px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: T.grayMid, letterSpacing: '0.3em', marginBottom: 8 }}>
              {product.brand.toUpperCase()} · DYNAMIC PRICE HISTORY
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 18, color: T.white, fontWeight: 700, marginBottom: 10 }}>{product.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontFamily: MONO, fontSize: 26, color: T.white, fontWeight: 700 }}>{formatINR(product.price)}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: isUp ? '#4CAF50' : '#CC3333', letterSpacing: '0.05em' }}>
                {isUp ? '↑' : '↓'} {Math.abs(changePct)}%&nbsp;({TABS.find(t => t.key === tab)?.label})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: `1px solid ${T.border}`, color: T.grayMid, fontFamily: MONO, fontSize: 9, padding: '8px 14px', cursor: 'pointer', letterSpacing: '0.15em' }}
          >CLOSE ✕</button>
        </div>

        {pricing && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '16px 0' }}>
            {[
              { label: 'FLOOR', val: pricing.floor, color: T.grayMid },
              { label: 'CURRENT', val: product.price, color: T.white },
              { label: 'CEILING', val: pricing.ceiling, color: T.grayMid },
            ].map((item, i) => (
              <div key={item.label} style={{
                flex: 1,
                paddingLeft: i > 0 ? 24 : 0,
                borderLeft: i > 0 ? `1px solid ${T.border}` : 'none',
                marginLeft: i > 0 ? 24 : 0,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.25em', marginBottom: 5 }}>{item.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: item.color }}>{formatINR(item.val)}</div>
              </div>
            ))}
            <div style={{ flex: 2, paddingLeft: 24, borderLeft: `1px solid ${T.border}`, marginLeft: 24 }}>
              <div style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.25em', marginBottom: 10 }}>POSITION IN RANGE</div>
              <div style={{ position: 'relative', height: 3, background: T.border }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: T.borderVis }} />
                <div style={{
                  position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                  left: `${pct}%`, width: 9, height: 9, background: T.white, borderRadius: '50%',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid }}>FLOOR</span>
                <span style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid }}>CEILING</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: 'none', border: 'none',
                borderBottom: tab === t.key ? `1px solid ${T.white}` : '1px solid transparent',
                color: tab === t.key ? T.white : T.grayMid,
                fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em',
                padding: '8px 20px', cursor: 'pointer', marginBottom: -1,
              }}
            >{t.label}</button>
          ))}
        </div>

        <div style={{ height: 230 }}>
          {data.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="t"
                  tickFormatter={t => new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  tick={{ fontFamily: MONO, fontSize: 7, fill: T.grayMid }}
                  axisLine={{ stroke: T.border }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  tickFormatter={v => `₹${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`}
                  tick={{ fontFamily: MONO, fontSize: 7, fill: T.grayMid }}
                  axisLine={false}
                  tickLine={false}
                  domain={[yMin, yMax]}
                  width={46}
                />
                <Tooltip content={<CustomTooltip />} />
                {pricing && <ReferenceLine y={pricing.floor} stroke={T.borderVis} strokeDasharray="4 6" label={{ value: 'FLOOR', position: 'insideTopLeft', fill: T.grayMid, fontSize: 7, fontFamily: MONO }} />}
                {pricing && <ReferenceLine y={pricing.ceiling} stroke={T.borderVis} strokeDasharray="4 6" label={{ value: 'CEILING', position: 'insideBottomLeft', fill: T.grayMid, fontSize: 7, fontFamily: MONO }} />}
                <Line
                  type="monotone"
                  dataKey="p"
                  stroke={T.white}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: T.white, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, letterSpacing: '0.15em' }}>
                {product.status === 'upcoming' ? 'DROP NOT YET LIVE — PRICE HISTORY STARTS ON LAUNCH' : 'NO DATA FOR THIS TIME RANGE'}
              </div>
            </div>
          )}
        </div>

        <div style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.1em', marginTop: 16, textAlign: 'right' }}>
          PRICE ADJUSTS AUTOMATICALLY WITH DEMAND · BOUNDED BY FLOOR AND CEILING
        </div>
      </div>
    </div>
  )
}
