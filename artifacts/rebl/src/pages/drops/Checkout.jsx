import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { formatINR } from '@/lib/utils'
import confetti from 'canvas-confetti'

const T = {
  bg: '#000000', surface: '#050508', card: '#0A0A12',
  border: '#1A1A1A', borderVis: '#2D2D2D', borderDim: '#1C1C2E',
  white: '#F0F4FF', gray: '#A8B2C4', grayMid: '#5A6380',
}
const MONO = '"Space Mono", monospace'
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

function Field({ label, value, onChange, placeholder, type = 'text', half }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: half ? '0 0 calc(50% - 8px)' : '1 1 100%' }}>
      <label style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: T.card, border: `1px solid ${T.border}`, color: T.white,
          fontFamily: MONO, fontSize: 12, padding: '12px 16px', outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = T.gray}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  )
}

function OrderSummary({ items, total }) {
  const shipping = total >= 5000 ? 0 : 299
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: '24px' }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: T.gray, letterSpacing: '0.2em', marginBottom: 20 }}>ORDER SUMMARY</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: T.white, lineHeight: 1.3 }}>{item.product.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, marginTop: 2 }}>
                {item.variant && `${item.variant} · `}Qty: {item.qty}
              </div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: T.white, whiteSpace: 'nowrap' }}>{formatINR(item.product.price * item.qty)}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid }}>SUBTOTAL</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: T.gray }}>{formatINR(total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid }}>SHIPPING</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: shipping === 0 ? '#4CAF50' : T.gray }}>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${T.border}`, marginTop: 4 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, color: T.white, letterSpacing: '0.1em' }}>TOTAL</span>
          <span style={{ fontFamily: MONO, fontSize: 12, color: T.white }}>{formatINR(total + shipping)}</span>
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [paying, setPaying] = useState(false)
  const [payMethod, setPayMethod] = useState('upi')
  const [orderNum] = useState(`RBL-${Math.floor(100000 + Math.random() * 900000)}`)
  const firstProductId = items[0]?.product?.id

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address1: '', address2: '', city: '', pin: '', state: '',
    upiId: '', cardNum: '', cardExp: '', cardCvv: '', cardName: '',
  })

  function setField(key) { return v => setForm(f => ({ ...f, [key]: v })) }

  function validateStep1() {
    const req = ['name', 'email', 'phone', 'address1', 'city', 'pin', 'state']
    return req.every(k => form[k].trim().length > 0)
  }

  async function handlePay() {
    setPaying(true)
    await new Promise(r => setTimeout(r, 2000))
    clearCart()
    setStep(3)
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#ffffff', '#A8B2C4', '#555555'] })
  }

  const shipping = total >= 5000 ? 0 : 299

  if (items.length === 0 && step !== 3) {
    return (
      <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, fontFamily: BODY }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 32, color: T.white }}>CART IS EMPTY</span>
        <Link to="/drops" style={{ fontFamily: MONO, fontSize: 11, color: T.gray, textDecoration: 'none', letterSpacing: '0.15em' }}>← Return to Drops</Link>
      </div>
    )
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.white, fontFamily: BODY }}>
      <div style={{
        position: 'sticky', top: 0, background: T.bg, borderBottom: `1px solid ${T.border}`,
        padding: '0 40px', zIndex: 10,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
          </Link>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            {['01 / DETAILS', '02 / PAYMENT', '03 / CONFIRMED'].map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 20, height: 20, border: `1px solid ${step > i + 1 ? '#4CAF50' : step === i + 1 ? T.white : T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: MONO, fontSize: 8,
                  background: step > i + 1 ? '#4CAF50' : 'transparent',
                  color: step === i + 1 ? T.white : step > i + 1 ? '#000' : T.grayMid,
                }}>{step > i + 1 ? '✓' : i + 1}</div>
                <span style={{ fontFamily: MONO, fontSize: 10, color: step === i + 1 ? T.white : T.grayMid, letterSpacing: '0.1em' }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      {step === 1 && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 60 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 12 }}>STEP ONE</div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: 32, color: T.white, fontWeight: 700, marginBottom: 40, letterSpacing: '0.05em' }}>YOUR DETAILS</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <Field label="Full Name" value={form.name} onChange={setField('name')} placeholder="Your full name" />
              <Field label="Email" value={form.email} onChange={setField('email')} placeholder="email@example.com" type="email" half />
              <Field label="Phone" value={form.phone} onChange={setField('phone')} placeholder="+91 9876543210" half />
              <Field label="Address Line 1" value={form.address1} onChange={setField('address1')} placeholder="Street, Building" />
              <Field label="Address Line 2" value={form.address2} onChange={setField('address2')} placeholder="Landmark, Area (optional)" />
              <Field label="City" value={form.city} onChange={setField('city')} placeholder="Mumbai" half />
              <Field label="PIN Code" value={form.pin} onChange={setField('pin')} placeholder="400001" half />
              <Field label="State" value={form.state} onChange={setField('state')} placeholder="Maharashtra" />
            </div>
            <button
              onClick={() => validateStep1() && setStep(2)}
              style={{
                marginTop: 36, width: '100%', padding: '16px 0',
                background: validateStep1() ? T.white : T.borderDim,
                color: validateStep1() ? '#000' : T.grayMid,
                border: 'none', fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em',
                cursor: validateStep1() ? 'pointer' : 'not-allowed', textTransform: 'uppercase',
              }}
            >Continue to Payment →</button>
          </div>
          <OrderSummary items={items} total={total} />
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 60 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 12 }}>STEP TWO</div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: 32, color: T.white, fontWeight: 700, marginBottom: 12, letterSpacing: '0.05em' }}>PAYMENT</h1>
            <div style={{
              fontFamily: MONO, fontSize: 9, color: T.grayMid, border: `1px solid ${T.border}`,
              padding: '10px 14px', marginBottom: 32, letterSpacing: '0.1em',
            }}>DEMO CHECKOUT — NO REAL PAYMENT IS PROCESSED</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {[['upi', 'UPI'], ['netbanking', 'Net Banking'], ['card', 'Card']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setPayMethod(key)}
                  style={{
                    flex: 1, padding: '12px 0',
                    border: `1px solid ${payMethod === key ? T.white : T.border}`,
                    background: payMethod === key ? T.borderDim : 'transparent',
                    color: payMethod === key ? T.white : T.grayMid,
                    fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer',
                  }}
                >{label}</button>
              ))}
            </div>

            {payMethod === 'upi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="UPI ID" value={form.upiId} onChange={setField('upiId')} placeholder="name@upi" />
              </div>
            )}
            {payMethod === 'netbanking' && (
              <div style={{ fontFamily: MONO, fontSize: 11, color: T.grayMid, padding: '20px', border: `1px solid ${T.border}` }}>
                Net Banking simulation — select your bank and proceed.
              </div>
            )}
            {payMethod === 'card' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <Field label="Card Number" value={form.cardNum} onChange={setField('cardNum')} placeholder="•••• •••• •••• ••••" />
                <Field label="Expiry" value={form.cardExp} onChange={setField('cardExp')} placeholder="MM/YY" half />
                <Field label="CVV" value={form.cardCvv} onChange={setField('cardCvv')} placeholder="•••" half />
                <Field label="Name on Card" value={form.cardName} onChange={setField('cardName')} placeholder="As on card" />
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying}
              style={{
                marginTop: 32, width: '100%', padding: '16px 0',
                background: paying ? T.borderDim : T.white,
                color: paying ? T.gray : '#000', border: 'none',
                fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em',
                cursor: paying ? 'wait' : 'pointer', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              }}
            >
              {paying ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', fontSize: 14 }}>◈</span>
                  Processing...
                </>
              ) : `Pay ${formatINR(total + (total >= 5000 ? 0 : 299))} →`}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <button
              onClick={() => setStep(1)}
              style={{
                marginTop: 12, width: '100%', padding: '12px 0', background: 'transparent',
                color: T.grayMid, border: `1px solid ${T.border}`, fontFamily: MONO, fontSize: 10,
                letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase',
              }}
            >← Back to Details</button>
          </div>
          <OrderSummary items={items} total={total} />
        </div>
      )}

      {step === 3 && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#4CAF50', letterSpacing: '0.2em', marginBottom: 16 }}>CONFIRMED</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 56, color: T.white, fontWeight: 700, marginBottom: 16, letterSpacing: '-1px', lineHeight: 1 }}>Order Confirmed.</h1>
          <p style={{ fontFamily: BODY, fontSize: 16, color: T.gray, marginBottom: 12 }}>Your drop is on its way. Once delivered, add it to your vault.</p>
          <div style={{ fontFamily: MONO, fontSize: 12, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 48 }}>ORDER #{orderNum}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 64, textAlign: 'left' }}>
            {[
              { label: 'Order Processing', status: 'done' },
              { label: 'Dispatch — 2-3 business days', status: 'active' },
              { label: 'Delivery + Add to Vault', status: 'pending' },
            ].map(({ label, status }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 32, height: 32,
                  background: status === 'done' ? '#4CAF50' : status === 'active' ? T.borderDim : 'transparent',
                  border: `1px solid ${status === 'done' ? '#4CAF50' : status === 'active' ? T.gray : T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: MONO, fontSize: 11, color: status === 'done' ? '#000' : status === 'active' ? T.white : T.grayMid,
                  flexShrink: 0,
                }}>
                  {status === 'done' ? '✓' : status === 'active' ? '◎' : '○'}
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12, color: status === 'pending' ? T.grayMid : T.white, letterSpacing: '0.05em' }}>{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(firstProductId ? `/post-purchase/${firstProductId}` : '/dashboard')}
            style={{
              width: '100%', padding: '18px 0', background: T.white, color: '#000',
              border: 'none', fontFamily: MONO, fontSize: 12, letterSpacing: '0.25em',
              cursor: 'pointer', textTransform: 'uppercase', marginBottom: 8,
            }}
          >Pre-Add to Your Vault →</button>
          <p style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em', marginBottom: 16 }}>
            You can also do this after delivery. We'll remind you.
          </p>
          <p style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em', marginBottom: 32 }}>
            {form.email ? `A confirmation has been sent to ${form.email}` : 'Check your email for order confirmation.'}
          </p>
          <Link
            to="/drops"
            style={{
              fontFamily: MONO, fontSize: 10, color: T.gray, textDecoration: 'none',
              border: `1px solid ${T.border}`, padding: '12px 32px', display: 'inline-block', letterSpacing: '0.15em',
            }}
          >Continue Shopping</Link>
        </div>
      )}
    </div>
  )
}
