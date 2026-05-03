import { Link } from 'react-router-dom'

const T = {
  bg: '#000000', surface: '#050508', card: '#0A0A12',
  border: '#1A1A1A', borderVis: '#2D2D2D', borderDim: '#1C1C2E',
  white: '#F0F4FF', gray: '#A8B2C4', grayMid: '#5A6380',
}
const MONO = '"Space Mono", monospace'
const DISPLAY = '"Cinzel", Georgia, serif'
const BODY = '"Satoshi", "Plus Jakarta Sans", Inter, sans-serif'

const features = [
  {
    label: 'DROP INFRASTRUCTURE',
    body: 'Launch drops with access controls, countdown timers, and real-time inventory. Integrated with the Rebl collector community.',
    icon: '◈',
  },
  {
    label: 'COMMUNITY ANALYTICS',
    body: 'Know who your buyers are after the sale. Story completion rates. Community join rates. Tier progression. Data that doesn\'t exist anywhere else.',
    icon: '⊕',
  },
  {
    label: 'VERIFIED OWNER COMMUNITY',
    body: 'Every buyer gets a vault entry. Every vault entry is a verified community member. Brand-specific Owner Rooms, auto-created per drop.',
    icon: '◎',
  },
  {
    label: 'BRAND SUBDOMAIN',
    body: 'yourbrand.rebl.in. Your drop page, powered by Rebl. Full theme control. Zero engineering required.',
    icon: '✦',
  },
]

const caseStudies = [
  {
    brand: 'Nike × Rebl India',
    drop: 'AJ1 Chicago 2025 — 500 pairs',
    stats: [{ label: 'Story Completion', value: '94%' }, { label: 'Owner Room Join Rate', value: '78%' }, { label: 'Counterfeit Reports', value: '0' }],
  },
  {
    brand: 'Supreme × Rebl',
    drop: 'Box Logo FW24 — 200 units',
    stats: [{ label: 'Verified Sales', value: '100%' }, { label: 'Counterfeit Reports', value: '0' }, { label: 'Avg. Story Rating', value: '4.9' }],
  },
  {
    brand: 'Tame Impala',
    drop: 'Slow Rush Mumbai — 150 VIP tickets',
    stats: [{ label: 'Vaulted Post-Show', value: '100%' }, { label: 'Community Active', value: '89%' }, { label: 'Return Buyers', value: '43%' }],
  },
]

const pricing = [
  {
    tier: 'LAUNCH',
    price: '₹0',
    period: '/month',
    sub: 'For your first drop',
    features: ['1 drop/month', '100 units max', 'Basic vault integration', 'Owner community'],
    cta: 'Start Free',
  },
  {
    tier: 'BRAND',
    price: '₹9,999',
    period: '/month',
    sub: 'Unlimited drops',
    features: ['Unlimited drops', 'Unlimited units', 'Custom subdomain', 'Analytics dashboard', 'Backstage tiers', 'Priority support'],
    cta: 'Launch Your Brand',
    featured: true,
  },
  {
    tier: 'ENTERPRISE',
    price: 'Custom',
    period: '',
    sub: 'For large brands',
    features: ['Everything in Brand', 'Dedicated CSM', 'White-label options', 'API access', 'Custom integrations'],
    cta: 'Talk to Us',
  },
]

