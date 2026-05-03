import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const T = {
  bg: '#050508', border: '#1C1C2E',
  white: '#F0F4FF', gray: '#A8B2C4', grayMid: '#5A6380',
}
const MONO = '"Space Mono", monospace'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

export default function DropsNav({ activeFilter, onFilter }) {
  const { count, setIsOpen } = useCart()
  const navigate = useNavigate()

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: T.gray }}>/</span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: T.gray, letterSpacing: '0.15em' }}>DROPS</span>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => onFilter && onFilter(f)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em',
                color: activeFilter === f ? T.white : T.grayMid,
                textTransform: 'uppercase', padding: '4px 0',
                borderBottom: activeFilter === f ? `1px solid ${T.white}` : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link
            to="/brands"
            style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.1em' }}
          >For Brands →</Link>
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
              fontFamily: MONO, fontSize: 10, color: T.grayMid, textDecoration: 'none',
              letterSpacing: '0.1em', border: `1px solid ${T.border}`, padding: '6px 14px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = T.white}
            onMouseLeave={e => e.currentTarget.style.color = T.grayMid}
          >← Back to Rebl</Link>
        </div>
      </div>
    </nav>
  )
}
