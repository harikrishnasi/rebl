import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const T = {
  bg: '#000000', border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const MONO = '"Space Mono", monospace'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

export default function DropsNav({ activeFilter, onFilter }) {
  const { count, setIsOpen } = useCart()

  const filters = ['All', 'Sneakers', 'Streetwear', 'Events']

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: T.bg, borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>

        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 24, color: T.white, letterSpacing: '-0.5px', lineHeight: 1 }}>Rēbl</span>
            <span style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Own the rare. Tell its story.</span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid }}>/</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, letterSpacing: '0.2em' }}>DROPS</span>
        </Link>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => onFilter && onFilter(f)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: BODY, fontSize: 12, fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: activeFilter === f ? T.white : T.gray,
                padding: '4px 0',
                borderBottom: activeFilter === f ? `1px solid ${T.white}` : '1px solid transparent',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = T.white}
              onMouseLeave={e => e.currentTarget.style.color = activeFilter === f ? T.white : T.gray}
            >{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            to="/brands"
            style={{
              fontFamily: BODY, fontSize: 12, fontWeight: 500,
              color: T.gray, textDecoration: 'none',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = T.white}
            onMouseLeave={e => e.currentTarget.style.color = T.gray}
          >For Brands</Link>

          <button
            onClick={() => setIsOpen(true)}
            style={{
              position: 'relative', background: 'none', border: 'none',
              cursor: 'pointer', color: T.white, display: 'flex', alignItems: 'center',
            }}
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#CC0000', color: '#fff',
                width: 16, height: 16, borderRadius: '50%',
                fontFamily: MONO, fontSize: 9, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>{count}</span>
            )}
          </button>

          <Link
            to="/"
            style={{
              fontFamily: BODY, fontSize: 12, fontWeight: 500,
              color: T.gray, textDecoration: 'none',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              border: `1px solid ${T.borderVis}`, padding: '7px 16px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.gray }}
            onMouseLeave={e => { e.currentTarget.style.color = T.gray; e.currentTarget.style.borderColor = T.borderVis }}
          >← Back to Rebl</Link>
        </div>
      </div>
    </nav>
  )
}
