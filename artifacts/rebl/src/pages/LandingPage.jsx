import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import StarField from '@/components/StarField'
import CrossHair from '@/components/CrossHair'
import GreekBorder from '@/components/GreekBorder'

/* ─── Design Tokens ─── */
const T = {
  bg: '#000000',
  surface: '#080808',
  card: '#0D0D0D',
  border: '#1A1A1A',
  borderVis: '#2D2D2D',
  white: '#FFFFFF',
  gray: '#A6A6A6',
  grayMid: '#555555',
  grayDark: '#2A2A2A',
}
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'
const MONO = '"Space Mono", monospace'

const sep = { height: 1, backgroundColor: T.border, margin: 0 }

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: T.bg, color: T.white, fontFamily: BODY }}>
      <Navbar />
      <Hero />
      <Portals />
      <Identity />
      <Mission />
      <TheVault />
      <BrandMission />
      <UpcomingTech />
      <Pricing />
      <Footer />
    </div>
  )
}

/* ─── NAVBAR ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null))
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links = [
    { label: 'DROPS', to: '/drops' },
    { label: 'THE VAULT', to: user ? '/dashboard' : '/demo#step-1' },
    { label: 'DEMO', to: '/demo' },
    { label: 'BLOG', to: '/blog' },
  ]
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: scrolled ? 'rgba(0,0,0,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? `1px solid ${T.border}` : 'none',
      transition: 'all 0.3s ease', padding: '0 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 26, color: T.white, letterSpacing: '-0.5px', lineHeight: 1 }}>Rēbl</span>
          <span style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Own the rare. Tell its story.</span>
        </Link>
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {links.map(({ label, to }) => (
            <Link key={label} to={to} style={{
              fontFamily: BODY, fontSize: 12, fontWeight: 500, color: T.gray,
              textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = T.white}
              onMouseLeave={e => e.target.style.color = T.gray}
            >{label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/brand/signup" style={{
            fontFamily: BODY, fontSize: 12, fontWeight: 500, color: T.gray,
            textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '8px 18px', border: `1px solid ${T.borderVis}`, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.gray }}
            onMouseLeave={e => { e.currentTarget.style.color = T.gray; e.currentTarget.style.borderColor = T.borderVis }}
          >For Brands</Link>
          <Link to="/signup" style={{
            fontFamily: BODY, fontSize: 12, fontWeight: 600, color: T.bg,
            textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '8px 18px', backgroundColor: T.white, transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E0E0E0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = T.white}
          >Join Free</Link>
        </div>
      </div>
    </nav>
  )
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section style={{ minHeight: '100vh', backgroundColor: T.bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingTop: 120, paddingBottom: 80, paddingLeft: 'max(8vw,32px)', paddingRight: 32 }}>
      <StarField />

      {/* Orbital ring graphic */}
      <div style={{ position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.12 }}>
        <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
          <circle cx="250" cy="250" r="240" stroke={T.white} strokeWidth="0.5"/>
          <circle cx="250" cy="250" r="180" stroke={T.white} strokeWidth="0.5"/>
          <circle cx="250" cy="250" r="120" stroke={T.white} strokeWidth="0.5"/>
          <circle cx="250" cy="250" r="60" stroke={T.white} strokeWidth="0.5"/>
          <circle cx="250" cy="10" r="5" fill={T.white}/>
          <circle cx="490" cy="250" r="4" fill={T.white}/>
          <circle cx="116" cy="116" r="3" fill={T.white}/>
          <circle cx="384" cy="96" r="3" fill={T.white}/>
          <line x1="248" y1="248" x2="252" y2="252" stroke={T.white} strokeWidth="1.5"/>
          <line x1="248" y1="252" x2="252" y2="248" stroke={T.white} strokeWidth="1.5"/>
          <ellipse cx="250" cy="250" rx="240" ry="60" stroke={T.white} strokeWidth="0.5" transform="rotate(-30 250 250)"/>
        </svg>
      </div>

      <div style={{ maxWidth: 680, position: 'relative', zIndex: 1 }}>
        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 32, height: 1, backgroundColor: T.gray }}/>
          <span style={{ fontFamily: MONO, fontSize: 10, color: T.gray, letterSpacing: '0.2em' }}>EST. MMXXV — INDIA'S COLLECTOR OS</span>
          <div style={{ width: 32, height: 1, backgroundColor: T.gray }}/>
        </div>

        {/* Headline */}
        <h1 style={{ margin: 0, lineHeight: 1.0 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(52px,7vw,92px)', fontWeight: 700, color: T.white, letterSpacing: '-1px', textTransform: 'uppercase' }}>Own it.</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(52px,7vw,92px)', fontWeight: 700, color: T.gray, letterSpacing: '-1px', textTransform: 'uppercase' }}>Tell its story.</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(52px,7vw,92px)', fontWeight: 700, color: T.grayDark, letterSpacing: '-1px', textTransform: 'uppercase' }}>Find your orbit.</div>
        </h1>

        {/* Sub */}
        <p style={{ marginTop: 32, fontFamily: BODY, fontSize: 17, color: T.grayMid, maxWidth: 480, lineHeight: 1.7 }}>
          From ancient roots, to infinite futures. Rebl is the vault for collectors who refuse to blend in.
        </p>

        {/* CTA */}
        <div style={{ marginTop: 48, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/signup" style={{
            fontFamily: BODY, fontSize: 13, fontWeight: 600, color: T.bg,
            textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '16px 48px', backgroundColor: T.white, transition: 'all 0.2s', display: 'inline-block',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#D0D0D0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = T.white}
          >Start Your Collection →</Link>
          <Link to="/demo" style={{
            fontFamily: BODY, fontSize: 13, fontWeight: 500, color: T.gray,
            textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '16px 32px', border: `1px solid ${T.borderVis}`, transition: 'all 0.2s', display: 'inline-block',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gray; e.currentTarget.style.color = T.white }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderVis; e.currentTarget.style.color = T.gray }}
          >See the Demo</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, marginTop: 72, flexWrap: 'wrap' }}>
          {[{ n: '01', val: '500+', label: 'Collectors' }, { n: '02', val: '20+', label: 'Brands' }, { n: '03', val: '1K+', label: 'Verified Items' }].map(s => (
            <div key={s.n}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.15em', marginBottom: 6 }}>{s.n}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 700, color: T.white, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: BODY, fontSize: 11, color: T.grayMid, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Greek border at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <GreekBorder color={T.borderVis} opacity={0.6}/>
      </div>
    </section>
  )
}

/* ─── PORTALS ─── */
function Portals() {
  const [dot, setDot] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setDot(d => !d), 900)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: T.borderVis, gap: 1 }}>
        {/* PORTAL 1 — DROPS */}
        <Link to="/drops" style={{ textDecoration: 'none', display: 'block', background: T.surface, padding: 'max(6vw, 48px)', transition: 'background 0.2s', position: 'relative' }}
          onMouseEnter={e => e.currentTarget.style.background = T.card}
          onMouseLeave={e => e.currentTarget.style.background = T.surface}
        >
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.35em', marginBottom: 28 }}>DROPS.REBL.IN</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px, 3.5vw, 36px)', color: T.white, fontWeight: 700, lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.5px' }}>
            Limited editions.<br />Right now.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 15, color: T.grayMid, lineHeight: 1.8, maxWidth: 400, marginBottom: 36 }}>
            Nike. Supreme. Concerts. The things that sell out. Find them, buy them, own them — with a story attached.
          </p>
          <div style={{ display: 'flex', gap: 32, marginBottom: 36 }}>
            {[['12', 'live drops'], ['3', 'ending soon']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: T.white, fontWeight: 700 }}>{n}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.15em', marginTop: 4 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={{
            display: 'inline-block', background: T.white, color: '#000',
            fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', padding: '12px 28px', textTransform: 'uppercase',
          }}>Enter Drops →</div>
          <div style={{ position: 'absolute', bottom: 'max(6vw, 48px)', right: 'max(6vw, 48px)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: '#CC0000',
              opacity: dot ? 1 : 0.3, transition: 'opacity 0.4s',
            }} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: '#CC0000', letterSpacing: '0.2em' }}>LIVE</span>
          </div>
        </Link>

        {/* PORTAL 2 — THE VAULT */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'block', background: T.bg, padding: 'max(6vw, 48px)', transition: 'background 0.2s', position: 'relative' }}
          onMouseEnter={e => e.currentTarget.style.background = T.surface}
          onMouseLeave={e => e.currentTarget.style.background = T.bg}
        >
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.35em', marginBottom: 28 }}>VAULT.REBL.IN</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px, 3.5vw, 36px)', color: T.white, fontWeight: 700, lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.5px' }}>
            Your collection.<br />Permanent.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 15, color: T.grayMid, lineHeight: 1.8, maxWidth: 400, marginBottom: 36 }}>
            Add what you own. Get an AI-generated story. Build a verified identity as a collector.
          </p>
          <div style={{ display: 'flex', gap: 32, marginBottom: 36 }}>
            {[['500+', 'collectors'], ['1000+', 'verified items']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: T.white, fontWeight: 700 }}>{n}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.15em', marginTop: 4 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={{
            display: 'inline-block', border: `1px solid ${T.borderVis}`, color: T.gray,
            fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', padding: '12px 28px', textTransform: 'uppercase',
          }}>Open Your Vault →</div>
          <div style={{
            position: 'absolute', bottom: 'max(6vw, 48px)', right: 'max(6vw, 48px)',
            width: 28, height: 28, border: `1px solid ${T.borderVis}`, borderRadius: '50%',
            animation: 'orbit-spin 30s linear infinite',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 4, height: 4, background: T.gray, borderRadius: '50%', transform: 'translateX(10px)' }} />
          </div>
          <style>{`@keyframes orbit-spin { to { transform: rotate(360deg); } }`}</style>
        </Link>
      </div>
    </section>
  )
}

