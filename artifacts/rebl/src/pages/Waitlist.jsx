import { useState } from 'react'
import { Link } from 'react-router-dom'
import StarField from '@/components/StarField'
import GreekBorder from '@/components/GreekBorder'
import imgHero from '@assets/ChatGPT_Image_May_3,_2026,_03_32_18_PM_1777809456046.png'
import imgMid from '@assets/ChatGPT_Image_May_3,_2026,_03_35_30_PM_1777809402549.png'
import { useWindowWidth } from '@/lib/utils'

const T = {
  bg: '#000000', surface: '#080808', card: '#0D0D0D',
  border: '#1A1A1A', borderVis: '#2D2D2D',
  white: '#FFFFFF', gray: '#A6A6A6', mid: '#555555', dark: '#2A2A2A',
}
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const QUOTES = [
  {
    text: 'The things you own end up owning you — unless you own them with intention.',
    attr: 'Collector maxim',
  },
  {
    text: 'Rarity is not manufactured. It is recognised. The collector sees what others walk past.',
    attr: 'Rebl',
  },
  {
    text: 'Every great collection begins with one piece that meant something. Not two. One.',
    attr: 'Anonymous collector, Mumbai',
  },
  {
    text: 'In a world of infinite copies, owning the original is an act of resistance.',
    attr: 'On limited editions',
  },
]

