import { useCart } from '@/context/CartContext'
import { useNavigate } from 'react-router-dom'
import { formatINR } from '@/lib/utils'

const T = {
  bg: '#000000', surface: '#0A0A0A', card: '#0D0D0D',
  border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', grayMid: '#555555',
}
const MONO = '"Space Mono", monospace'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

export default function CartDrawer() {
  const { items, removeFromCart, updateQty, total, count, isOpen, setIsOpen } = useCart()
  const navigate = useNavigate()

  if (!isOpen) return null

  const shipping = total >= 5000 ? 0 : 299

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 199, backdropFilter: 'blur(4px)',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 420, height: '100vh',
        background: '#0A0A12', borderLeft: `1px solid ${T.borderVis}`,
        zIndex: 200, display: 'flex', flexDirection: 'column',
        fontFamily: BODY,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 28px', borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: T.white, letterSpacing: '0.15em' }}>YOUR CART</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid }}>({count} {count === 1 ? 'item' : 'items'})</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: T.gray, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
          >✕</button>
        </div>

        {items.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 28, color: T.borderVis }}>◈</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.grayMid, letterSpacing: '0.1em' }}>CART IS EMPTY</span>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {items.map(item => (
              <div key={item.id} style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
                <div style={{
                  width: '100%', height: 100,
                  background: `linear-gradient(135deg, ${item.product.mainColor}22 0%, #0A0A12 100%)`,
                  border: `1px solid ${T.border}`, marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 28, color: T.border, userSelect: 'none' }}>◈</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, paddingRight: 12 }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>{item.product.brand}</div>
                    <div style={{ fontFamily: MONO, fontSize: 13, color: T.white, lineHeight: 1.3, marginBottom: 6 }}>{item.product.name}</div>
                    {item.variant && (
                      <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, border: `1px solid ${T.border}`, display: 'inline-block', padding: '2px 8px' }}>{item.variant}</div>
                    )}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: T.white, whiteSpace: 'nowrap' }}>{formatINR(item.product.price)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${T.border}` }}>
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      style={{ background: 'none', border: 'none', color: T.gray, cursor: 'pointer', fontFamily: MONO, fontSize: 16, width: 32, height: 32 }}
                    >−</button>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: T.white, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      style={{ background: 'none', border: 'none', color: T.gray, cursor: 'pointer', fontFamily: MONO, fontSize: 16, width: 32, height: 32 }}
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'none', border: 'none', color: T.grayMid, cursor: 'pointer', fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', textDecoration: 'underline' }}
                  >REMOVE</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div style={{ borderTop: `2px solid ${T.borderVis}`, padding: '20px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid }}>SUBTOTAL</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.gray }}>{formatINR(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid }}>SHIPPING</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: shipping === 0 ? '#4CAF50' : T.gray }}>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: MONO, fontSize: 13, color: T.white, letterSpacing: '0.1em' }}>TOTAL</span>
              <span style={{ fontFamily: MONO, fontSize: 13, color: T.white }}>{formatINR(total + shipping)}</span>
            </div>
            <button
              onClick={() => { setIsOpen(false); navigate('/checkout') }}
              style={{
                width: '100%', padding: '14px 0', background: T.white, color: T.bg,
                border: 'none', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em',
                cursor: 'pointer', textTransform: 'uppercase', marginBottom: 10,
              }}
            >Proceed to Checkout →</button>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: '100%', padding: '12px 0', background: 'transparent',
                color: T.gray, border: `1px solid ${T.border}`,
                fontFamily: MONO, fontSize: 10, letterSpacing: '0.15em',
                cursor: 'pointer', textTransform: 'uppercase',
              }}
            >Continue Shopping</button>
          </div>
        )}
      </div>
    </>
  )
}