/* ─── IDENTITY ─── */
function Identity() {
  const rows = [
    { n: '01', title: 'Your collection is your identity.', body: 'Every piece you own is a signal — about where you\'ve been, what you value, what you refuse to compromise on. Rebl is built for people who collect with intention, not impulse.' },
    { n: '02', title: 'Stand out in a world of copies.', body: 'Limited editions exist because some things should never be mass-produced. We help you find them, own them, and build a record that proves it — permanently on the blockchain of culture.' },
    { n: '03', title: 'Find your orbit.', body: 'The 47 people in India who own the exact same piece as you exist. They care as much as you do. Rebl connects verified owners — not followers, not strangers. People who get it.' },
  ]
  return (
    <section style={{ backgroundColor: T.bg, padding: 'clamp(80px,10vw,140px) max(8vw,32px)', borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.grayMid, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 64 }}>
          The Collector
        </div>
        {rows.map((r, i) => (
          <div key={r.n}>
            {i > 0 && <div style={sep} />}
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 56, alignItems: 'start', padding: '48px 0' }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 60, fontWeight: 700, color: T.grayDark, lineHeight: 1 }}>{r.n}</div>
              <div>
                <h3 style={{ fontFamily: DISPLAY, fontSize: 'clamp(18px,2.2vw,26px)', fontWeight: 600, color: T.white, margin: '0 0 20px', letterSpacing: '-0.5px', textTransform: 'uppercase', lineHeight: 1.2 }}>{r.title}</h3>
                <p style={{ fontFamily: BODY, fontSize: 16, color: T.grayMid, lineHeight: 1.8, margin: 0, maxWidth: 580 }}>{r.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <GreekBorder color={T.borderVis} opacity={0.5}/>
    </section>
  )
}

/* ─── MISSION ─── */
function Mission() {
  const cols = [
    { label: 'Myth', n: '01', icon: '⊕', body: 'The timeless wisdom of ancient Greece — that great things are built by those who dare to go beyond what\'s known. We inherit that defiance.' },
    { label: 'Machine', n: '02', icon: '◎', body: 'AI-generated provenance. Blockchain ownership. NFC authentication. The machinery of modern invention, applied to the things you love.' },
    { label: 'Movement', n: '03', icon: '✦', body: 'A community of verified owners who find each other through the objects that define them. Not followers. A tribe.' },
  ]
  return (
    <section style={{ backgroundColor: T.surface, padding: 'clamp(80px,10vw,140px) max(8vw,32px)', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 72, textAlign: 'center' }}>
          <div style={{ width: 48, height: 1, backgroundColor: T.gray, margin: '0 auto' }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>
          {cols.map((c, i) => (
            <div key={c.n} style={{
              padding: '48px 40px',
              borderLeft: i === 0 ? `1px solid ${T.borderVis}` : 'none',
              borderRight: `1px solid ${T.borderVis}`,
              borderTop: `1px solid ${T.borderVis}`,
              borderBottom: `1px solid ${T.borderVis}`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, letterSpacing: '0.2em', marginBottom: 8 }}>{c.n}</div>
              <div style={{ fontSize: 28, marginBottom: 20, color: T.gray }}>{c.icon}</div>
              <h3 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: T.white, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</h3>
              <p style={{ fontFamily: BODY, fontSize: 15, color: T.grayMid, lineHeight: 1.8, margin: 0 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── THE VAULT ─── */
function TheVault() {
  const cards = [
    { label: 'Provenance Engine', icon: '◈', body: 'AI generates the story of each item the moment you add it. Cultural context, edition history, your personal chapter. Written like mythology.' },
    { label: 'Owner Rooms', icon: '⊞', body: 'Private spaces for verified owners of the same piece. 100 people in the world own this. You\'re one of them. Find the others.' },
    { label: 'Collector DNA', icon: '◉', body: 'Your taste profile, auto-generated from your vault. Archetype. Signature phrase. The collector you actually are, in data.' },
  ]
  return (
    <section style={{ backgroundColor: T.bg, padding: 'clamp(80px,10vw,140px) max(8vw,32px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.grayMid, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 20 }}>The Vault</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(36px,5.5vw,72px)', fontWeight: 700, color: T.white, margin: 0, letterSpacing: '-1px', textTransform: 'uppercase', lineHeight: 1 }}>Your permanent record.</h2>
          <p style={{ fontFamily: BODY, fontSize: 16, color: T.grayMid, lineHeight: 1.7, margin: '20px 0 0', maxWidth: 500 }}>Not a profile. Not a portfolio. A permanent record of who you are as a collector — sealed in time.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, backgroundColor: T.borderVis }}>
          {cards.map((c, i) => (
            <div key={i} style={{ backgroundColor: T.bg, padding: '44px 36px' }}>
              <div style={{ fontSize: 22, color: T.gray, marginBottom: 20 }}>{c.icon}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 12, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>{c.label}</div>
              <p style={{ fontFamily: BODY, fontSize: 15, color: T.grayMid, lineHeight: 1.8, margin: 0 }}>{c.body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40 }}>
          <Link to="/signup" style={{
            fontFamily: BODY, fontSize: 12, fontWeight: 500, color: T.gray,
            textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '14px 36px', border: `1px solid ${T.borderVis}`, display: 'inline-block', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.white; e.currentTarget.style.color = T.white }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderVis; e.currentTarget.style.color = T.gray }}
          >Build Your Vault →</Link>
        </div>
      </div>
      <div style={{ marginTop: 80 }}><GreekBorder color={T.borderVis} opacity={0.5}/></div>
    </section>
  )
}

/* ─── BRAND MISSION ─── */
function BrandMission() {
  const metrics = [
    { val: '61%', label: 'Post-purchase story completion rate' },
    { val: '3×', label: 'Higher retention vs standard e-commerce' },
    { val: '₹0', label: 'To launch your first drop' },
  ]
  return (
    <section style={{ backgroundColor: T.surface, padding: 'clamp(80px,10vw,140px) max(8vw,32px)', borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 80, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.grayMid, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 24 }}>For Brands</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,3.2vw,40px)', fontWeight: 700, color: T.white, margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '-0.5px', lineHeight: 1.1 }}>Limited editions done right.</h2>
          <p style={{ fontFamily: BODY, fontSize: 16, color: T.grayMid, lineHeight: 1.8, margin: '0 0 40px' }}>Rebl gives brands the infrastructure to make scarcity meaningful — not just a marketing trick. Launch drops, build verified communities, and know your most passionate buyers by name.</p>
          <Link to="/brand/signup" style={{
            fontFamily: BODY, fontSize: 12, fontWeight: 500, color: T.gray,
            textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '14px 36px', border: `1px solid ${T.borderVis}`, display: 'inline-block', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.white; e.currentTarget.style.color = T.white }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderVis; e.currentTarget.style.color = T.gray }}
          >Launch Your Brand ↗</Link>
        </div>
        <div>
          {metrics.map((m, i) => (
            <div key={i} style={{ padding: '32px 0', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 'clamp(40px,5vw,64px)', fontWeight: 700, color: T.white, lineHeight: 1 }}>{m.val}</div>
              <div style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid, marginTop: 8, letterSpacing: '0.02em' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── UPCOMING TECH ─── */
function UpcomingTech() {
  const items = [
    { label: 'NFC Authentication', icon: '◎', body: 'Tap your physical item with your phone. Ownership verified in under 1 second. No apps, no QR codes.' },
    { label: 'Blockchain Provenance', icon: '⬡', body: 'Every ownership transfer recorded on-chain. The item\'s full history, permanently and publicly verifiable.' },
    { label: 'NFT Vault Presence', icon: '◈', body: 'Every verified item in your vault gets a soulbound NFT. Non-transferable proof of ownership. Yours forever.' },
    { label: 'P2P Resale Market', icon: '⟳', body: 'Sell with full provenance attached. Buyers know exactly what they\'re getting. Royalties auto-distributed.' },
  ]
  return (
    <section style={{ backgroundColor: T.bg, padding: 'clamp(80px,10vw,140px) max(8vw,32px)', position: 'relative', overflow: 'hidden', borderTop: `1px solid ${T.border}` }}>
      <StarField />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.grayMid, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 20 }}>Classified // Coming Soon</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,3.2vw,40px)', fontWeight: 700, color: T.white, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>What's being built.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 1, backgroundColor: T.borderVis }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: T.bg, padding: '40px 32px' }}>
              <div style={{ fontSize: 20, color: T.gray, marginBottom: 16 }}>{item.icon}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 11, color: T.gray, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>{item.label}</div>
              <p style={{ fontFamily: BODY, fontSize: 14, color: T.grayMid, lineHeight: 1.8, margin: 0 }}>{item.body}</p>
              <div style={{ fontFamily: MONO, fontSize: 9, color: T.borderVis, letterSpacing: '0.15em', marginTop: 24 }}>STATUS: DEVELOPMENT</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── PRICING ─── */
function Pricing() {
  return (
    <section id="pricing" style={{ backgroundColor: T.surface, padding: 'clamp(80px,10vw,140px) max(8vw,32px)', borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.grayMid, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 20 }}>Pricing</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,3.2vw,40px)', fontWeight: 700, color: T.white, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Free to collect. Powerful to build.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 1, backgroundColor: T.borderVis }}>
          {/* Collector */}
          <div style={{ backgroundColor: T.surface, padding: '52px 44px' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 11, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 28 }}>Collector</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 56, fontWeight: 700, color: T.white, lineHeight: 1 }}>Free</div>
            <div style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid, margin: '10px 0 40px' }}>Forever, for every collector</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 44 }}>
              {['Unlimited items in your vault', 'AI provenance story for every item', 'Owner Rooms for verified pieces', 'Collector DNA profile', 'Public vault URL'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 6, height: 6, border: `1px solid ${T.gray}`, flexShrink: 0 }}/>
                  <span style={{ fontFamily: BODY, fontSize: 14, color: T.grayMid }}>{f}</span>
                </div>
              ))}
            </div>
            <Link to="/signup" style={{
              display: 'block', textAlign: 'center', fontFamily: BODY, fontSize: 12, fontWeight: 500,
              color: T.gray, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '14px', border: `1px solid ${T.borderVis}`, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.white }}
              onMouseLeave={e => { e.currentTarget.style.color = T.gray; e.currentTarget.style.borderColor = T.borderVis }}
            >Start Free →</Link>
          </div>
          {/* Brand */}
          <div style={{ backgroundColor: T.surface, padding: '52px 44px', border: `1px solid ${T.white}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 11, color: T.white, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Brand</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: T.bg, backgroundColor: T.white, padding: '4px 8px', letterSpacing: '0.1em' }}>MOST POPULAR</div>
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 56, fontWeight: 700, color: T.white, lineHeight: 1 }}>₹0</div>
            <div style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid, margin: '10px 0 40px' }}>For your first drop</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {['Unlimited drops', 'Customer tier engine', 'Post-purchase contact center', 'Brand story builder', 'AI campaign tools', 'Analytics dashboard'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 6, height: 6, backgroundColor: T.white, flexShrink: 0 }}/>
                  <span style={{ fontFamily: BODY, fontSize: 14, color: T.gray }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid, marginBottom: 36 }}>Growth from ₹15,000/mo</div>
            <Link to="/brand/signup" style={{
              display: 'block', textAlign: 'center', fontFamily: BODY, fontSize: 12, fontWeight: 600,
              color: T.bg, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '14px', backgroundColor: T.white, transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#D0D0D0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = T.white}
            >Launch Free →</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  const cols = [
    { label: 'Product', links: [{ text: 'How it works', to: '/demo' }, { text: 'The Vault', to: '/demo#step-1' }, { text: 'Add to Collection', to: '/add-item' }, { text: 'Drops', to: '/brand/vegnongveg' }] },
    { label: 'Brands', links: [{ text: 'Partner with us', to: '/brand/signup' }, { text: 'Brand Dashboard', to: '/brand-dashboard' }, { text: 'Pricing', to: '/#pricing' }] },
    { label: 'Community', links: [{ text: 'Find Your Tribe', to: '/tribe' }, { text: 'Blog', to: '/blog' }] },
    { label: 'Legal', links: [{ text: 'About', to: '/about' }, { text: 'Privacy', to: '/privacy' }, { text: 'Terms', to: '/terms' }] },
  ]
  return (
    <footer style={{ backgroundColor: T.bg, borderTop: `1px solid ${T.border}` }}>
      <GreekBorder color={T.borderVis} opacity={0.4}/>
      <div style={{ padding: 'clamp(56px,7vw,96px) max(8vw,32px) 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4,1fr)', gap: 40, marginBottom: 80, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 32, color: T.white, letterSpacing: '-0.5px', marginBottom: 6 }}>Rēbl</div>
              <div style={{ fontFamily: MONO, fontSize: 7, color: T.grayMid, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>Own the rare. Tell its story.</div>
              <p style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid, lineHeight: 1.7, margin: 0, maxWidth: 220 }}>From ancient roots, to infinite futures.</p>
            </div>
            {cols.map(col => (
              <div key={col.label}>
                <div style={{ fontFamily: DISPLAY, fontSize: 10, color: T.gray, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 24 }}>{col.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {col.links.map(link => (
                    <Link key={link.text} to={link.to} style={{ fontFamily: BODY, fontSize: 13, color: T.grayMid, textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = T.white}
                      onMouseLeave={e => e.target.style.color = T.grayMid}
                    >{link.text}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px max(8vw,32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid, letterSpacing: '0.04em' }}>From ancient roots, to infinite futures.</span>
          <span style={{ fontFamily: BODY, fontSize: 12, color: T.grayMid, letterSpacing: '0.04em' }}>Rebl.in · India · MMXXVI</span>
        </div>
      </div>
    </footer>
  )
}