export default function Waitlist() {
  const w = useWindowWidth()
  const isMobile = w < 768
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [activeQuote, setActiveQuote] = useState(0)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div style={{ backgroundColor: T.bg, color: T.white, fontFamily: BODY, minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Top nav */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: `1px solid ${T.border}`, backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', padding: isMobile ? '0 20px' : '0 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 20, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
          </Link>
          <Link to="/" style={{ fontFamily: MONO, fontSize: 10, color: T.gray, textDecoration: 'none', letterSpacing: '0.12em' }}>← BACK TO HOME</Link>
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingTop: isMobile ? 100 : 120, paddingBottom: 80, paddingLeft: isMobile ? 20 : 'max(8vw, 48px)', paddingRight: isMobile ? 20 : 'max(8vw, 48px)' }}>
        <StarField />

        {/* Hero image — right side */}
        <img
          src={imgHero}
          alt=""
          style={{
            position: 'absolute', right: 0, top: 0,
            height: '100%', width: isMobile ? '100%' : '52%',
            objectFit: 'cover', objectPosition: 'center top',
            opacity: isMobile ? 0.08 : 0.2, pointerEvents: 'none',
            maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
          }}
        />

        <div style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isMobile ? 28 : 40 }}>
            <div style={{ width: 6, height: 6, backgroundColor: '#CC0000', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: '#CC0000', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Early Access — Limited Spots</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(40px, 8vw, 88px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-1px', lineHeight: 0.95, margin: '0 0 28px' }}>
            <span style={{ color: T.white }}>Get In</span><br />
            <span style={{ color: T.gray }}>Before</span><br />
            <span style={{ color: T.dark }}>Everyone</span><br />
            <span style={{ color: T.dark }}>Else.</span>
          </h1>

          <p style={{ fontFamily: BODY, fontSize: isMobile ? 15 : 17, color: T.mid, lineHeight: 1.75, maxWidth: 480, marginBottom: 40 }}>
            Rebl is India's collector platform. Built for the ones who chase rare, own with intention, and refuse to blend in. Be among the first to access drops, vault your collection, and find your orbit.
          </p>

          {/* Form or success */}
          {submitted ? (
            <div style={{ backgroundColor: T.card, border: `1px solid ${T.borderVis}`, padding: '36px 32px', animation: 'fadeUp 0.4s ease' }}>
              <div style={{ fontFamily: MONO, fontSize: 28, color: T.white, marginBottom: 12 }}>✦</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>You're on the list.</div>
              <p style={{ fontFamily: BODY, fontSize: 14, color: T.gray, lineHeight: 1.7, margin: '0 0 20px' }}>
                We'll reach out to <strong style={{ color: T.white }}>{email}</strong> when early access opens. In the meantime — start thinking about what you'll add first.
              </p>
              <Link to="/" style={{ fontFamily: MONO, fontSize: 10, color: T.gray, textDecoration: 'none', letterSpacing: '0.12em', border: `1px solid ${T.border}`, padding: '10px 20px', display: 'inline-block' }}>
                BACK TO HOME
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 440 }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.15em', marginBottom: 6 }}>YOUR NAME</div>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="First name"
                    style={{ width: '100%', backgroundColor: '#0A0A0A', border: `1px solid ${T.border}`, color: T.white, padding: '12px 14px', fontSize: 13, fontFamily: BODY, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.15em', marginBottom: 6 }}>I AM A *</div>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#0A0A0A', border: `1px solid ${T.border}`, color: type ? T.white : T.mid, padding: '12px 14px', fontSize: 13, fontFamily: BODY, outline: 'none', appearance: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">Select…</option>
                    <option value="collector">Collector</option>
                    <option value="brand">Brand</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.15em', marginBottom: 6 }}>EMAIL ADDRESS *</div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ width: '100%', backgroundColor: '#0A0A0A', border: `1px solid ${T.border}`, color: T.white, padding: '12px 14px', fontSize: 13, fontFamily: BODY, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                style={{ backgroundColor: sending ? '#111' : T.white, color: sending ? T.gray : '#000', border: 'none', padding: '15px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: sending ? 'not-allowed' : 'pointer', transition: 'all 0.15s', marginTop: 4 }}
              >
                {sending ? 'Joining…' : 'Join the Waitlist ◈'}
              </button>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.mid, letterSpacing: '0.08em', lineHeight: 1.6 }}>
                No spam. Early access only. We respect your data.
              </div>
            </form>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, marginTop: 56, flexWrap: 'wrap' }}>
            {[{ val: '500+', label: 'On waitlist' }, { val: '20+', label: 'Brands ready' }, { val: 'Q3 2026', label: 'Early access' }].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: T.white, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: T.mid, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <GreekBorder color={T.borderVis} opacity={0.5} />
        </div>
      </section>

      {/* ── QUOTES SECTION ── */}
      <section style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, backgroundColor: T.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, overflowX: 'auto' }}>
            {QUOTES.map((q, i) => (
              <button
                key={i}
                onClick={() => setActiveQuote(i)}
                style={{ flex: 1, minWidth: 60, padding: isMobile ? '14px 12px' : '16px 24px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeQuote === i ? `2px solid ${T.white}` : '2px solid transparent', transition: 'all 0.2s' }}
              >
                <span style={{ fontFamily: MONO, fontSize: 10, color: activeQuote === i ? T.white : T.mid, letterSpacing: '0.1em' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
          {/* Quote body */}
          <div style={{ padding: isMobile ? '48px 20px' : '72px 80px', minHeight: isMobile ? 200 : 240, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.mid, letterSpacing: '0.25em', marginBottom: 24 }}>◈ COLLECTOR TRUTHS</div>
            <blockquote style={{ fontFamily: DISPLAY, fontSize: 'clamp(18px, 3vw, 30px)', color: T.white, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 20px' }}>
              "{QUOTES[activeQuote].text}"
            </blockquote>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.2em' }}>— {QUOTES[activeQuote].attr}</div>
          </div>
        </div>
      </section>

      {/* ── IMAGE + MANIFESTO ── */}
      <section style={{ borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
          {/* Image */}
          <div style={{ position: 'relative', minHeight: isMobile ? 320 : 560, overflow: 'hidden', backgroundColor: T.card }}>
            <img
              src={imgMid}
              alt="Rebl — Own the rare"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', opacity: 0.85 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.2em' }}>OWN THE RARE. TELL ITS STORY.</div>
            </div>
          </div>

          {/* Manifesto */}
          <div style={{ backgroundColor: T.bg, padding: isMobile ? '48px 20px' : '72px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.mid, letterSpacing: '0.25em', marginBottom: 20 }}>THE REBL MANIFESTO</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.15, color: T.white, marginBottom: 32 }}>
              This is not<br />for everyone.
            </h2>
            {[
              "It's for the one who spent three months tracking a specific colourway.",
              "The one who can tell you the exact story behind every piece in their collection.",
              "The one who doesn't collect to flex — they collect to remember.",
              "If that's you, your platform is almost ready.",
            ].map((line, i) => (
              <p key={i} style={{ fontFamily: BODY, fontSize: isMobile ? 14 : 15, color: i === 3 ? T.gray : T.mid, lineHeight: 1.75, margin: '0 0 12px' }}>
                {i === 3 ? <strong style={{ color: T.white }}>{line}</strong> : line}
              </p>
            ))}

            <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#waitlist-top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{ fontFamily: MONO, fontSize: 10, color: '#000', backgroundColor: T.white, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '12px 28px', display: 'inline-block' }}>
                Join Waitlist ◈
              </a>
              <Link to="/"
                style={{ fontFamily: MONO, fontSize: 10, color: T.gray, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '12px 20px', border: `1px solid ${T.border}`, display: 'inline-block' }}>
                Explore Rebl
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MORE QUOTES — GRID ── */}
      <section style={{ backgroundColor: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '48px 20px' : '72px 60px' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.mid, letterSpacing: '0.25em', marginBottom: 48 }}>✦ ON COLLECTING</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 1, backgroundColor: T.border }}>
            {[
              { text: '"The value of a thing is not what it costs to acquire, but what it costs to lose."', attr: 'Friedrich Nietzsche' },
              { text: '"Collecting is a hunt — and the greatest hunters know when to wait."', attr: 'Anonymous' },
              { text: '"Not everything that glitters is gold. The collector knows the difference."', attr: 'Collector wisdom' },
              { text: '"Your collection is the autobiography you write with things, not words."', attr: 'Rebl' },
            ].map((q, i) => (
              <div key={i} style={{ backgroundColor: T.surface, padding: isMobile ? '32px 20px' : '40px 44px' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 9, color: T.mid, letterSpacing: '0.2em', marginBottom: 20 }}>{String(i + 1).padStart(2, '0')}</div>
                <p style={{ fontFamily: BODY, fontSize: 15, color: T.gray, lineHeight: 1.8, margin: '0 0 16px', fontStyle: 'italic' }}>{q.text}</p>
                <div style={{ fontFamily: MONO, fontSize: 8, color: T.mid, letterSpacing: '0.15em' }}>— {q.attr}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ backgroundColor: T.bg, padding: isMobile ? '60px 20px' : '96px max(8vw,48px)', position: 'relative', overflow: 'hidden' }}>
        <StarField />
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.mid, letterSpacing: '0.3em', marginBottom: 20 }}>THE WAITLIST IS OPEN</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1, color: T.white, marginBottom: 20 }}>
            Your orbit<br />starts here.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 15, color: T.mid, lineHeight: 1.75, marginBottom: 40 }}>
            Early access members get first pick on drops, vault beta access, and a founding collector badge that stays on your profile forever.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ backgroundColor: T.white, color: '#000', border: 'none', padding: '16px 48px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Join the Waitlist ◈
          </button>
        </div>
      </section>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: isMobile ? '20px' : '20px max(8vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: BODY, fontSize: 12, color: T.mid }}>Rēbl · Global · MMXXVI</span>
        <Link to="/" style={{ fontFamily: MONO, fontSize: 10, color: T.mid, textDecoration: 'none', letterSpacing: '0.1em' }}>← Back to Home</Link>
      </div>
    </div>
  )
}