export default function BrandsLanding() {
  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.white, fontFamily: BODY }}>
      <nav style={{
        position: 'sticky', top: 0, background: T.surface, borderBottom: `1px solid ${T.borderDim}`,
        padding: '0 40px', zIndex: 10,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18, color: T.white, letterSpacing: '-0.5px' }}>Rēbl</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.gray }}>/</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.gray, letterSpacing: '0.15em' }}>BRANDS</span>
          </Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link to="/drops" style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid, textDecoration: 'none', letterSpacing: '0.1em' }}>Drops →</Link>
            <Link
              to="/brand/signup"
              style={{
                fontFamily: MONO, fontSize: 10, color: '#000', background: T.white,
                textDecoration: 'none', letterSpacing: '0.15em', padding: '8px 20px',
              }}
            >LAUNCH YOUR BRAND</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 40px 80px' }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.4em', marginBottom: 20 }}>BRANDS.REBL.IN</div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(36px, 6vw, 72px)', color: T.white, fontWeight: 700, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-1px', maxWidth: 700 }}>
          The infrastructure for limited editions.
        </h1>
        <p style={{ fontFamily: BODY, fontSize: 18, color: T.gray, maxWidth: 560, lineHeight: 1.8, marginBottom: 48 }}>
          Drop tools. Community analytics. Verified ownership. The things brands need to make scarcity matter.
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link
            to="/brand/signup"
            style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', color: '#000',
              background: T.white, textDecoration: 'none', padding: '14px 32px',
              display: 'inline-block', textTransform: 'uppercase',
            }}
          >Launch Your Brand →</Link>
          <Link
            to="/drops"
            style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', color: T.gray,
              border: `1px solid ${T.borderVis}`, textDecoration: 'none', padding: '14px 32px',
              display: 'inline-block', textTransform: 'uppercase',
            }}
          >See Live Drops</Link>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '80px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 48 }}>WHAT REBL GIVES BRANDS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: T.borderDim }}>
            {features.map(f => (
              <div key={f.label} style={{ background: T.bg, padding: '48px' }}>
                <div style={{ fontFamily: MONO, fontSize: 28, color: T.borderVis, marginBottom: 20 }}>{f.icon}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: T.gray, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>{f.label}</div>
                <p style={{ fontFamily: BODY, fontSize: 15, color: T.grayMid, lineHeight: 1.8 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '80px 40px', background: T.surface }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 48 }}>RESULTS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: T.borderDim }}>
            {caseStudies.map(cs => (
              <div key={cs.brand} style={{ background: T.bg, padding: '40px' }}>
                <div style={{ fontFamily: MONO, fontSize: 13, color: T.white, marginBottom: 8 }}>{cs.brand}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em', marginBottom: 28 }}>{cs.drop}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {cs.stats.map(s => (
                    <div key={s.label}>
                      <div style={{ fontFamily: MONO, fontSize: 28, color: T.white, fontWeight: 700 }}>{s.value}</div>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 48 }}>PRICING</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: T.borderDim }}>
            {pricing.map(p => (
              <div key={p.tier} style={{
                background: p.featured ? T.borderDim : T.bg,
                padding: '48px 36px',
                border: p.featured ? `1px solid ${T.borderVis}` : 'none',
                position: 'relative',
              }}>
                {p.featured && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    fontFamily: MONO, fontSize: 8, color: '#000', background: T.white,
                    padding: '3px 12px', letterSpacing: '0.2em',
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontFamily: MONO, fontSize: 10, color: T.gray, letterSpacing: '0.3em', marginBottom: 20 }}>{p.tier}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: MONO, fontSize: 36, color: T.white, fontWeight: 700 }}>{p.price}</span>
                  {p.period && <span style={{ fontFamily: MONO, fontSize: 10, color: T.grayMid }}>{p.period}</span>}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.grayMid, letterSpacing: '0.1em', marginBottom: 32 }}>{p.sub}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: T.gray, flexShrink: 0 }}>→</span>
                      <span style={{ fontFamily: BODY, fontSize: 13, color: T.gray, lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/brand/signup"
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '12px 0', fontFamily: MONO, fontSize: 10,
                    letterSpacing: '0.2em', textDecoration: 'none', textTransform: 'uppercase',
                    background: p.featured ? T.white : 'transparent',
                    color: p.featured ? '#000' : T.gray,
                    border: p.featured ? 'none' : `1px solid ${T.border}`,
                  }}
                >{p.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.gray, letterSpacing: '0.3em', marginBottom: 20 }}>READY?</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 40, color: T.white, fontWeight: 700, marginBottom: 24, letterSpacing: '-1px' }}>Launch your first drop on Rebl.</h2>
          <Link
            to="/brand/signup"
            style={{
              fontFamily: MONO, fontSize: 12, letterSpacing: '0.2em', color: '#000',
              background: T.white, textDecoration: 'none', padding: '16px 40px',
              display: 'inline-block', textTransform: 'uppercase',
            }}
          >Launch Your Brand →</Link>
        </div>
      </div>
    </div>
  )
}
