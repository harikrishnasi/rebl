import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const T = {
  bg: '#000000', card: '#0D0D0D', border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', mid: '#555555',
}
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const IS = {
  width: '100%', backgroundColor: '#0A0A0A', border: `1px solid ${T.border}`,
  color: T.white, padding: '11px 14px', fontSize: 13, outline: 'none',
  fontFamily: BODY, boxSizing: 'border-box',
}

const FAQS = [
  {
    q: 'How do I get my brand verified on Rebl?',
    a: 'Submit your brand registration through the Brand Signup flow. Our team reviews applications within 3–5 business days. We verify legitimacy, product authenticity, and India GST compliance before activating your dashboard.',
  },
  {
    q: 'What commission does Rebl charge on drops?',
    a: 'Rebl charges a flat 8% platform fee on gross drop revenue. There are no listing fees, no monthly charges, and no hidden costs. Payment is settled within 7 business days of drop close.',
  },
  {
    q: 'How does the dynamic pricing engine work?',
    a: 'Prices move within the floor–ceiling band you set, responding to demand velocity, time-to-close, and collector tier. You always control the bounds — the engine optimises within them.',
  },
  {
    q: 'Can I run a drop without a fixed end date?',
    a: 'Yes. Set your drop to "rolling" mode and it stays open until you manually close it or units sell out. Countdown timers are hidden in rolling mode.',
  },
  {
    q: 'How does Rebl handle returns and disputes?',
    a: 'Collectors have a 48-hour dispute window post-delivery. Rebl mediates all disputes. If a product is found to be not as described, we issue a full refund and debit your payout. Verified items reduce dispute rates significantly.',
  },
  {
    q: 'What is Backstage Access and how do I enable it?',
    a: 'Backstage is a private content layer for your top-tier collectors — early access, behind-the-scenes posts, exclusive events. Enable it per tier from the Customers → Tier Configuration panel.',
  },
  {
    q: 'How do I contact my collectors directly?',
    a: 'Use the Smart Contact Queue in the Customers tab. Rebl surfaces high-signal opportunities (anniversaries, story nudges, tier upgrades) and generates AI-drafted messages in your brand voice.',
  },
  {
    q: 'Is my collector data portable?',
    a: 'Yes. You can export your full collector list, transaction history, and message logs as CSV at any time from Settings → Data Export. Your data is always yours.',
  },
]

const AI_RESPONSES = {
  default: [
    'That\'s a great question. Let me pull up what I know — could you share a bit more context so I can give you the most accurate answer?',
    'I\'ve checked our knowledge base on this. The short answer is: it depends on your drop configuration. Want me to walk you through the options?',
    'Our support team handles this category well. I\'ve flagged your query — you\'ll hear back within 4 business hours on working days.',
    'Based on similar queries, the most common resolution here is to check your Settings → Brand Profile section. Does that help?',
  ],
  pricing: 'Rebl charges a flat 8% platform fee on gross drop revenue. No listing fees, no monthly charges. Payouts settle within 7 business days of drop close.',
  dispute: 'Collectors have a 48-hour dispute window. Rebl mediates all disputes. If a product is found not as described, we issue a full refund and debit your payout.',
  verify: 'Brand verification takes 3–5 business days. We check GST compliance, product authenticity, and brand legitimacy. You\'ll get an email once approved.',
  backstage: 'Backstage is enabled per tier from Customers → Tier Configuration. Tiers with Backstage Access get access to your private posts and events.',
  commission: 'The platform fee is 8% of gross drop revenue — flat, no hidden costs. You keep 92% of every sale.',
}

function getAIReply(msg) {
  const lower = msg.toLowerCase()
  if (lower.includes('fee') || lower.includes('commission') || lower.includes('percent') || lower.includes('cost')) return AI_RESPONSES.commission
  if (lower.includes('dispute') || lower.includes('return') || lower.includes('refund')) return AI_RESPONSES.dispute
  if (lower.includes('verif') || lower.includes('approve')) return AI_RESPONSES.verify
  if (lower.includes('backstage') || lower.includes('exclusive')) return AI_RESPONSES.backstage
  if (lower.includes('price') || lower.includes('pricing') || lower.includes('dynamic')) return AI_RESPONSES.pricing
  return AI_RESPONSES.default[Math.floor(Math.random() * AI_RESPONSES.default.length)]
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
        <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, color: T.white, lineHeight: 1.5 }}>{item.q}</span>
        <span style={{ fontFamily: MONO, fontSize: 14, color: T.gray, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 18, paddingRight: 32 }}>
          <p style={{ fontFamily: BODY, fontSize: 13, color: T.gray, lineHeight: 1.75, margin: 0 }}>{item.a}</p>
        </div>
      )}
    </div>
  )
}

