import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWindowWidth } from '@/lib/utils'

const T = {
  bg: '#000000', border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const MONO = '"Space Mono", monospace'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

export default function DropsNav({ activeFilter, onFilter }) {
  const { count, setIsOpen } = useCart()
  const w = useWindowWidth()
  const isMobile = w < 768
  const [menuOpen, setMenuOpen] = useState(false)

  const filters = ['All', 'Sneakers', 'Streetwear', 'Events']

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: T.bg, borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56,
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 20, color: T.white, letterSpacing: '-0.5px', lineHeight: 1 }}>Rēbl</span>
            <span style={{ fontFamily: BODY, fontSize: 11, color: T.grayMid, fontWeight: 400 }}>/</span>
            <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 500, color: T.gray, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Drops</span>
          </Link>

          {/* Desktop: filter tabs */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
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
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isMobile && (
              <>
                <Link to="/brands" style={{ fontFamily: BODY, fontSize: 12, fontWeight: 500, color: T.gray, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = T.white}
                  onMouseLeave={e => e.currentTarget.style.color = T.gray}
                >For Brands</Link>
                <Link to="/" style={{ fontFamily: BODY, fontSize: 12, fontWeight: 500, color: T.gray, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', border: `1px solid ${T.borderVis}`, padding: '6px 14px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.gray }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.gray; e.currentTarget.style.borderColor = T.borderVis }}
                >← Back</Link>
              </>
            )}

            {/* Cart */}
            <button onClick={() => setIsOpen(true)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: T.white, display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={20} />
              {count > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#CC0000', color: '#fff', width: 16, height: 16, borderRadius: '50%', fontFamily: MONO, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{count}</span>
              )}
            </button>

            {/* Hamburger */}
            {isMobile && (
              <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.white, padding: 4, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ display: 'block', width: 22, height: 1.5, background: menuOpen ? T.gray : T.white, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
                <span style={{ display: 'block', width: 22, height: 1.5, background: T.white, transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
                <span style={{ display: 'block', width: 22, height: 1.5, background: menuOpen ? T.gray : T.white, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile filter row */}
        {isMobile && (
          <div style={{ borderTop: `1px solid ${T.border}`, display: 'flex', overflowX: 'auto', padding: '0 16px' }}>
            {filters.map(f => (
              <button key={f} onClick={() => onFilter && onFilter(f)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: activeFilter === f ? T.white : T.gray, padding: '10px 14px', borderBottom: activeFilter === f ? `1px solid ${T.white}` : '1px solid transparent', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {f}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile menu drawer */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, background: 'rgba(0,0,0,0.98)', display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 22, color: T.white }}>Rēbl</span>
            <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gray, fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em' }}>CLOSE ✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <Link to="/" onClick={() => setMenuOpen(false)} style={{ fontFamily: MONO, fontSize: 13, color: T.gray, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '18px 0', borderBottom: `1px solid ${T.border}` }}>← Back to Rebl</Link>
            <Link to="/brands" onClick={() => setMenuOpen(false)} style={{ fontFamily: MONO, fontSize: 13, color: T.gray, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '18px 0', borderBottom: `1px solid ${T.border}` }}>For Brands</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ fontFamily: MONO, fontSize: 13, color: T.white, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '18px 0', borderBottom: `1px solid ${T.border}` }}>Join Free</Link>
          </div>
        </div>
      )}
    </>
  )
}
