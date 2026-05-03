import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import StarField from '@/components/StarField'
import OrbitRing from '@/components/OrbitRing'
import CrossHair from '@/components/CrossHair'
import CoordinateGrid from '@/components/CoordinateGrid'

const C = {
  void: '#050508',
  cosmos: '#0A0A12',
  nebula: '#12121E',
  crater: '#1C1C2E',
  silver: '#A8B2C4',
  silverBright: '#C8D4E8',
  ghost: '#2A2A3E',
  cream: '#F0F4FF',
  dim: '#5A6380',
  star: '#E8F0FF',
  orbit: '#7B8FA8',
}

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: C.cosmos, color: C.cream, fontFamily: '"Plus Jakarta Sans", "Plus Jakarta Sans", Inter, sans-serif' }}>
      <Navbar />
      <Hero />
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
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null))
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Drops', to: '/brand/vegnongveg' },
    { label: 'The Vault', to: user ? '/dashboard' : '/demo#step-1' },
    { label: 'Demo', to: '/demo' },
    { label: 'Blog', to: '/blog' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: scrolled ? 'rgba(5,5,8,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? `1px solid ${C.ghost}` : 'none',
      transition: 'all 0.3s ease',
      padding: '0 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 22, color: C.cream, letterSpacing: '-0.5px', lineHeight: 1 }}>Rēbl</span>
          <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 7, color: C.dim, letterSpacing: '0.22em', textTransform: 'uppercase' }}>COLLECTOR OS</span>
        </Link>

        {/* Center nav */}
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {navLinks.map(({ label, to }) => (
            <Link key={label} to={to} style={{
              fontFamily: '"Space Mono", monospace', fontSize: 11, color: C.dim,
              textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = C.silver}
              onMouseLeave={e => e.target.style.color = C.dim}
            >{label}</Link>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/brand/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim,
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '8px 16px', border: `1px solid ${C.ghost}`,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = C.silver; e.currentTarget.style.borderColor = C.silver }}
            onMouseLeave={e => { e.currentTarget.style.color = C.dim; e.currentTarget.style.borderColor = C.ghost }}
          >For Brands</Link>
          <Link to="/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.void,
            textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '8px 16px', backgroundColor: C.silver,
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = C.silverBright}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = C.silver}
          >Join Free</Link>
        </div>
      </div>
    </nav>
  )
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section style={{
      minHeight: '100vh', backgroundColor: C.void,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center',
      paddingTop: 120, paddingBottom: 80,
      paddingLeft: 'max(10vw, 32px)', paddingRight: 32,
    }}>
      <StarField />
      <CoordinateGrid />

      {/* Orbit ring — right side */}
      <div style={{ position: 'absolute', right: -100, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.7 }}>
        <OrbitRing size={600} />
      </div>

      {/* Collector orbit — visual anchor */}
      <div style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <svg width="400" height="400" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" fill="none" stroke="#A8B2C408" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="130" fill="none" stroke="#A8B2C412" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="80" fill="none" stroke="#A8B2C418" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="30" fill="none" stroke="#A8B2C425" strokeWidth="0.8" />
          <circle cx="200" cy="20" r="4" fill="#A8B2C440" />
          <circle cx="380" cy="200" r="3" fill="#A8B2C430" />
          <circle cx="91" cy="109" r="2.5" fill="#A8B2C435" />
          <circle cx="309" cy="91" r="2" fill="#A8B2C428" />
          <circle cx="135" cy="335" r="2" fill="#A8B2C420" />
          <line x1="200" y1="198" x2="200" y2="202" stroke="#A8B2C460" strokeWidth="1" />
          <line x1="198" y1="200" x2="202" y2="200" stroke="#A8B2C460" strokeWidth="1" />
        </svg>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
        {/* Top label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 24, height: 1, backgroundColor: C.silver }} />
          <span style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver,
            letterSpacing: '0.25em', textTransform: 'uppercase',
          }}>EST. 2025 — INDIA'S COLLECTOR OS</span>
        </div>

        {/* Headline */}
        <h1 style={{ margin: 0, lineHeight: 1.05, letterSpacing: '-2px' }}>
          <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(48px, 6.5vw, 88px)', fontWeight: 800, color: C.cream }}>Own it.</div>
          <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(48px, 6.5vw, 88px)', fontWeight: 800, color: C.silver }}>Tell its story.</div>
          <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(48px, 6.5vw, 88px)', fontWeight: 800, color: C.ghost }}>Find your orbit.</div>
        </h1>

        {/* Sub */}
        <p style={{
          marginTop: 32, fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 18, color: C.dim,
          maxWidth: 480, lineHeight: 1.6,
        }}>
          Rebl is a vault for the things that define you. Limited drops, verified ownership, and a community of collectors who get it.
        </p>

        {/* CTA */}
        <Link to="/signup" style={{
          display: 'inline-block', marginTop: 48,
          fontFamily: '"Space Mono", monospace', fontSize: 11, color: C.silver,
          textDecoration: 'none', letterSpacing: '0.2em', textTransform: 'uppercase',
          padding: '16px 40px', border: `1px solid ${C.silver}`,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.silver; e.currentTarget.style.color = C.void }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.silver }}
        >Start Your Collection →</Link>

        {/* Coordinate stats */}
        <div style={{ display: 'flex', gap: 40, marginTop: 64, flexWrap: 'wrap' }}>
          {[
            { val: '500+', label: 'COLLECTORS', coord: '01.A' },
            { val: '20+', label: 'BRANDS', coord: '02.B' },
            { val: '1K+', label: 'VERIFIED ITEMS', coord: '03.C' },
          ].map(s => (
            <div key={s.coord}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, letterSpacing: '0.15em', marginBottom: 4 }}>{s.coord}</div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 28, fontWeight: 700, color: C.cream, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.orbit, letterSpacing: '0.2em', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── IDENTITY ─── */
function Identity() {
  const rows = [
    {
      n: '01',
      title: 'Your collection is your identity.',
      body: 'Every piece you own is a signal — about where you\'ve been, what you value, what you refuse to compromise on. Rebl is built for people who collect with intention, not impulse.',
    },
    {
      n: '02',
      title: 'Stand out in a world of copies.',
      body: 'Limited editions exist because some things should never be mass-produced. We help you find them, own them, and build a profile that proves it — permanently.',
    },
    {
      n: '03',
      title: 'Find your orbit.',
      body: 'The 47 people in India who own the exact same piece as you exist. They care as much as you do. Rebl connects verified owners — not followers, not strangers. People who get it.',
    },
  ]
  return (
    <section style={{ backgroundColor: C.void, padding: 'clamp(60px,8vw,128px) max(10vw,32px)', position: 'relative', overflow: 'hidden' }}>
      <CoordinateGrid />
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {rows.map((r, i) => (
          <div key={r.n}>
            {i > 0 && <div style={{ height: 1, backgroundColor: C.ghost, margin: '48px 0' }} />}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 48, alignItems: 'start' }}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 64, fontWeight: 700, color: C.crater, lineHeight: 1 }}>{r.n}</div>
              <div>
                <h3 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 700, color: C.cream, margin: '0 0 16px', letterSpacing: '-0.5px' }}>{r.title}</h3>
                <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 16, color: C.dim, lineHeight: 1.75, margin: 0, maxWidth: 560 }}>{r.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── MISSION ─── */
function Mission() {
  const items = [
    { n: '01', label: 'ACQUIRE', body: 'Drop-based marketplace. Limited quantities. Verified access. No bots, no bots, no bots.' },
    { n: '02', label: 'AUTHENTICATE', body: 'Every item gets a permanent digital record. AI-generated provenance story. Verifiable ownership.' },
    { n: '03', label: 'ORBIT', body: 'Connect with verified owners of the same piece. Owner Rooms, community boards, shared culture.' },
  ]
  return (
    <section style={{ backgroundColor: C.nebula, padding: 'clamp(60px,8vw,128px) max(5vw,32px)', borderTop: `1px solid ${C.ghost}`, borderBottom: `1px solid ${C.ghost}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>MISSION PARAMETERS</div>
          <h2 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 800, color: C.cream, margin: 0, letterSpacing: '-1px' }}>Three coordinates. One platform.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>
          {items.map((item, i) => (
            <div key={item.n} style={{
              padding: '40px 36px',
              borderLeft: i === 0 ? `1px solid ${C.ghost}` : 'none',
              borderRight: `1px solid ${C.ghost}`,
              borderTop: `1px solid ${C.ghost}`,
              borderBottom: `1px solid ${C.ghost}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: C.silver }}>{item.n}</span>
                <div style={{ flex: 1, height: 1, backgroundColor: C.ghost }} />
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: C.silver, letterSpacing: '0.15em' }}>{item.label}</span>
              </div>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 15, color: C.dim, lineHeight: 1.75, margin: 0 }}>{item.body}</p>
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
    { label: 'PROVENANCE ENGINE', body: 'AI generates the story of each item the moment you add it. Cultural context, edition history, your personal chapter.' },
    { label: 'OWNER ROOMS', body: 'Private spaces for verified owners of the same piece. 100 people in the world own this. You\'re one of them.' },
    { label: 'COLLECTOR DNA', body: 'Your taste profile, auto-generated from your vault. Archetype. Signature phrase. The collector you actually are.' },
  ]
  return (
    <section style={{ backgroundColor: C.cosmos, padding: 'clamp(60px,8vw,128px) max(5vw,32px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 64, maxWidth: 600 }}>
          <h2 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(40px,5.5vw,72px)', fontWeight: 800, color: C.cream, margin: '0 0 16px', letterSpacing: '-2px', lineHeight: 1 }}>The Vault.</h2>
          <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 17, color: C.dim, lineHeight: 1.65, margin: 0 }}>Not a profile. Not a portfolio. A permanent record of who you are as a collector.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, backgroundColor: C.ghost }}>
          {cards.map((c, i) => (
            <div key={i} style={{ backgroundColor: C.cosmos, padding: '40px 32px' }}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.2em', marginBottom: 20 }}>{c.label}</div>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 15, color: C.dim, lineHeight: 1.75, margin: 0 }}>{c.body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40 }}>
          <Link to="/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver,
            textDecoration: 'none', letterSpacing: '0.2em', textTransform: 'uppercase',
            padding: '14px 36px', border: `1px solid ${C.silver}`, display: 'inline-block',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.silver; e.currentTarget.style.color = C.void }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.silver }}
          >Build Your Vault →</Link>
        </div>
      </div>
    </section>
  )
}