function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello. I\'m the Rebl support assistant. Ask me anything about your brand dashboard, drops, pricing, or collectors — I\'ll do my best to help.' }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function send() {
    const msg = input.trim()
    if (!msg) return
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const reply = getAIReply(msg)
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
      setTyping(false)
    }, 900 + Math.random() * 600)
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', height: 420 }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4CAF50', animation: 'pulse 2s infinite' }} />
        <span style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.2em' }}>REBL AI SUPPORT</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: T.mid, marginLeft: 'auto', letterSpacing: '0.1em' }}>BETA</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px',
              backgroundColor: m.role === 'user' ? T.white : '#111111',
              color: m.role === 'user' ? '#000' : T.white,
              border: m.role === 'user' ? 'none' : `1px solid ${T.border}`,
              fontFamily: BODY, fontSize: 13, lineHeight: 1.65,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 14px', backgroundColor: '#111111', border: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: T.mid, letterSpacing: '0.1em' }}>···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: `1px solid ${T.border}`, display: 'flex' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask a question…"
          style={{ ...IS, border: 'none', borderRadius: 0, flex: 1, backgroundColor: '#080808', padding: '14px 16px' }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          style={{ padding: '14px 20px', backgroundColor: input.trim() ? T.white : '#0D0D0D', color: input.trim() ? '#000' : T.mid, border: 'none', fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.15s', flexShrink: 0 }}>
          SEND
        </button>
      </div>
    </div>
  )
}

export default function BrandSupport() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', category: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.subject || !form.message) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, color: T.white, fontFamily: BODY }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: T.gray, cursor: 'pointer', fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', padding: 0 }}>← BACK</button>
          <span style={{ color: T.border }}>|</span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: T.mid, letterSpacing: '0.2em' }}>BRAND.SUPPORT</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: T.mid, letterSpacing: '0.15em' }}>REBL</div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '72px 32px 48px' }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 10 }}>HELP & SUPPORT</div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 16 }}>We're Here<br />For You</h1>
        <p style={{ color: T.gray, fontSize: 14, lineHeight: 1.75, maxWidth: 500, marginBottom: 48 }}>
          Questions about your brand dashboard, drops, payouts, or anything else — reach us below. Our team responds within 4 business hours.
        </p>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${T.border}`, borderLeft: `1px solid ${T.border}`, marginBottom: 72 }}>
          {[
            { label: 'Avg response time', val: '< 4 hrs' },
            { label: 'Satisfaction rate', val: '98.2%' },
            { label: 'Support hours', val: '9am–9pm IST' },
            { label: 'Days a week', val: '7 days' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '18px 20px', borderRight: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: MONO, fontSize: 18, color: T.white, letterSpacing: '0.05em', marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: T.mid, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Two-col: form + AI */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 80, alignItems: 'start' }}>

          {/* ── Support Form ── */}
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.25em', marginBottom: 6 }}>A · SUBMIT A TICKET</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>Contact Support</h2>

            {submitted ? (
              <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, padding: '36px 28px', textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: T.white, marginBottom: 12 }}>✓</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Ticket Submitted</div>
                <p style={{ color: T.gray, fontSize: 13, lineHeight: 1.65 }}>We've received your message and will respond to <strong style={{ color: T.white }}>{form.email}</strong> within 4 business hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', category: '', subject: '', message: '' }) }}
                  style={{ marginTop: 20, backgroundColor: 'transparent', border: `1px solid ${T.border}`, color: T.gray, padding: '10px 20px', fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer' }}>
                  SEND ANOTHER
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label>Name</Label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" style={IS} />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="brand@email.com" style={IS} />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...IS, appearance: 'none' }}>
                    <option value="">Select a topic…</option>
                    <option value="drops">Drops & Inventory</option>
                    <option value="payouts">Payouts & Billing</option>
                    <option value="customers">Customer Data</option>
                    <option value="account">Account & Settings</option>
                    <option value="technical">Technical Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Subject *</Label>
                  <input required value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Brief description of your issue" style={IS} />
                </div>
                <div>
                  <Label>Message *</Label>
                  <textarea required value={form.message} onChange={e => set('message', e.target.value)}
                    rows={5} placeholder="Describe the issue in detail…"
                    style={{ ...IS, resize: 'vertical', lineHeight: 1.65 }} />
                </div>
                <button type="submit" disabled={sending}
                  style={{ backgroundColor: sending ? '#111' : T.white, color: sending ? T.gray : '#000', border: 'none', padding: '14px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.15em', cursor: sending ? 'not-allowed' : 'pointer', transition: 'all 0.15s', textTransform: 'uppercase' }}>
                  {sending ? 'Sending…' : 'Submit Ticket ◈'}
                </button>
              </form>
            )}
          </div>

          {/* ── AI Assistant ── */}
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.25em', marginBottom: 6 }}>B · INSTANT ANSWERS</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>AI Assistant</h2>
            <AIChat />
            <p style={{ fontFamily: MONO, fontSize: 9, color: T.mid, letterSpacing: '0.08em', marginTop: 10, lineHeight: 1.6 }}>
              AI responses are generated and may not cover every edge case. For account-specific issues, submit a ticket.
            </p>
          </div>
        </div>

        {/* ── FAQs ── */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.25em', marginBottom: 6 }}>C · COMMON QUESTIONS</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 32 }}>Frequently Asked</h2>
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            {FAQS.map((item, i) => <FAQItem key={i} item={item} />)}
          </div>
        </div>

        {/* ── Contact channels ── */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.25em', marginBottom: 6 }}>D · DIRECT CHANNELS</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>Other Ways to Reach Us</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, backgroundColor: T.border }}>
            {[
              { sym: '◈', label: 'Email', val: 'brands@rebl.in', sub: 'For all brand enquiries' },
              { sym: '⊕', label: 'WhatsApp', val: '+91 98765 43210', sub: 'Mon–Sat, 10am–7pm IST' },
              { sym: '◎', label: 'Live Chat', val: 'In-app coming soon', sub: 'Q3 2025 rollout' },
              { sym: '✦', label: 'Brand Community', val: 'Slack workspace', sub: 'Apply via brands@rebl.in' },
            ].map((ch, i) => (
              <div key={i} style={{ backgroundColor: T.card, padding: '24px 22px' }}>
                <div style={{ fontFamily: MONO, fontSize: 18, color: T.gray, marginBottom: 10 }}>{ch.sym}</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.white, marginBottom: 4 }}>{ch.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 13, color: T.white, marginBottom: 4 }}>{ch.val}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.mid, letterSpacing: '0.08em' }}>{ch.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>{children}</div>
}
