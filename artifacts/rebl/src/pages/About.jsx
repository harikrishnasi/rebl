import { Link } from 'react-router-dom'
import CrossHair from '@/components/CrossHair'

const C = {
  void: '#050508', cosmos: '#0A0A12', nebula: '#12121E',
  silver: '#A8B2C4', ghost: '#2A2A3E', cream: '#F0F4FF', dim: '#5A6380',
}

const VALUES = [
  { label: 'INTENTIONAL OVER IMPULSIVE', body: 'We build for people who collect with purpose. Every feature exists to help a collector understand what they own and why it matters.' },
  { label: 'VERIFIED OVER PERFORMED', body: 'Proof beats claims. We believe the future of collector culture is built on verified ownership, not follower counts or unsubstantiated flex.' },
  { label: 'COMMUNITY OVER AUDIENCE', body: 'There\'s a difference between people who watch and people who belong. Rebl is built for the latter.' },
]

export default function About() {
  return (
    <div style={{ backgroundColor: C.cosmos, minHeight: '100vh', color: C.cream, fontFamily: '"DM Sans", Inter, sans-serif' }}>
      <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.ghost}` }}>
        <Link to="/" style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, textDecoration: 'none', letterSpacing: '0.15em', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = C.silver}
          onMouseLeave={e => e.target.style.color = C.dim}
        >← REBL</Link>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px' }}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', marginBottom: 20 }}>ABOUT</div>
          <h1 style={{ fontFamily: '"Space Mono", monospace', fontSize: 'clamp(24px,4vw,48px)', fontWeight: 700, color: C.cream, margin: '0 0 32px', letterSpacing: '-1px', lineHeight: 1.15 }}>We're building the infrastructure for the post-mass-market era.</h1>
          <div style={{ height: 1, backgroundColor: C.ghost }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 64 }}>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 17, color: '#8090A8', lineHeight: 1.85, margin: 0 }}>
            Rebl was founded by a collector who was frustrated — frustrated by the gap between how much they cared about their collection and how little the existing tools supported that care.
          </p>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 17, color: '#8090A8', lineHeight: 1.85, margin: 0 }}>
            Instagram stores died in 24 hours. Discord servers were full of noise. There was no way to verify anything, no permanent record, no path to finding the other people who cared as much. The infrastructure for serious collectors didn't exist.
          </p>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 17, color: '#8090A8', lineHeight: 1.85, margin: 0 }}>
            India's collector culture is at an inflection point. The drops are happening. The communities are forming. The culture is building. Rebl exists to build the platform before the culture outgrows the tools available to it.
          </p>
        </div>

        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.silver, letterSpacing: '0.25em', marginBottom: 32 }}>VALUES</div>
          {VALUES.map((v, i) => (
            <div key={i}>
              {i > 0 && <div style={{ height: 1, backgroundColor: C.ghost, margin: '32px 0' }} />}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <CrossHair size={16} color={C.silver} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: C.silver, letterSpacing: '0.15em', marginBottom: 10 }}>{v.label}</div>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 15, color: '#8090A8', lineHeight: 1.75, margin: 0 }}>{v.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '32px', border: `1px solid ${C.ghost}` }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: C.dim, letterSpacing: '0.15em', marginBottom: 8 }}>TEAM</div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 16, color: C.cream }}>Team Rebl, India — 2025</div>
        </div>
      </div>
    </div>
  )
}