/* ─── BRAND MISSION ─── */
function BrandMission() {
  const metrics = [
    { val: '61%', label: 'post-purchase story completion rate' },
    { val: '3x', label: 'higher retention vs standard e-commerce' },
    { val: '₹0', label: 'to launch your first drop' },
  ]
  return (
    <section style={{ backgroundColor: C.nebula, padding: 'clamp(60px,8vw,128px) max(5vw,32px)', borderTop: `1px solid ${C.ghost}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 80, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20 }}>FOR BRANDS</div>
          <h2 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, color: C.cream, margin: '0 0 20px', letterSpacing: '-1px', lineHeight: 1.1 }}>Limited editions done right.</h2>
          <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 16, color: C.dim, lineHeight: 1.75, margin: '0 0 36px' }}>Rebl gives brands the infrastructure to make scarcity meaningful — not just a marketing trick. Launch drops, build verified communities, and know your most passionate buyers by name.</p>
          <Link to="/brand/signup" style={{
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver,
            textDecoration: 'none', letterSpacing: '0.2em', textTransform: 'uppercase',
            padding: '14px 32px', border: `1px solid ${C.silver}`, display: 'inline-block',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.silver; e.currentTarget.style.color = C.void }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.silver }}
          >Launch Your Brand ↗</Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ padding: '28px 0', borderBottom: `1px solid ${C.ghost}` }}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, color: C.cream, letterSpacing: '-2px' }}>{m.val}</div>
              <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, color: C.dim, marginTop: 6 }}>{m.label}</div>
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
    { label: 'NFC AUTHENTICATION', body: 'Tap your physical item with your phone. Ownership verified in under 1 second. No apps, no QR codes.' },
    { label: 'BLOCKCHAIN PROVENANCE', body: 'Every ownership transfer recorded on-chain. The item\'s full history, permanently and publicly verifiable.' },
    { label: 'NFT VAULT PRESENCE', body: 'Every verified item in your vault gets a soulbound NFT. Non-transferable proof of ownership. Yours forever, on-chain.' },
    { label: 'P2P RESALE MARKET', body: 'Sell with full provenance attached. Buyers know exactly what they\'re getting. Royalties auto-distributed to original brands.' },
  ]
  return (
    <section style={{ backgroundColor: C.void, padding: 'clamp(60px,8vw,128px) max(5vw,32px)', position: 'relative', overflow: 'hidden', borderTop: `1px solid ${C.ghost}` }}>
      <StarField />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', marginBottom: 16 }}>CLASSIFIED // COMING SOON</div>
          <h2 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 800, color: C.cream, margin: 0, letterSpacing: '-1px' }}>What's being built.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1, backgroundColor: C.ghost }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: C.void, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ height: 1, backgroundColor: C.silver, width: 40 }} />
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.2em' }}>{item.label}</div>
              <p style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 14, color: C.dim, lineHeight: 1.75, margin: 0, flex: 1 }}>{item.body}</p>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.ghost, letterSpacing: '0.15em' }}>STATUS: DEVELOPMENT</div>
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
    <section id="pricing" style={{ backgroundColor: C.cosmos, padding: 'clamp(60px,8vw,128px) max(5vw,32px)', borderTop: `1px solid ${C.ghost}` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', marginBottom: 16 }}>PRICING</div>
          <h2 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 'clamp(24px,3.5vw,42px)', fontWeight: 800, color: C.cream, margin: 0, letterSpacing: '-1px' }}>Free to collect. Powerful to build.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 1, backgroundColor: C.ghost }}>
          {/* Collector */}
          <div style={{ backgroundColor: C.cosmos, padding: '48px 40px' }}>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.orbit, letterSpacing: '0.2em', marginBottom: 24 }}>COLLECTOR</div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 48, fontWeight: 700, color: C.cream, lineHeight: 1 }}>Free</div>
            <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, color: C.dim, margin: '8px 0 36px' }}>Forever</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
              {['Unlimited items in your vault', 'AI story for every item', 'Owner Rooms for verified pieces', 'Collector DNA profile', 'Public vault URL'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CrossHair size={14} color={C.silver} />
                  <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 14, color: C.dim }}>{f}</span>
                </div>
              ))}
            </div>
            <Link to="/signup" style={{
              display: 'block', textAlign: 'center',
              fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver,
              textDecoration: 'none', letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '14px', border: `1px solid ${C.silver}`,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.silver; e.currentTarget.style.color = C.void }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.silver }}
            >Start Free →</Link>
          </div>

          {/* Brand */}
          <div style={{ backgroundColor: C.cosmos, padding: '48px 40px', border: `1px solid ${C.silver}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.2em' }}>BRAND</div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 8, color: C.void, backgroundColor: C.silver, padding: '3px 8px', letterSpacing: '0.1em' }}>MOST POPULAR</div>
            </div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 48, fontWeight: 700, color: C.cream, lineHeight: 1 }}>₹0</div>
            <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, color: C.dim, margin: '8px 0 36px' }}>For your first drop</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
              {['Unlimited drops', 'Customer tier engine', 'Post-purchase contact center', 'Brand story builder', 'AI campaign tools', 'Subdomain: yourbrand.rebl.in', 'Analytics dashboard'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CrossHair size={14} color={C.silver} />
                  <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 14, color: C.dim }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 12, color: C.dim, marginBottom: 32 }}>Growth from ₹15,000/mo</div>
            <Link to="/brand/signup" style={{
              display: 'block', textAlign: 'center',
              fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.void,
              textDecoration: 'none', letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '14px', backgroundColor: C.silver,
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.silverBright}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = C.silver}
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
    {
      label: 'PRODUCT',
      links: [
        { text: 'How it works', to: '/#how-it-works' },
        { text: 'The Vault', to: '/demo#step-1' },
        { text: 'Add to Collection', to: '/add-item' },
        { text: 'Drops', to: '/brand/vegnongveg' },
      ],
    },
    {
      label: 'BRANDS',
      links: [
        { text: 'Partner with us', to: '/brand/signup' },
        { text: 'Brand Dashboard', to: '/brand-dashboard' },
        { text: 'Pricing', to: '/#pricing' },
      ],
    },
    {
      label: 'COMMUNITY',
      links: [
        { text: 'Find Your Tribe', to: '/tribe' },
        { text: 'Drops', to: '/brand/vegnongveg' },
        { text: 'Blog', to: '/blog' },
      ],
    },
    {
      label: 'LEGAL',
      links: [
        { text: 'About', to: '/about' },
        { text: 'Privacy Policy', to: '/privacy' },
        { text: 'Terms', to: '/terms' },
      ],
    },
  ]

  return (
    <footer style={{ backgroundColor: C.void, borderTop: `1px solid ${C.ghost}`, padding: 'clamp(48px,6vw,80px) max(5vw,32px) 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: 40, marginBottom: 64, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 24, color: C.cream, letterSpacing: '-0.5px', lineHeight: 1 }}>Rēbl</div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 7, color: C.dim, letterSpacing: '0.22em', marginBottom: 14, marginTop: 4 }}>COLLECTOR OS</div>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.65, margin: 0, maxWidth: 220 }}>The platform for collectors who refuse to blend in.</p>
          </div>
          {cols.map(col => (
            <div key={col.label}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: C.orbit, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>{col.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(link => (
                  <Link key={link.text} to={link.to} style={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, color: C.dim,
                    textDecoration: 'none', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.target.style.color = C.silver}
                    onMouseLeave={e => e.target.style.color = C.dim}
                  >{link.text}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, backgroundColor: C.ghost, marginBottom: 32 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, letterSpacing: '0.1em' }}>© 2025 REBL. ALL RIGHTS RESERVED.</span>
          <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.crater, letterSpacing: '0.1em' }}>INDIA — COLLECTOR OS v1.0</span>
        </div>
      </div>
    </footer>
  )
}
